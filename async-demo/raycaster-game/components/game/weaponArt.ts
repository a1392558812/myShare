/**
 * 第一人称 AK-47 的离屏贴图用 Canvas 2D 路径绘制到离屏画布，运行时只做一次 drawImage，避免逐帧重建大量路径带来的开销。
 */

/** 贴图设计稿尺寸（CSS 像素），实际画布按 DPR 放大 */
const DESIGN_WIDTH = 1200
const DESIGN_HEIGHT = 900
/** 枪身在贴图中的倾角：枪口指向左上，枪托落在右下 */
const GUN_TILT = Math.PI / 6
/** 局部坐标（枪口为原点、枪管方向为 +x）到设计稿坐标的缩放 */
const LOCAL_SCALE = 0.9
/** 枪口在设计稿中的落点，决定整张贴图的构图 */
const MUZZLE_ORIGIN_X = 62
const MUZZLE_ORIGIN_Y = 152

/** 离屏武器贴图 */
export interface WeaponSprite {
  /** 离屏画布，尺寸按 DPR 放大 */
  canvas: HTMLCanvasElement
  /** 枪口在贴图中的归一化横向坐标（0~1） */
  muzzleX: number
  /** 枪口在贴图中的归一化纵向坐标（0~1） */
  muzzleY: number
}

/** 木纹渐变 */
const woodGradient = (
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): CanvasGradient => {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1)
  gradient.addColorStop(0, '#3f1e0c')
  gradient.addColorStop(0.34, '#7c401a')
  gradient.addColorStop(0.62, '#92501f')
  gradient.addColorStop(1, '#331607')
  return gradient
}

/** 金属渐变 */
const steelGradient = (
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): CanvasGradient => {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1)
  gradient.addColorStop(0, '#707984')
  gradient.addColorStop(0.24, '#474e57')
  gradient.addColorStop(0.58, '#23272d')
  gradient.addColorStop(1, '#0f1115')
  return gradient
}

/** 战术手套渐变 */
const gloveGradient = (
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): CanvasGradient => {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1)
  gradient.addColorStop(0, '#3f4650')
  gradient.addColorStop(0.42, '#242a31')
  gradient.addColorStop(1, '#0f1216')
  return gradient
}

/** 衣袖渐变 */
const sleeveGradient = (
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): CanvasGradient => {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1)
  gradient.addColorStop(0, '#2c323a')
  gradient.addColorStop(0.5, '#1e2329')
  gradient.addColorStop(1, '#0d1014')
  return gradient
}

const fillRounded = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string | CanvasGradient,
): void => {
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, radius)
  ctx.fillStyle = fill
  ctx.fill()
}

const strokeRounded = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  stroke: string,
  lineWidth: number,
): void => {
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, radius)
  ctx.strokeStyle = stroke
  ctx.lineWidth = lineWidth
  ctx.stroke()
}

/** 枪托 */
const drawStock = (ctx: CanvasRenderingContext2D): void => {
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(1042, -50)
  ctx.lineTo(1206, -34)
  ctx.quadraticCurveTo(1240, -28, 1244, 8)
  ctx.lineTo(1240, 104)
  ctx.quadraticCurveTo(1194, 122, 1134, 104)
  ctx.lineTo(1050, 68)
  ctx.closePath()
  ctx.fillStyle = woodGradient(ctx, 1042, -50, 1244, 104)
  ctx.fill()
  ctx.strokeStyle = 'rgba(24, 10, 2, 0.55)'
  ctx.lineWidth = 4
  ctx.stroke()

  // 木纹
  ctx.strokeStyle = 'rgba(58, 26, 8, 0.42)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(1068, -18)
  ctx.quadraticCurveTo(1132, 8, 1210, 6)
  ctx.moveTo(1064, 20)
  ctx.quadraticCurveTo(1132, 46, 1216, 40)
  ctx.stroke()

  // 上沿高光
  ctx.strokeStyle = 'rgba(255, 198, 134, 0.16)'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(1050, -40)
  ctx.quadraticCurveTo(1150, -24, 1232, -16)
  ctx.stroke()

  // 托底板
  ctx.beginPath()
  ctx.moveTo(1212, -30)
  ctx.lineTo(1246, 4)
  ctx.lineTo(1240, 108)
  ctx.lineTo(1194, 120)
  ctx.closePath()
  ctx.fillStyle = '#171a1e'
  ctx.fill()
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.restore()
}

