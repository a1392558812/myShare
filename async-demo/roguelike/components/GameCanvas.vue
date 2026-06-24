<template>
  <canvas
    ref="canvasRef"
    @mousemove="onMouseMove"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
    @contextmenu.prevent
  ></canvas>
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

  const { player, enemies, projectiles, effects, gameState } = state

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
