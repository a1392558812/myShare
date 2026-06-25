<template>
  <canvas ref="canvasRef" @mousemove="onMouseMove" @mousedown="onMouseDown" @mouseup="onMouseUp" @mouseleave="onMouseUp"
    @contextmenu.prevent></canvas>
</template>

<script setup>
import { ref } from 'vue'
import { ENTITY_SIZE, DIRECTION } from '../constants.js'
import { useMap } from '../composables/useMap.js'

const props = defineProps({
  camera: { type: Object, required: true },
})

const emit = defineEmits(['mousemove', 'mousedown', 'mouseup'])

const canvasRef = ref(null)

const { toScreen, toLogical } = useMap(props.camera)

// ─── 输入事件透传 ───
const onMouseMove = (e) => emit('mousemove', e)
const onMouseDown = (e) => emit('mousedown', e)
const onMouseUp = (e) => emit('mouseup', e)

// ═════════════════════ 绘制函数 ═════════════════════

const drawBackgroundGrid = (ctx) => {
  const gridSize = 80
  ctx.save()
  ctx.strokeStyle = 'rgba(200, 210, 220, 0.3)'
  ctx.lineWidth = 1

  const camModX = ((-props.camera.x % gridSize) + gridSize) % gridSize
  const camModY = ((-props.camera.y % gridSize) + gridSize) % gridSize

  for (let x = camModX - gridSize; x < ctx.canvas.width + gridSize; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, ctx.canvas.height)
    ctx.stroke()
  }
  for (let y = camModY - gridSize; y < ctx.canvas.height + gridSize; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(ctx.canvas.width, y)
    ctx.stroke()
  }
  ctx.restore()

  // 原点标记
  const origin = toScreen(0, 0, ctx)
  ctx.save()
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(origin.x - 10, origin.y)
  ctx.lineTo(origin.x + 10, origin.y)
  ctx.moveTo(origin.x, origin.y - 10)
  ctx.lineTo(origin.x, origin.y + 10)
  ctx.stroke()
  ctx.restore()
}