/** 机匣 */
const drawReceiver = (ctx: CanvasRenderingContext2D): void => {
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)'
  ctx.shadowBlur = 22
  ctx.shadowOffsetY = 14
  fillRounded(ctx, 628, -50, 444, 122, 11, steelGradient(ctx, 0, -50, 0, 72))
  ctx.restore()

  // 机匣盖
  fillRounded(ctx, 650, -58, 386, 32, 12, steelGradient(ctx, 0, -58, 0, -26))
  strokeRounded(ctx, 650, -58, 386, 32, 12, 'rgba(0, 0, 0, 0.5)', 3)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.13)'
  ctx.fillRect(666, -53, 352, 4)

  // 抛壳窗与枪机
  fillRounded(ctx, 692, -14, 108, 44, 8, '#0a0c0f')
  fillRounded(ctx, 700, -8, 62, 30, 6, steelGradient(ctx, 0, -8, 0, 22))

  // 拉机柄
  fillRounded(ctx, 1014, -8, 46, 16, 7, '#39404a')
  ctx.beginPath()
  ctx.arc(1052, 0, 11, 0, Math.PI * 2)
  ctx.fillStyle = '#4b535e'
  ctx.fill()
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.lineWidth = 3
  ctx.stroke()

  // 机匣铆钉
  for (let rivet = 0; rivet < 3; rivet += 1) {
    ctx.beginPath()
    ctx.arc(678 + rivet * 118, 42, 6, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(20, 23, 27, 0.9)'
    ctx.fill()
  }

  // 快慢机拨片
  ctx.strokeStyle = '#59616c'
  ctx.lineWidth = 10
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(836, -4)
  ctx.lineTo(908, 12)
  ctx.stroke()

  // 照门
  ctx.beginPath()
  ctx.moveTo(640, -58)
  ctx.lineTo(700, -58)
  ctx.lineTo(690, -82)
  ctx.lineTo(650, -82)
  ctx.closePath()
  ctx.fillStyle = '#20252b'
  ctx.fill()
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.lineWidth = 3
  ctx.stroke()
}

/** 握把、扳机护圈与扳机 */
const drawPistolGrip = (ctx: CanvasRenderingContext2D): void => {
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(984, 56)
  ctx.lineTo(1048, 48)
  ctx.quadraticCurveTo(1064, 128, 1084, 216)
  ctx.quadraticCurveTo(1090, 240, 1062, 246)
  ctx.lineTo(1000, 228)
  ctx.quadraticCurveTo(1006, 144, 984, 92)
  ctx.closePath()
  const grip = ctx.createLinearGradient(984, 56, 1084, 240)
  grip.addColorStop(0, '#3b4149')
  grip.addColorStop(0.45, '#23282e')
  grip.addColorStop(1, '#0f1216')
  ctx.fillStyle = grip
  ctx.fill()
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)'
  ctx.lineWidth = 4
  ctx.stroke()

  // 握把防滑槽
  for (let groove = 0; groove < 3; groove += 1) {
    ctx.beginPath()
    ctx.moveTo(1004 + groove * 6, 106 + groove * 40)
    ctx.quadraticCurveTo(1032 + groove * 6, 120 + groove * 40, 1060 + groove * 4, 112 + groove * 40)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.42)'
    ctx.lineWidth = 9
    ctx.stroke()
  }

  // 扳机护圈
  ctx.strokeStyle = '#2b3037'
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(938, 76)
  ctx.quadraticCurveTo(948, 146, 1008, 142)
  ctx.stroke()

  // 扳机
  ctx.strokeStyle = '#4c545e'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(966, 78)
  ctx.quadraticCurveTo(974, 106, 958, 122)
  ctx.stroke()
  ctx.restore()
}

