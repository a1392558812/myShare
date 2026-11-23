import { renderFloorCeiling } from './floor.ts'
import { cellAt, MAP_HEIGHT, MAP_WIDTH } from './map.ts'
import { COLUMN_WIDTH, FOV, getPitchOffset, MAX_DEPTH, WALL_HEIGHT_RATIO } from './view.ts'
import type { PlayerState, RayHit } from './types.ts'

const MAX_STEPS = 96

interface Rgb {
  r: number
  g: number
  b: number
}

const WALL_PALETTE: Record<number, Rgb> = {
  1: { r: 96, g: 108, b: 132 },
  2: { r: 158, g: 98, b: 80 },
  3: { r: 92, g: 138, b: 114 },
  4: { r: 130, g: 112, b: 168 },
}

const FALLBACK_WALL: Rgb = { r: 120, g: 120, b: 130 }

/** 远景雾色，与天空/地平线保持一致，避免墙根“切断感” */
const FOG: Rgb = { r: 17, g: 24, b: 38 }

/** DDA 网格步进求交，返回垂直距离而不是欧氏距离 */
export const castRay = (originX: number, originY: number, rayDirX: number, rayDirY: number): RayHit | null => {
  let mapX = Math.floor(originX)
  let mapY = Math.floor(originY)

  const deltaDistX = rayDirX === 0 ? Number.POSITIVE_INFINITY : Math.abs(1 / rayDirX)
  const deltaDistY = rayDirY === 0 ? Number.POSITIVE_INFINITY : Math.abs(1 / rayDirY)

  const stepX = rayDirX < 0 ? -1 : 1
  const stepY = rayDirY < 0 ? -1 : 1

  let sideDistX = rayDirX < 0 ? (originX - mapX) * deltaDistX : (mapX + 1 - originX) * deltaDistX
  let sideDistY = rayDirY < 0 ? (originY - mapY) * deltaDistY : (mapY + 1 - originY) * deltaDistY

  let side: 0 | 1 = 0
  let cell = 0

  for (let step = 0; step < MAX_STEPS; step += 1) {
    if (sideDistX < sideDistY) {
      sideDistX += deltaDistX
      mapX += stepX
      side = 0
    } else {
      sideDistY += deltaDistY
      mapY += stepY
      side = 1
    }

    if (mapX < 0 || mapY < 0 || mapX >= MAP_WIDTH || mapY >= MAP_HEIGHT) return null

    cell = cellAt(mapX, mapY)
    if (cell > 0) {
      const distance = side === 0 ? sideDistX - deltaDistX : sideDistY - deltaDistY
      if (distance > MAX_DEPTH) return null
      const hitX = originX + distance * rayDirX
      const hitY = originY + distance * rayDirY
      const wallCoord = side === 0 ? hitY : hitX
      return {
        distance: Math.max(distance, 0.0001),
        side,
        cell,
        wallCoord: wallCoord - Math.floor(wallCoord),
      }
    }
  }

  return null
}

const mix = (base: Rgb, target: Rgb, amount: number): string => {
  const k = Math.min(Math.max(amount, 0), 1)
  const r = Math.round(base.r + (target.r - base.r) * k)
  const g = Math.round(base.g + (target.g - base.g) * k)
  const b = Math.round(base.b + (target.b - base.b) * k)
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * 准星：固定屏幕中心，`emphasis` 用于开火瞬间的短暂放大与提亮。
 */
export const drawCrosshair = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  emphasis = 0,
): void => {
  const cx = Math.floor(width / 2)
  const cy = Math.floor(height / 2)
  const gap = Math.max(3, Math.round(height * 0.008)) + emphasis * height * 0.006
  const len = Math.max(6, Math.round(height * 0.022)) + emphasis * height * 0.004
  const alpha = 0.62 + emphasis * 0.3

  ctx.strokeStyle = emphasis > 0.02 ? `rgba(150, 244, 255, ${alpha.toFixed(3)})` : 'rgba(214, 244, 255, 0.62)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx - gap - len, cy)
  ctx.lineTo(cx - gap, cy)
  ctx.moveTo(cx + gap, cy)
  ctx.lineTo(cx + gap + len, cy)
  ctx.moveTo(cx, cy - gap - len)
  ctx.lineTo(cx, cy - gap)
  ctx.moveTo(cx, cy + gap)
  ctx.lineTo(cx, cy + gap + len)
  ctx.stroke()
}