const drawPlayerSprite = (ctx, sx, sy, direction, frame, flash) => {
  const s = ENTITY_SIZE
  const half = s / 2
  ctx.save()
  ctx.translate(sx, sy)

  if (flash) {
    ctx.globalAlpha = 0.6 + 0.4 * (frame % 2)
  }

  const bodyColor = '#fbbf24'
  const bodyColor2 = '#d97706'
  const headColor = '#fde68a'
  const legColor = '#92400e'
  const legOffset = [0, 3, 0, -3][frame]

  if (direction === DIRECTION.FRONT) {
    ctx.fillStyle = headColor; ctx.fillRect(-8, -half + 2, 16, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-5, -half + 6, 3, 3); ctx.fillRect(2, -half + 6, 3, 3)
    ctx.fillStyle = bodyColor; ctx.fillRect(-10, -half + 14, 20, 14)
    ctx.fillStyle = bodyColor2; ctx.fillRect(-8, -half + 16, 16, 4)
    ctx.fillStyle = legColor; ctx.fillRect(-9, -half + 28 + legOffset, 7, 10); ctx.fillRect(2, -half + 28 - legOffset, 7, 10)
    ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(12, -half + 18, 8, -Math.PI / 3, Math.PI / 3); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(12 + 8 * Math.cos(-Math.PI / 3), -half + 18 + 8 * Math.sin(-Math.PI / 3))
    ctx.lineTo(12 + 8 * Math.cos(Math.PI / 3), -half + 18 + 8 * Math.sin(Math.PI / 3))
    ctx.stroke()
  } else if (direction === DIRECTION.LEFT) {
    ctx.fillStyle = headColor; ctx.fillRect(-6, -half + 2, 12, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-4, -half + 6, 3, 3)
    ctx.fillStyle = bodyColor; ctx.fillRect(-10, -half + 14, 18, 14)
    ctx.fillStyle = bodyColor2; ctx.fillRect(-8, -half + 16, 14, 4)
    ctx.fillStyle = legColor; ctx.fillRect(-6 + legOffset, -half + 28, 7, 10); ctx.fillRect(-1 - legOffset, -half + 28, 7, 10)
    ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(-12, -half + 18, 8, Math.PI - Math.PI / 3, Math.PI + Math.PI / 3); ctx.stroke()
  } else {
    ctx.fillStyle = headColor; ctx.fillRect(-6, -half + 2, 12, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(1, -half + 6, 3, 3)
    ctx.fillStyle = bodyColor; ctx.fillRect(-8, -half + 14, 18, 14)
    ctx.fillStyle = bodyColor2; ctx.fillRect(-6, -half + 16, 14, 4)
    ctx.fillStyle = legColor; ctx.fillRect(-6 - legOffset, -half + 28, 7, 10); ctx.fillRect(1 + legOffset, -half + 28, 7, 10)
    ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(12, -half + 18, 8, -Math.PI / 3, Math.PI / 3); ctx.stroke()
  }

  ctx.restore()
}

const drawHpBar = (ctx, x, y, hp, maxHp, width, color) => {
  const barW = width; const barH = 4; const ratio = hp / maxHp
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(x - barW / 2, y, barW, barH)
  ctx.fillStyle = color; ctx.fillRect(x - barW / 2, y, barW * ratio, barH)
  ctx.restore()
}

// 近战敌人精灵
const drawMeleeEnemy = (ctx, half, dir, legOff, color, color2) => {
  const headColor = '#fecaca'
  if (dir === DIRECTION.FRONT) {
    ctx.fillStyle = headColor; ctx.fillRect(-9, -half + 2, 18, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-6, -half + 6, 4, 3); ctx.fillRect(2, -half + 6, 4, 3)
    ctx.fillStyle = color; ctx.fillRect(-12, -half + 14, 24, 16)
    ctx.fillStyle = color2; ctx.fillRect(-10, -half + 16, 20, 6)
    ctx.fillStyle = '#7f1d1d'; ctx.fillRect(-10 + legOff, -half + 30, 8, 8); ctx.fillRect(2 - legOff, -half + 30, 8, 8)
    ctx.fillStyle = '#6b7280'; ctx.fillRect(13, -half + 10, 4, 22)
    ctx.fillStyle = '#9ca3af'; ctx.fillRect(12, -half + 8, 6, 4)
  } else if (dir === DIRECTION.LEFT) {
    ctx.fillStyle = headColor; ctx.fillRect(-7, -half + 2, 14, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-5, -half + 6, 4, 3)
    ctx.fillStyle = color; ctx.fillRect(-12, -half + 14, 22, 16)
    ctx.fillStyle = color2; ctx.fillRect(-10, -half + 16, 18, 6)
    ctx.fillStyle = '#7f1d1d'; ctx.fillRect(-7 + legOff, -half + 30, 8, 8); ctx.fillRect(-1 - legOff, -half + 30, 8, 8)
    ctx.fillStyle = '#6b7280'; ctx.fillRect(-14, -half + 10, 4, 22)
  } else {
    ctx.fillStyle = headColor; ctx.fillRect(-7, -half + 2, 14, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(1, -half + 6, 4, 3)
    ctx.fillStyle = color; ctx.fillRect(-10, -half + 14, 22, 16)
    ctx.fillStyle = color2; ctx.fillRect(-8, -half + 16, 18, 6)
    ctx.fillStyle = '#7f1d1d'; ctx.fillRect(-7 - legOff, -half + 30, 8, 8); ctx.fillRect(1 + legOff, -half + 30, 8, 8)
    ctx.fillStyle = '#6b7280'; ctx.fillRect(10, -half + 10, 4, 22)
    ctx.fillStyle = '#9ca3af'; ctx.fillRect(9, -half + 8, 6, 4)
  }
}

// 远程敌人精灵（法师）
const drawRangedEnemy = (ctx, half, dir, legOff, color, color2) => {
  const headColor = '#bfdbfe'
  if (dir === DIRECTION.FRONT) {
    ctx.fillStyle = headColor; ctx.fillRect(-7, -half + 2, 14, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-4, -half + 6, 3, 3); ctx.fillRect(1, -half + 6, 3, 3)
    ctx.fillStyle = color; ctx.fillRect(-8, -half + 14, 16, 18)
    ctx.fillStyle = color2; ctx.fillRect(-6, -half + 16, 12, 4)
    ctx.fillStyle = '#1e3a5f'; ctx.fillRect(-5 + legOff, -half + 32, 5, 6); ctx.fillRect(0 - legOff, -half + 32, 5, 6)
    ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(10, -half + 6); ctx.lineTo(10, -half + 28); ctx.stroke()
    ctx.fillStyle = '#a78bfa'; ctx.beginPath(); ctx.arc(10, -half + 4, 4, 0, Math.PI * 2); ctx.fill()
  } else if (dir === DIRECTION.LEFT) {
    ctx.fillStyle = headColor; ctx.fillRect(-5, -half + 2, 12, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-3, -half + 6, 3, 3)
    ctx.fillStyle = color; ctx.fillRect(-8, -half + 14, 16, 18)
    ctx.fillStyle = '#1e3a5f'; ctx.fillRect(-4 + legOff, -half + 32, 5, 6); ctx.fillRect(0 - legOff, -half + 32, 5, 6)
    ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(-10, -half + 6); ctx.lineTo(-10, -half + 28); ctx.stroke()
    ctx.fillStyle = '#a78bfa'; ctx.beginPath(); ctx.arc(-10, -half + 4, 4, 0, Math.PI * 2); ctx.fill()
  } else {
    ctx.fillStyle = headColor; ctx.fillRect(-5, -half + 2, 12, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(0, -half + 6, 3, 3)
    ctx.fillStyle = color; ctx.fillRect(-6, -half + 14, 16, 18)
    ctx.fillStyle = '#1e3a5f'; ctx.fillRect(-4 - legOff, -half + 32, 5, 6); ctx.fillRect(0 + legOff, -half + 32, 5, 6)
    ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(10, -half + 6); ctx.lineTo(10, -half + 28); ctx.stroke()
    ctx.fillStyle = '#a78bfa'; ctx.beginPath(); ctx.arc(10, -half + 4, 4, 0, Math.PI * 2); ctx.fill()
  }
}

// 混合敌人精灵
const drawHybridEnemy = (ctx, half, dir, legOff, color, color2) => {
  const headColor = '#ddd6fe'
  if (dir === DIRECTION.FRONT) {
    ctx.fillStyle = headColor; ctx.fillRect(-8, -half + 2, 16, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-5, -half + 6, 3, 3); ctx.fillRect(2, -half + 6, 3, 3)
    ctx.fillStyle = color; ctx.fillRect(-10, -half + 14, 20, 16)
    ctx.fillStyle = color2; ctx.fillRect(-8, -half + 16, 16, 5)
    ctx.fillStyle = '#4c1d95'; ctx.fillRect(-8 + legOff, -half + 30, 7, 8); ctx.fillRect(1 - legOff, -half + 30, 7, 8)
    ctx.fillStyle = '#6b7280'; ctx.fillRect(-14, -half + 12, 3, 16)
    ctx.strokeStyle = '#c4b5fd'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(13, -half + 8); ctx.lineTo(13, -half + 26); ctx.stroke()
    ctx.fillStyle = '#e9d5ff'; ctx.beginPath(); ctx.arc(13, -half + 6, 3, 0, Math.PI * 2); ctx.fill()
  } else if (dir === DIRECTION.LEFT) {
    ctx.fillStyle = headColor; ctx.fillRect(-6, -half + 2, 14, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-4, -half + 6, 3, 3)
    ctx.fillStyle = color; ctx.fillRect(-10, -half + 14, 18, 16)
    ctx.fillStyle = '#4c1d95'; ctx.fillRect(-6 + legOff, -half + 30, 7, 8); ctx.fillRect(0 - legOff, -half + 30, 7, 8)
    ctx.fillStyle = '#6b7280'; ctx.fillRect(-12, -half + 12, 3, 16)
  } else {
    ctx.fillStyle = headColor; ctx.fillRect(-6, -half + 2, 14, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(1, -half + 6, 3, 3)
    ctx.fillStyle = color; ctx.fillRect(-8, -half + 14, 18, 16)
    ctx.fillStyle = '#4c1d95'; ctx.fillRect(-6 - legOff, -half + 30, 7, 8); ctx.fillRect(1 + legOff, -half + 30, 7, 8)
    ctx.strokeStyle = '#c4b5fd'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(11, -half + 8); ctx.lineTo(11, -half + 26); ctx.stroke()
    ctx.fillStyle = '#e9d5ff'; ctx.beginPath(); ctx.arc(11, -half + 6, 3, 0, Math.PI * 2); ctx.fill()
  }
}

const drawEnemySprite = (ctx, sx, sy, enemy) => {
  const s = enemy.size; const half = s / 2
  ctx.save(); ctx.translate(sx, sy)

  const flash = enemy.hitFlash > 0
  if (flash) ctx.globalAlpha = 0.5 + 0.5 * (enemy.hitFlash % 2)

  const legOffset = [0, 3, 0, -3][enemy.frame]

  if (enemy.type === 'melee') {
    drawMeleeEnemy(ctx, half, enemy.direction, legOffset, enemy.color, enemy.color2)
  } else if (enemy.type === 'ranged') {
    drawRangedEnemy(ctx, half, enemy.direction, legOffset, enemy.color, enemy.color2)
  } else {
    drawHybridEnemy(ctx, half, enemy.direction, legOffset, enemy.color, enemy.color2)
  }

  ctx.restore()
}

const renderProjectile = (ctx, sx, sy, p) => {
  ctx.save()
  if (p.type === 'arrow') {
    const angle = Math.atan2(p.vy, p.vx)
    ctx.translate(sx, sy); ctx.rotate(angle)
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.stroke()
    ctx.fillStyle = '#d97706'
    ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(4, -3); ctx.lineTo(4, 3); ctx.closePath(); ctx.fill()
  } else if (p.type === 'autoSeek') {
    ctx.fillStyle = '#a78bfa'; ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#e9d5ff'; ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI * 2); ctx.fill()
  } else if (p.type === 'enemyBullet') {
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(sx, sy, p.size / 2, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#fca5a5'; ctx.beginPath(); ctx.arc(sx, sy, p.size / 4, 0, Math.PI * 2); ctx.fill()
  }
  ctx.restore()
}

const renderEffect = (ctx, e) => {
  const pos = toScreen(e.x, e.y, ctx)
  const progress = e.elapsed / e.duration
  ctx.save()
  if (e.type === 'meleeSlash') {
    // 全圆范围指示（ faint 底色圆，与伤害判定范围一致）
    const visualRadius = e.radius + ENTITY_SIZE / 2
    ctx.globalAlpha = 0.10 * (1 - progress)
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(pos.x, pos.y, visualRadius, 0, Math.PI * 2); ctx.stroke()
    // 斩击弧线
    ctx.globalAlpha = 1 - progress
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 4
    ctx.beginPath(); ctx.arc(pos.x, pos.y, e.radius, e.angle - Math.PI / 3, e.angle + Math.PI / 3); ctx.stroke()
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(pos.x, pos.y, e.radius * 0.7, e.angle - Math.PI / 4, e.angle + Math.PI / 4); ctx.stroke()
  } else if (e.type === 'freezeCircle') {
    const radius = e.radius * (0.3 + progress * 0.7)
    ctx.globalAlpha = 0.6 * (1 - progress)
    ctx.strokeStyle = '#93c5fd'; ctx.lineWidth = 3
    ctx.beginPath(); ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2); ctx.stroke()
    ctx.fillStyle = 'rgba(147, 197, 253, 0.15)'
    ctx.beginPath(); ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2); ctx.fill()
  } else if (e.type === 'magicFireball') {
    // 火球坠落 → 闪白爆发 → 多层渐变 → 冲击波 → 裂片
    const r = e.radius * (0.2 + progress * 0.8)
    const fade = 1 - progress
    const pulse = 1 + 0.04 * Math.sin(e.elapsed * 0.015)
    ctx.save()

    // ═══════ 阶段1：闪白爆发（前 18%） ═══════
    if (progress < 0.18) {
      ctx.globalAlpha = (1 - progress / 0.18) * 0.75
      ctx.fillStyle = '#FFFFFF'
      ctx.shadowColor = '#FFFFFF'
      ctx.shadowBlur = 20
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r * (1.5 + progress * 2), 0, Math.PI * 2); ctx.fill()
    }

    // ═══════ 外层辉光 ═══════
    ctx.globalAlpha = fade * 0.28 * pulse
    ctx.shadowColor = '#FF4400'
    ctx.shadowBlur = 20
    const outerGrad = ctx.createRadialGradient(
      pos.x, pos.y, r * 0.4 * pulse,
      pos.x, pos.y, r * 2 * (1 + progress * 0.3) * pulse
    )
    outerGrad.addColorStop(0, 'rgba(255, 180, 20, 0.65)')
    outerGrad.addColorStop(0.5, 'rgba(255, 80, 10, 0.28)')
    outerGrad.addColorStop(1, 'rgba(255, 20, 0, 0)')
    ctx.fillStyle = outerGrad
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 2 * (1 + progress * 0.3) * pulse, 0, Math.PI * 2); ctx.fill()

    // ═══════ 中层渐变（偏移高光模拟光照） ═══════
    ctx.globalAlpha = fade * 0.75
    ctx.shadowColor = '#FF6600'
    ctx.shadowBlur = 16
    const midGrad = ctx.createRadialGradient(
      pos.x - r * 0.18, pos.y - r * 0.25, r * 0.08,
      pos.x, pos.y, r * 1.8 * pulse
    )
    midGrad.addColorStop(0, '#FFF5CC')
    midGrad.addColorStop(0.25, '#FFCC44')
    midGrad.addColorStop(0.55, '#FF7722')
    midGrad.addColorStop(0.85, '#CC3300')
    midGrad.addColorStop(1, 'rgba(160, 20, 0, 0)')
    ctx.fillStyle = midGrad
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 1.8 * pulse, 0, Math.PI * 2); ctx.fill()

    // ═══════ 核心白色高光 ═══════
    ctx.globalAlpha = fade * 0.95
    const coreGrad = ctx.createRadialGradient(
      pos.x, pos.y, 0,
      pos.x, pos.y, r * pulse
    )
    coreGrad.addColorStop(0, '#FFFFFF')
    coreGrad.addColorStop(0.25, '#FFEE88')
    coreGrad.addColorStop(0.7, '#FF9922')
    coreGrad.addColorStop(1, 'rgba(255, 100, 20, 0)')
    ctx.fillStyle = coreGrad
    ctx.shadowColor = '#FF8800'
    ctx.shadowBlur = 8
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r * pulse, 0, Math.PI * 2); ctx.fill()

    // ═══════ 5 个甩动火花粒子 ═══════
    for (let i = 0; i < 5; i++) {
      const angle = Math.PI * 1.5 + (i - 2) * 0.35 + Math.sin(e.elapsed * 0.04 + i) * 0.18
      const sparkDist = r * (1.1 + 0.55 * Math.sin(e.elapsed * 0.06 + i * 2.1))
      const sx = pos.x + Math.cos(angle) * sparkDist
      const sy = pos.y + Math.sin(angle) * sparkDist
      ctx.globalAlpha = fade * (0.45 + 0.3 * Math.sin(e.elapsed * 0.06 + i))
      ctx.fillStyle = i % 2 === 0 ? '#FFEE44' : '#FFAA33'
      ctx.shadowColor = '#FF6600'
      ctx.shadowBlur = 3
      ctx.beginPath(); ctx.arc(sx, sy, 1.4 + Math.sin(e.elapsed * 0.07 + i) * 0.6, 0, Math.PI * 2); ctx.fill()
    }

    // ═══════ 双层冲击波圆环 ═══════
    // 外层冲击环
    ctx.globalAlpha = fade * 0.45
    ctx.strokeStyle = '#FF7722'
    ctx.lineWidth = 3.5 * (1 - progress * 0.4)
    ctx.shadowColor = '#FF4400'
    ctx.shadowBlur = 10
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r * (1.0 + progress * 3), 0, Math.PI * 2); ctx.stroke()

    // 内层冲击环
    ctx.globalAlpha = fade * 0.2
    ctx.strokeStyle = '#FFAA44'
    ctx.lineWidth = 2 * (1 - progress)
    ctx.shadowBlur = 6
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r * (1.0 + progress * 2), 0, Math.PI * 2); ctx.stroke()

    // ═══════ 16 个爆破裂片（三色轮替） ═══════
    const particleCount = 16
    for (let i = 0; i < particleCount; i++) {
      const pa = (i / particleCount) * Math.PI * 2 + progress * 1.8
      const pd = r * (1.0 + progress * 2.5 + Math.sin(i * 3.7) * 0.15)
      const px = pos.x + Math.cos(pa) * pd
      const py = pos.y + Math.sin(pa) * pd
      ctx.globalAlpha = fade * (0.5 - progress * 0.35)
      const colors = ['#FFEE44', '#FF9922', '#EE3311']
      ctx.fillStyle = colors[i % 3]
      ctx.shadowColor = '#FF6600'
      ctx.shadowBlur = 2
      const ps = 1.6 + Math.sin(i * 2.4) * 0.6
      ctx.beginPath(); ctx.arc(px, py, ps * (1 - progress * 0.5), 0, Math.PI * 2); ctx.fill()
    }

    // ═══════ 余烬光晕 ═══════
    ctx.globalAlpha = fade * 0.12
    const emberGrad = ctx.createRadialGradient(pos.x, pos.y, r * 0.3, pos.x, pos.y, r * 1.8)
    emberGrad.addColorStop(0, 'rgba(255, 100, 20, 0.5)')
    emberGrad.addColorStop(1, 'rgba(255, 40, 0, 0)')
    ctx.fillStyle = emberGrad
    ctx.shadowBlur = 0
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 1.8, 0, Math.PI * 2); ctx.fill()

    ctx.restore()
  }
  ctx.restore()
}

