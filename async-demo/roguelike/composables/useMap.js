/**
 * useMap — 地图数据管理、碰撞检测、视野计算
 * 负责坐标系转换、摄像机跟随、碰撞判定、背景网格绘制
 */
import { CAMERA_EASING } from '../constants.js'

export function useMap(camera) {
  /**
   * 逻辑坐标 → 屏幕坐标
   * @param {number} lx - 逻辑 X
   * @param {number} ly - 逻辑 Y
   * @param {CanvasRenderingContext2D|{width:number,height:number}} ctx
   * @returns {{x:number, y:number}}
   */
  const toScreen = (lx, ly, ctx) => {
    const w = ctx.canvas ? ctx.canvas.width : ctx.width
    const h = ctx.canvas ? ctx.canvas.height : ctx.height
    return {
      x: lx - camera.x + w / 2,
      y: ly - camera.y + h / 2,
    }
  }

  /**
   * 屏幕坐标 → 逻辑坐标
   * @param {number} sx - 屏幕 X
   * @param {number} sy - 屏幕 Y
   * @param {CanvasRenderingContext2D|{width:number,height:number}} ctx
   * @returns {{x:number, y:number}}
   */
  const toLogical = (sx, sy, ctx) => {
    const w = ctx.canvas ? ctx.canvas.width : ctx.width
    const h = ctx.canvas ? ctx.canvas.height : ctx.height
    return {
      x: sx + camera.x - w / 2,
      y: sy + camera.y - h / 2,
    }
  }

  /**
   * 两个圆形实体碰撞检测（使用 0.8 系数避免边缘像素粘连）
   */
  const checkCollision = (x1, y1, s1, x2, y2, s2) => {
    const dx = x1 - x2
    const dy = y1 - y2
    return Math.sqrt(dx * dx + dy * dy) < (s1 + s2) / 2 * 0.8
  }

  /**
   * 摄像机缓动跟随玩家
   */
  const updateCamera = (playerX, playerY) => {
    camera.x += (playerX - camera.x) * CAMERA_EASING
    camera.y += (playerY - camera.y) * CAMERA_EASING
  }

  return { toScreen, toLogical, checkCollision, updateCamera }
}