const drawWallColumn = (
  ctx: CanvasRenderingContext2D,
  hit: RayHit,
  column: number,
  height: number,
  pitchOffset: number,
  eyeHeight: number,
): void => {
  const sliceHeight = Math.min(height * 3, (height * WALL_HEIGHT_RATIO) / Math.max(hit.distance, 0.05))
  // 眼睛越高，墙面在屏幕上的整体位置越靠下（墙脚跟着下沉），跳跃 / 下蹲因此可见
  const drawStart = height / 2 + pitchOffset - (1 - eyeHeight) * sliceHeight
  const x = column * COLUMN_WIDTH

  const base = WALL_PALETTE[hit.cell] ?? FALLBACK_WALL
  const light = Math.max(0.2, 1 - hit.distance / MAX_DEPTH)
  const sideShade = hit.side === 1 ? 0.76 : 1
  const brightness = (0.4 + 0.6 * light) * sideShade
  const fog = Math.pow(hit.distance / MAX_DEPTH, 1.5)

  const color = mix(
    { r: base.r * brightness, g: base.g * brightness, b: base.b * brightness },
    FOG,
    fog,
  )
  ctx.fillStyle = color
  ctx.fillRect(x, drawStart, COLUMN_WIDTH, sliceHeight)

  // 墙根压暗 + 墙顶高光，用一个矩形代替逐列渐变，成本低但体积感明显
  ctx.fillStyle = `rgba(4, 6, 12, ${(0.22 * (1 - fog)).toFixed(3)})`
  ctx.fillRect(x, drawStart + sliceHeight * 0.6, COLUMN_WIDTH, sliceHeight * 0.4)
  ctx.fillStyle = `rgba(255, 255, 255, ${(0.06 * (1 - fog)).toFixed(3)})`
  ctx.fillRect(x, drawStart, COLUMN_WIDTH, Math.max(1, sliceHeight * 0.06))

  if (sliceHeight < 8) return

  // 程序化砖缝：纵向每格 4 块砖，横向 3 皮，靠距离衰减透明度
  const seamAlpha = 0.26 * (1 - fog)
  if (seamAlpha <= 0.02) return

  ctx.fillStyle = `rgba(8, 10, 16, ${seamAlpha.toFixed(3)})`
  const localX = hit.wallCoord
  const offset = localX % 0.25
  const distanceToSeam = Math.min(offset, 0.25 - offset)
  if (distanceToSeam < 0.012 || localX < 0.02 || localX > 0.98) {
    ctx.fillRect(x, drawStart, COLUMN_WIDTH, sliceHeight)
  }

  const lineHeight = Math.max(1, Math.min(3, Math.round(sliceHeight / 90)))
  for (let row = 1; row < 3; row += 1) {
    ctx.fillRect(x, drawStart + (sliceHeight * row) / 3, COLUMN_WIDTH, lineHeight)
  }
}

/**
 * 逐列投射射线并绘制墙体切片，这是伪 3D 的核心：
 * 屏幕上一列 = 一根射线，距离越远，墙切片越矮。
 */
export const renderScene = (
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  width: number,
  height: number,
): void => {
  renderFloorCeiling(ctx, player, width, height)

  const planeScale = Math.tan(FOV / 2)
  const dirX = Math.cos(player.yaw)
  const dirY = Math.sin(player.yaw)
  const planeX = -dirY * planeScale
  const planeY = dirX * planeScale

  const columns = Math.ceil(width / COLUMN_WIDTH)
  // 俯仰只做整屏竖直位移：地平线上下移动，射线本身仍是水平的
  const pitchOffset = getPitchOffset(player.pitch, height)

  for (let column = 0; column < columns; column += 1) {
    const sampleX = column * COLUMN_WIDTH + COLUMN_WIDTH / 2
    // 把屏幕列映射到 [-1, 1] 的摄像机平面坐标
    const cameraX = (2 * sampleX) / width - 1
    const rayDirX = dirX + planeX * cameraX
    const rayDirY = dirY + planeY * cameraX

    const hit = castRay(player.x, player.y, rayDirX, rayDirY)
    if (!hit) continue

    drawWallColumn(ctx, hit, column, height, pitchOffset, player.eyeHeight)
  }
}
