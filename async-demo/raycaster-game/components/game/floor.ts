import { FOV, getPitchOffset, WALL_HEIGHT_RATIO } from './view.ts'
import type { PlayerState } from './types.ts'

interface Rgb {
  r: number
  g: number
  b: number
}

interface BackdropBuffer {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  image: ImageData
  width: number
  height: number
}

const FLOOR_TILES: readonly [Rgb, Rgb] = [
  { r: 46, g: 55, b: 76 },
  { r: 33, g: 40, b: 57 },
]

const CEILING_TILES: readonly [Rgb, Rgb] = [
  { r: 31, g: 37, b: 53 },
  { r: 24, g: 29, b: 42 },
]

/** 远景雾色，与墙体雾化目标保持一致，避免墙脚出现断层 */
const FOG: Rgb = { r: 17, g: 24, b: 38 }

/** 地板最远投射距离，超过后直接取雾色 */
const MAX_FLOOR_DEPTH = 18
/** 背景缓冲不超过这个宽度，控制逐像素计算量 */
const MAX_BUFFER_WIDTH = 960

let buffer: BackdropBuffer | null = null

const createBuffer = (width: number, height: number): BackdropBuffer => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建背景离屏画布')
  return { canvas, ctx, image: ctx.createImageData(width, height), width, height }
}

const ensureBuffer = (width: number, height: number): BackdropBuffer => {
  if (!buffer || buffer.width !== width || buffer.height !== height) {
    buffer = createBuffer(width, height)
  }
  return buffer
}

const mixChannel = (base: number, target: number, amount: number): number =>
  base + (target - base) * amount

/**
 * 地板 / 天花板透视投射。
 *
 * 相机水平时，地面上的等距圆环会投影成一条条水平扫描线，
 * 因此同一行所有像素的世界距离完全相同：逐行算一次距离，逐列只做坐标累加，
 * 结果以半分辨率 ImageData 渲染后再放大，成本远低于逐像素三角函数。
 */
export const renderFloorCeiling = (
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  width: number,
  height: number,
): void => {
  const scale = Math.min(0.5, MAX_BUFFER_WIDTH / Math.max(width, 1))
  const bufferWidth = Math.max(2, Math.round(width * scale))
  const bufferHeight = Math.max(2, Math.round(height * scale))

  const target = ensureBuffer(bufferWidth, bufferHeight)
  const { data } = target.image

  const dirX = Math.cos(player.yaw)
  const dirY = Math.sin(player.yaw)
  const planeScale = Math.tan(FOV / 2)
  const planeX = -dirY * planeScale
  const planeY = dirX * planeScale

  const horizon = bufferHeight / 2 + getPitchOffset(player.pitch, height) * scale
  // 眼睛高度决定地板与天花板各自的透视投影尺度，跳跃 / 下蹲时两者都会变化
  const floorScalePixels = player.eyeHeight * height * WALL_HEIGHT_RATIO
  const ceilingScalePixels = (1 - player.eyeHeight) * height * WALL_HEIGHT_RATIO

  for (let y = 0; y < bufferHeight; y += 1) {
    const isFloor = y >= horizon
    const offsetFromHorizon = Math.abs(y - horizon) / scale
    const maxDistancePixels = isFloor ? floorScalePixels : ceilingScalePixels
    const distance = Math.min(
      MAX_FLOOR_DEPTH,
      offsetFromHorizon < 0.5 ? MAX_FLOOR_DEPTH : maxDistancePixels / offsetFromHorizon,
    )

    const fog = Math.min(1, distance <= 1 ? 0 : (distance - 1) / (MAX_FLOOR_DEPTH - 1)) ** 1.35
    const tiles = isFloor ? FLOOR_TILES : CEILING_TILES
    const darken = isFloor ? 1 : 0.86

    const tileColors: Rgb[] = tiles.map((tile) => ({
      r: mixChannel(tile.r * darken, FOG.r, fog),
      g: mixChannel(tile.g * darken, FOG.g, fog),
      b: mixChannel(tile.b * darken, FOG.b, fog),
    }))

    // 每列的世界坐标增量：cameraX 从 -1 到 1，均匀步进
    const stepX = distance * planeX * (2 / bufferWidth)
    const stepY = distance * planeY * (2 / bufferWidth)
    let floorX = player.x + distance * (dirX - planeX)
    let floorY = player.y + distance * (dirY - planeY)

    for (let x = 0; x < bufferWidth; x += 1) {
      const index = (y * bufferWidth + x) * 4
      const tile = tileColors[((Math.floor(floorX * 4) + Math.floor(floorY * 4)) & 1)] ?? tileColors[0]
      data[index] = tile.r
      data[index + 1] = tile.g
      data[index + 2] = tile.b
      data[index + 3] = 255
      floorX += stepX
      floorY += stepY
    }
  }

  target.ctx.putImageData(target.image, 0, 0)
  ctx.imageSmoothingEnabled = true
  ctx.drawImage(target.canvas, 0, 0, width, height)
}
