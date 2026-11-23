import type { WeaponSprite } from './weaponArt.ts'

/** 每帧传给武器绘制层的动作参数 */
export interface WeaponMotion {
  /** 行走摆动（像素） */
  bobX: number
  bobY: number
  /** 后坐力 0~1 */
  recoil: number
  /** 枪口火焰强度 0~1 */
  flash: number
  /** 换弹动作幅度 0~1，起落各为 0 */
  reloadProgress: number
}

/** 贴图在画面中的基准比例：贴图高度占屏幕高度的比例 */
const SPRITE_HEIGHT_RATIO = 0.7
/** 枪口在屏幕上的目标位置：让枪身自然地从右下角伸向准星附近 */
const MUZZLE_ANCHOR_X = 0.64
const MUZZLE_ANCHOR_Y = 0.44

const drawMuzzleFlash = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  strength: number,
): void => {
  const alpha = 0.35 + strength * 0.65

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'

  const glow = ctx.createRadialGradient(x, y, 0, x, y, size)
  glow.addColorStop(0, `rgba(255, 253, 236, ${(0.95 * alpha).toFixed(3)})`)
  glow.addColorStop(0.28, `rgba(255, 216, 126, ${(0.85 * alpha).toFixed(3)})`)
  glow.addColorStop(0.62, `rgba(255, 156, 52, ${(0.45 * alpha).toFixed(3)})`)
  glow.addColorStop(1, 'rgba(255, 110, 18, 0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(x, y, size, 0, Math.PI * 2)
  ctx.fill()

  // 四向星芒，带一点随机长度制造闪烁感
  ctx.strokeStyle = `rgba(255, 236, 178, ${(0.55 * alpha).toFixed(3)})`
  ctx.lineWidth = Math.max(1.5, size * 0.045)
  for (let spike = 0; spike < 4; spike += 1) {
    const angle = (Math.PI / 2) * spike + (Math.random() - 0.5) * 0.45
    const length = size * (0.55 + Math.random() * 0.35)
    ctx.beginPath()
    ctx.moveTo(x + Math.cos(angle) * size * 0.2, y + Math.sin(angle) * size * 0.2)
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length)
    ctx.stroke()
  }

  ctx.restore()
}

/**
 * 第一人称武器视图：固定贴着画面右下角，只做平移 / 旋转，
 * 属于“屏幕空间贴图”，不参与 3D 投影，因此不受俯仰影响。
 */
export const drawWeapon = (
  ctx: CanvasRenderingContext2D,
  sprite: WeaponSprite,
  motion: WeaponMotion,
  width: number,
  height: number,
): void => {
  const gunHeight = height * SPRITE_HEIGHT_RATIO
  const gunWidth = gunHeight * (sprite.canvas.width / sprite.canvas.height)

  // 以“枪口”为锚点定位，缩放时枪口位置保持稳定，只朝右下角生长
  const restX = width * MUZZLE_ANCHOR_X - gunWidth * sprite.muzzleX
  const restY = height * MUZZLE_ANCHOR_Y - gunHeight * sprite.muzzleY

  const kickX = motion.recoil * width * 0.008
  const kickY = motion.recoil * height * 0.016
  const reloadDrop = motion.reloadProgress * height * 0.26

  const centerX = restX + gunWidth / 2 + motion.bobX + kickX
  const centerY = restY + gunHeight / 2 + motion.bobY + reloadDrop + kickY
  const rotation = -0.035 + motion.recoil * 0.035 + motion.reloadProgress * 0.42

  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.rotate(rotation)
  ctx.drawImage(sprite.canvas, -gunWidth / 2, -gunHeight / 2, gunWidth, gunHeight)

  if (motion.flash > 0) {
    const muzzleX = -gunWidth / 2 + gunWidth * sprite.muzzleX
    const muzzleY = -gunHeight / 2 + gunHeight * sprite.muzzleY
    drawMuzzleFlash(ctx, muzzleX, muzzleY, gunHeight * 0.11, motion.flash)
  }

  ctx.restore()
}
