import { CAMERA_EASING } from '../constants.js'

export function useMap(camera) {
  
  const toScreen = (lx, ly, ctx) => {
    const w = ctx.canvas ? ctx.canvas.width : ctx.width
    const h = ctx.canvas ? ctx.canvas.height : ctx.height
    return {
      x: lx - camera.x + w / 2,
      y: ly - camera.y + h / 2,
    }
  }

  
  const toLogical = (sx, sy, ctx) => {
    const w = ctx.canvas ? ctx.canvas.width : ctx.width
    const h = ctx.canvas ? ctx.canvas.height : ctx.height
    return {
      x: sx + camera.x - w / 2,
      y: sy + camera.y - h / 2,
    }
  }


  const checkCollision = (x1, y1, s1, x2, y2, s2) => {
    const dx = x1 - x2
    const dy = y1 - y2
    return Math.sqrt(dx * dx + dy * dy) < (s1 + s2) / 2 * 0.8
  }

  
  const updateCamera = (playerX, playerY) => {
    camera.x += (playerX - camera.x) * CAMERA_EASING
    camera.y += (playerY - camera.y) * CAMERA_EASING
  }

  return { toScreen, toLogical, checkCollision, updateCamera }
}