/** 弯弹匣：加强筋裁剪在弹匣轮廓内 */
const drawMagazine = (ctx: CanvasRenderingContext2D): void => {
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(744, 62)
  ctx.lineTo(806, 62)
  ctx.bezierCurveTo(836, 170, 806, 270, 764, 318)
  ctx.lineTo(700, 308)
  ctx.bezierCurveTo(660, 200, 684, 102, 744, 62)
  ctx.closePath()
  const body = ctx.createLinearGradient(672, 60, 830, 300)
  body.addColorStop(0, '#4a525c')
  body.addColorStop(0.35, '#2b3138')
  body.addColorStop(1, '#101317')
  ctx.fillStyle = body
  ctx.fill()
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)'
  ctx.lineWidth = 4
  ctx.stroke()

  ctx.clip()
  for (let rib = 0; rib < 7; rib += 1) {
    const ribTop = 76 + rib * 38
    ctx.beginPath()
    ctx.moveTo(630, ribTop + 24)
    ctx.lineTo(860, ribTop - 2)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.34)'
    ctx.lineWidth = 8
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(630, ribTop + 30)
    ctx.lineTo(860, ribTop + 4)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
    ctx.lineWidth = 4
    ctx.stroke()
  }

  // 前缘高光与弹匣底板
  ctx.beginPath()
  ctx.moveTo(748, 74)
  ctx.bezierCurveTo(688, 134, 668, 214, 698, 300)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.lineWidth = 7
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(700, 308)
  ctx.lineTo(764, 318)
  ctx.lineTo(768, 330)
  ctx.lineTo(702, 320)
  ctx.closePath()
  ctx.fillStyle = '#1b1f24'
  ctx.fill()
  ctx.restore()
}

/** 上下护木、散热孔、导气管与导气箍 */
const drawHandguard = (ctx: CanvasRenderingContext2D): void => {
  fillRounded(ctx, 384, 6, 274, 64, 22, woodGradient(ctx, 384, 6, 658, 70))
  strokeRounded(ctx, 384, 6, 274, 64, 22, 'rgba(30, 12, 3, 0.6)', 4)

  for (let vent = 0; vent < 3; vent += 1) {
    fillRounded(ctx, 424 + vent * 56, 26, 34, 20, 10, 'rgba(18, 8, 2, 0.7)')
    fillRounded(ctx, 424 + vent * 56, 28, 34, 5, 3, 'rgba(255, 190, 130, 0.12)')
  }

  // 上护木
  fillRounded(ctx, 396, -46, 216, 32, 15, woodGradient(ctx, 396, -46, 612, -14))
  strokeRounded(ctx, 396, -46, 216, 32, 15, 'rgba(30, 12, 3, 0.55)', 4)
  ctx.fillStyle = 'rgba(255, 205, 150, 0.14)'
  ctx.fillRect(410, -42, 186, 3)

  // 导气管
  fillRounded(ctx, 286, -34, 124, 17, 8, steelGradient(ctx, 286, -34, 286, -17))

  // 导气箍
  ctx.beginPath()
  ctx.moveTo(318, -56)
  ctx.lineTo(372, -56)
  ctx.lineTo(382, 14)
  ctx.lineTo(326, 14)
  ctx.closePath()
  ctx.fillStyle = steelGradient(ctx, 318, -56, 318, 14)
  ctx.fill()
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.lineWidth = 4
  ctx.stroke()
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.fillRect(330, -52, 36, 4)
}