// ═════════════════════ 对外暴露的渲染方法 ═════════════════════

/**
 * 渲染一帧。由父组件在 gameLoop 中调用。
 * @param {Object} state - { player, enemies, projectiles, effects, gameState }
 */
const render = (state) => {
  const canvas = canvasRef.value
  if (!canvas) return

  // 画布尺寸适配容器
  const parent = canvas.parentElement
  if (parent) {
    canvas.width = parent.clientWidth
    canvas.height = parent.clientHeight
  }

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const { player, enemies, projectiles, effects, lootDrops, magicCircles, gameState } = state

  // 背景网格
  drawBackgroundGrid(ctx)

  // 视觉特效
  effects.value.forEach(e => renderEffect(ctx, e))

  // 吸血光环
  const vampireSkill = player.skills.find(s => s.id === 'vampireAura' && s.active)
  if (vampireSkill) {
    const pos = toScreen(player.x, player.y, ctx)
    const visualRadius = vampireSkill.auraRange + ENTITY_SIZE / 2
    ctx.save()
    ctx.globalAlpha = 0.25 + 0.10 * Math.sin(gameState.gameTime / 200)
    ctx.beginPath(); ctx.arc(pos.x, pos.y, visualRadius, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(220, 38, 38, 0.18)'; ctx.fill()
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.5)'; ctx.lineWidth = 2
    ctx.stroke()
    ctx.restore()
  }

  // 魔法阵火雨（draw-game-units/magic.js 风格）
  if (magicCircles) {
    const now = gameState.gameTime
    magicCircles.value.forEach(circle => {
      const pos = toScreen(circle.x, circle.y, ctx)
      const progress = circle.elapsed / circle.duration
      const alpha = 1 - progress * 0.35
      const pulse = 1 + 0.03 * Math.sin(now / 150)
      const vr = circle.radius * pulse
      const dissolve = progress > 0.7 ? (1 - progress) / 0.3 : 1

      ctx.save()
      ctx.globalAlpha = alpha * dissolve

      // ═══════ 灼烧地面底色 ═══════
      const burnGrad = ctx.createRadialGradient(pos.x, pos.y, vr * 0.25, pos.x, pos.y, vr * 1.05)
      burnGrad.addColorStop(0, 'rgba(255, 45, 0, 0.22)')
      burnGrad.addColorStop(0.55, 'rgba(255, 85, 10, 0.10)')
      burnGrad.addColorStop(1, 'rgba(255, 120, 20, 0)')
      ctx.fillStyle = burnGrad
      ctx.shadowBlur = 0
      ctx.beginPath(); ctx.arc(pos.x, pos.y, vr * 1.05, 0, Math.PI * 2); ctx.fill()

      // ═══════ 发光外圈 ═══════
      ctx.strokeStyle = 'rgba(255, 102, 34, 0.75)'
      ctx.lineWidth = 2.5 * dissolve
      ctx.shadowColor = '#FF4400'
      ctx.shadowBlur = 22 * dissolve
      ctx.beginPath(); ctx.arc(pos.x, pos.y, vr, 0, Math.PI * 2); ctx.stroke()

      // ═══════ 内圈符文线 ═══════
      ctx.strokeStyle = 'rgba(255, 200, 55, 0.3)'
      ctx.lineWidth = 1.5
      ctx.shadowColor = '#FFAA33'
      ctx.shadowBlur = 12
      ctx.beginPath(); ctx.arc(pos.x, pos.y, vr * 0.72, 0, Math.PI * 2); ctx.stroke()

      // ═══════ 外圈顺时针弧段 ═══════
      const arcRot = now / 600
      ctx.strokeStyle = 'rgba(255, 160, 30, 0.6)'
      ctx.lineWidth = 2.8
      ctx.shadowColor = '#FF8822'
      ctx.shadowBlur = 14
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, vr * 0.98, arcRot, arcRot + Math.PI * 1.2)
      ctx.stroke()

      // ═══════ 内圈逆时针弧段 ═══════
      ctx.strokeStyle = 'rgba(255, 200, 60, 0.45)'
      ctx.lineWidth = 2
      ctx.shadowColor = '#FFAA44'
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, vr * 0.74, -arcRot * 0.7, -arcRot * 0.7 + Math.PI * 1.0)
      ctx.stroke()

      // ═══════ 中心呼吸光点 ═══════
      const coreSize = vr * 0.14 * (1 + 0.35 * Math.sin(now * 0.0035 * Math.PI * 2))
      const coreGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, coreSize * 2.5)
      coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)')
      coreGrad.addColorStop(0.35, 'rgba(255, 210, 80, 0.5)')
      coreGrad.addColorStop(1, 'rgba(255, 100, 20, 0)')
      ctx.fillStyle = coreGrad
      ctx.shadowColor = '#FFFFFF'
      ctx.shadowBlur = 16
      ctx.beginPath(); ctx.arc(pos.x, pos.y, coreSize * 2.5, 0, Math.PI * 2); ctx.fill()

      // ═══════ 8 个符文标记（4 种形状轮替：三角/菱形/圆/十字） ═══════
      const runeRot = now / 1800 * Math.PI * 2
      const shapes = ['triangle', 'diamond', 'circle', 'cross']
      for (let r = 0; r < 8; r++) {
        const ra = runeRot + r * Math.PI / 4
        const rx = pos.x + Math.cos(ra) * vr * 0.86
        const ry = pos.y + Math.sin(ra) * vr * 0.86
        const rise = 1 + Math.sin(now * 0.002 + r) * 0.12
        const swing = Math.sin(now * 0.003 + r * 0.7) * 3
        ctx.save()
        ctx.translate(rx, ry + swing)
        ctx.scale(rise, rise)
        ctx.globalAlpha = 0.6 + 0.2 * Math.sin(now * 0.004 + r)
        ctx.fillStyle = 'rgba(255, 210, 60, 0.8)'
        ctx.shadowColor = '#FFAA33'
        ctx.shadowBlur = 6
        ctx.lineWidth = 1.2
        ctx.strokeStyle = 'rgba(255, 240, 150, 0.5)'

        const shape = shapes[r % 4]
        if (shape === 'triangle') {
          ctx.beginPath()
          ctx.moveTo(0, -3.5); ctx.lineTo(3, 2); ctx.lineTo(-3, 2)
          ctx.closePath(); ctx.fill(); ctx.stroke()
        } else if (shape === 'diamond') {
          ctx.beginPath()
          ctx.moveTo(0, -3); ctx.lineTo(2.5, 0)
          ctx.lineTo(0, 3); ctx.lineTo(-2.5, 0)
          ctx.closePath(); ctx.fill(); ctx.stroke()
        } else if (shape === 'circle') {
          ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2)
          ctx.fill(); ctx.stroke()
        } else if (shape === 'cross') {
          ctx.beginPath()
          ctx.moveTo(-0.8, -3.5); ctx.lineTo(0.8, -3.5)
          ctx.lineTo(0.8, -0.8); ctx.lineTo(3.5, -0.8)
          ctx.lineTo(3.5, 0.8); ctx.lineTo(0.8, 0.8)
          ctx.lineTo(0.8, 3.5); ctx.lineTo(-0.8, 3.5)
          ctx.lineTo(-0.8, 0.8); ctx.lineTo(-3.5, 0.8)
          ctx.lineTo(-3.5, -0.8); ctx.lineTo(-0.8, -0.8)
          ctx.closePath(); ctx.fill(); ctx.stroke()
        }
        ctx.restore()
      }

      // ═══════ 消散效果（后 30% 进度）：扩散冲击波 + 粒子 ═══════
      if (progress > 0.7) {
        const dissProgress = (progress - 0.7) / 0.3
        // 扩散冲击波
        ctx.globalAlpha = (1 - dissProgress) * 0.5
        ctx.strokeStyle = '#FF7722'
        ctx.lineWidth = 3 * (1 - dissProgress)
        ctx.shadowColor = '#FF4400'
        ctx.shadowBlur = 16 * (1 - dissProgress)
        ctx.beginPath(); ctx.arc(pos.x, pos.y, vr * (1 + dissProgress * 1.2), 0, Math.PI * 2); ctx.stroke()

        // 12 个消散粒子
        for (let p = 0; p < 12; p++) {
          const pa = p * Math.PI / 6 + dissProgress * 2.5
          const pd = vr * (0.7 + dissProgress * 1.6)
          const px = pos.x + Math.cos(pa) * pd
          const py = pos.y + Math.sin(pa) * pd
          ctx.globalAlpha = (1 - dissProgress) * (0.3 + 0.15 * Math.sin(p * 2.3))
          ctx.fillStyle = p % 3 === 0 ? '#FFEE44' : (p % 3 === 1 ? '#FF9922' : '#EE3311')
          ctx.shadowBlur = 4
          ctx.beginPath(); ctx.arc(px, py, 1.8 * (1 - dissProgress), 0, Math.PI * 2); ctx.fill()
        }
      }

      ctx.restore()
    })
  }

  // 敌人
  enemies.value.forEach(e => {
    if (e.dead) return
    const pos = toScreen(e.x, e.y, ctx)
    drawEnemySprite(ctx, pos.x, pos.y, e)
    drawHpBar(ctx, pos.x, pos.y - e.size / 2 - 8, e.hp, e.maxHp, e.size, e.color)
    if (e.frozen) {
      ctx.save()
      ctx.globalAlpha = 0.5
      ctx.strokeStyle = '#93c5fd'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(pos.x, pos.y, e.size / 2 + 4, 0, Math.PI * 2); ctx.stroke()
      ctx.restore()
    }
  })

  // 掉落物
  if (lootDrops) {
    const now = gameState.gameTime
    lootDrops.value.forEach(drop => {
      const pos = toScreen(drop.x, drop.y, ctx)
      // 临近消失时闪烁（最后 3 秒）
      const remaining = drop.lifetime - (now - drop.spawnedAt)
      if (remaining < 3000 && Math.floor(now / 200) % 2 === 0) return
      const alpha = remaining < 3000 ? 0.5 : 1

      ctx.save()
      ctx.globalAlpha = alpha
      // 光晕
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, drop.size + 4, 0, Math.PI * 2)
      ctx.fillStyle = drop.color + '20'
      ctx.fill()
      // 实体
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, drop.size, 0, Math.PI * 2)
      ctx.fillStyle = drop.color
      ctx.fill()
      ctx.strokeStyle = drop.hoverColor
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.restore()

      // 图标文字
      ctx.save()
      ctx.font = `${drop.size + 2}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#fff'
      ctx.fillText(drop.icon, pos.x, pos.y)
      ctx.restore()
    })
  }

  // 弹幕
  projectiles.value.forEach(p => {
    const pos = toScreen(p.x, p.y, ctx)
    renderProjectile(ctx, pos.x, pos.y, p)
  })

  // 玩家
  const playerScreen = toScreen(player.x, player.y, ctx)
  drawPlayerSprite(ctx, playerScreen.x, playerScreen.y, player.direction, player.frame, player.hitFlash > 0)
}

/** 供父组件获取当前画布尺寸（spawnEnemy 等需要） */
const getCanvasSize = () => {
  const canvas = canvasRef.value
  if (!canvas) return { width: 0, height: 0 }
  // canvas.width/height 是 render() 中设置的绘制尺寸
  // 若尚未渲染，则回退到父容器布局尺寸
  if (canvas.width && canvas.height) {
    return { width: canvas.width, height: canvas.height }
  }
  const parent = canvas.parentElement
  if (parent) {
    return { width: parent.clientWidth, height: parent.clientHeight }
  }
  return { width: 800, height: 600 }
}

defineExpose({ render, getCanvasSize, canvasRef })
</script>

<style scoped>
canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
