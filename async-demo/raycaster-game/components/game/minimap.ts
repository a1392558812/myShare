import { MAP_HEIGHT, MAP_WIDTH, cellAt } from './map.ts'
import type { PlayerState } from './types.ts'

const WALL_COLORS: Record<number, string> = {
  1: '#414f6b',
  2: '#834c3c',
  3: '#3d6b55',
  4: '#5b5184',
}

const FALLBACK_WALL_COLOR = '#4a5568'

/**
 * 右上角的小地图：静态墙体 + 玩家朝向 + 视野扇形。
 * size 为画布的物理像素边长（已含 devicePixelRatio）。
 */
export const drawMinimap = (
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  size: number,
): void => {
  const cell = size / MAP_WIDTH

  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = 'rgba(7, 11, 19, 0.86)'
  ctx.fillRect(0, 0, size, size)

  for (let y = 0; y < MAP_HEIGHT; y += 1) {
    for (let x = 0; x < MAP_WIDTH; x += 1) {
      const value = cellAt(x, y)
      if (value === 0) continue
      ctx.fillStyle = WALL_COLORS[value] ?? FALLBACK_WALL_COLOR
      ctx.fillRect(x * cell, y * cell, cell, cell)
    }
  }

  const px = player.x * cell
  const py = player.y * cell

  const fov = Math.PI / 3
  const radius = cell * 3.2
  ctx.fillStyle = 'rgba(86, 227, 255, 0.16)'
  ctx.beginPath()
  ctx.moveTo(px, py)
  ctx.arc(px, py, radius, player.yaw - fov / 2, player.yaw + fov / 2)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = 'rgba(86, 227, 255, 0.5)'
  ctx.lineWidth = Math.max(1, cell * 0.08)
  ctx.beginPath()
  ctx.moveTo(px, py)
  ctx.lineTo(px + Math.cos(player.yaw) * radius, py + Math.sin(player.yaw) * radius)
  ctx.stroke()

  ctx.fillStyle = '#ffd166'
  ctx.beginPath()
  ctx.arc(px, py, Math.max(2, cell * 0.42), 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)'
  ctx.lineWidth = Math.max(1, cell * 0.12)
  ctx.beginPath()
  ctx.arc(px, py, Math.max(3, cell * 0.42), 0, Math.PI * 2)
  ctx.stroke()
}