/** 枪管、通条、斜切枪口装置、准星座 */
const drawBarrel = (ctx: CanvasRenderingContext2D): void => {
  fillRounded(ctx, 14, -11, 336, 22, 10, steelGradient(ctx, 0, -11, 0, 11))
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.fillRect(30, -9, 300, 3)

  // 通条
  fillRounded(ctx, 36, 12, 260, 8, 4, '#394049')
  fillRounded(ctx, 36, 12, 260, 3, 2, 'rgba(255, 255, 255, 0.1)')

  // 枪口装置：斜切端面 + 泄气槽
  ctx.beginPath()
  ctx.moveTo(-14, -17)
  ctx.lineTo(38, -17)
  ctx.lineTo(52, 15)
  ctx.lineTo(-14, 15)
  ctx.closePath()
  ctx.fillStyle = steelGradient(ctx, -14, -17, -14, 15)
  ctx.fill()
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)'
  ctx.lineWidth = 4
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(8, 0, 7, 9, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#040507'
  ctx.fill()
  fillRounded(ctx, 22, -13, 6, 26, 3, 'rgba(6, 8, 10, 0.85)')
  fillRounded(ctx, 32, -12, 6, 24, 3, 'rgba(6, 8, 10, 0.85)')

  // 准星座
  ctx.beginPath()
  ctx.moveTo(148, -9)
  ctx.lineTo(200, -9)
  ctx.lineTo(193, -50)
  ctx.lineTo(165, -50)
  ctx.closePath()
  ctx.fillStyle = steelGradient(ctx, 148, -50, 148, -9)
  ctx.fill()
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.lineWidth = 4
  ctx.stroke()
  fillRounded(ctx, 156, -82, 13, 36, 6, steelGradient(ctx, 156, -82, 156, -46))
  fillRounded(ctx, 184, -82, 13, 36, 6, steelGradient(ctx, 184, -82, 184, -46))
  fillRounded(ctx, 175, -84, 5, 26, 2, '#0b0d10')
  ctx.beginPath()
  ctx.arc(176, -52, 7, 0, Math.PI * 2)
  ctx.fillStyle = '#14171b'
  ctx.fill()
}

/** 左手 */
const drawLeftHand = (ctx: CanvasRenderingContext2D): void => {
  ctx.save()

  ctx.beginPath()
  ctx.moveTo(470, 72)
  ctx.quadraticCurveTo(444, 300, 428, 726)
  ctx.lineTo(552, 750)
  ctx.quadraticCurveTo(570, 320, 560, 70)
  ctx.closePath()
  ctx.fillStyle = sleeveGradient(ctx, 400, 120, 590, 750)
  ctx.fill()
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)'
  ctx.lineWidth = 4
  ctx.stroke()

  // 衣袖布褶
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(478, 120)
  ctx.quadraticCurveTo(462, 330, 452, 560)
  ctx.moveTo(552, 130)
  ctx.quadraticCurveTo(560, 360, 546, 600)
  ctx.stroke()

  // 袖口罗纹
  fillRounded(ctx, 444, 250, 130, 44, 16, '#171b20')
  for (let seam = 0; seam < 3; seam += 1) {
    ctx.beginPath()
    ctx.moveTo(452, 262 + seam * 12)
    ctx.lineTo(566, 256 + seam * 12)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
    ctx.lineWidth = 3
    ctx.stroke()
  }

  // 手背
  ctx.translate(506, 42)
  ctx.rotate(-0.14)
  fillRounded(ctx, -82, -48, 164, 96, 40, gloveGradient(ctx, -82, -48, 82, 48))
  strokeRounded(ctx, -82, -48, 164, 96, 40, 'rgba(0, 0, 0, 0.5)', 4)

  // 指节护片
  for (let knuckle = 0; knuckle < 4; knuckle += 1) {
    fillRounded(ctx, -66 + knuckle * 34, -42, 26, 16, 7, 'rgba(76, 84, 95, 0.92)')
  }

  // 四指翻到护木上方，形成抓握
  for (let finger = 0; finger < 4; finger += 1) {
    ctx.save()
    ctx.translate(-66 + finger * 36, 34)
    ctx.rotate(-0.1 + finger * 0.02)
    fillRounded(ctx, -17, -64, 34, 78, 15, gloveGradient(ctx, -17, -64, 17, 14))
    strokeRounded(ctx, -17, -64, 34, 78, 15, 'rgba(0, 0, 0, 0.45)', 3)
    fillRounded(ctx, -11, -58, 22, 14, 6, 'rgba(255, 255, 255, 0.08)')
    ctx.restore()
  }

  // 拇指压在护木下沿
  ctx.save()
  ctx.translate(64, 20)
  ctx.rotate(0.62)
  fillRounded(ctx, -18, -20, 36, 84, 16, gloveGradient(ctx, -18, -20, 18, 64))
  strokeRounded(ctx, -18, -20, 36, 84, 16, 'rgba(0, 0, 0, 0.45)', 3)
  ctx.restore()

  ctx.restore()
}

/** 右手 */
const drawRightHand = (ctx: CanvasRenderingContext2D): void => {
  ctx.save()

  ctx.beginPath()
  ctx.moveTo(1010, 196)
  ctx.quadraticCurveTo(1110, 250, 1258, 372)
  ctx.lineTo(1258, 474)
  ctx.quadraticCurveTo(1096, 344, 966, 268)
  ctx.closePath()
  ctx.fillStyle = sleeveGradient(ctx, 960, 160, 1258, 470)
  ctx.fill()
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)'
  ctx.lineWidth = 4
  ctx.stroke()

  // 袖口
  ctx.save()
  ctx.translate(1158, 322)
  ctx.rotate(0.6)
  fillRounded(ctx, -80, -22, 160, 42, 15, '#171b20')
  ctx.restore()

  // 手背覆盖握把，指节朝枪口方向
  ctx.save()
  ctx.translate(1002, 142)
  ctx.rotate(0.86)
  fillRounded(ctx, -82, -62, 164, 124, 48, gloveGradient(ctx, -82, -62, 82, 62))
  strokeRounded(ctx, -82, -62, 164, 124, 48, 'rgba(0, 0, 0, 0.5)', 4)
  for (let knuckle = 0; knuckle < 4; knuckle += 1) {
    fillRounded(ctx, -58 + knuckle * 31, -54, 24, 16, 7, 'rgba(86, 95, 107, 0.95)')
  }
  // 腕口
  fillRounded(ctx, -58, 44, 116, 26, 12, 'rgba(12, 14, 17, 0.8)')
  ctx.restore()

  // 四指短促地绕过握把前缘
  for (let finger = 0; finger < 4; finger += 1) {
    ctx.save()
    ctx.translate(958 + finger * 2, 96 + finger * 30)
    ctx.rotate(1.12)
    fillRounded(ctx, -15, -27, 30, 54, 13, gloveGradient(ctx, -15, -27, 15, 27))
    strokeRounded(ctx, -15, -27, 30, 54, 13, 'rgba(0, 0, 0, 0.45)', 3)
    ctx.restore()
  }

  // 拇指沿握把后缘向上扣住
  ctx.save()
  ctx.translate(1076, 92)
  ctx.rotate(0.32)
  fillRounded(ctx, -16, -34, 32, 80, 14, gloveGradient(ctx, -16, -34, 16, 46))
  strokeRounded(ctx, -16, -34, 32, 80, 14, 'rgba(0, 0, 0, 0.45)', 3)
  ctx.restore()

  ctx.restore()
}

/** 在设计稿坐标系里完成整张武器贴图 */
const paintWeaponArt = (ctx: CanvasRenderingContext2D): void => {
  ctx.save()
  ctx.translate(MUZZLE_ORIGIN_X, MUZZLE_ORIGIN_Y)
  ctx.rotate(GUN_TILT)
  ctx.scale(LOCAL_SCALE, LOCAL_SCALE)

  drawStock(ctx)
  drawReceiver(ctx)
  drawPistolGrip(ctx)
  drawMagazine(ctx)
  drawHandguard(ctx)
  drawBarrel(ctx)
  drawLeftHand(ctx)
  drawRightHand(ctx)

  ctx.restore()
}

/**
 * 创建离屏武器贴图，只需在挂载时调用一次。
 * 画布按 DPR 放大，保证在高分屏上缩放后依然清晰。
 */
export const createWeaponArt = (): WeaponSprite => {
  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(DESIGN_WIDTH * ratio)
  canvas.height = Math.round(DESIGN_HEIGHT * ratio)

  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.scale(ratio, ratio)
    paintWeaponArt(ctx)
  }

  return {
    canvas,
    muzzleX: MUZZLE_ORIGIN_X / DESIGN_WIDTH,
    muzzleY: MUZZLE_ORIGIN_Y / DESIGN_HEIGHT,
  }
}
