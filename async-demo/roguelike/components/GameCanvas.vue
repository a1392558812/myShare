<template>
  <canvas ref="canvasRef" @mousemove="onMouseMove" @mousedown="onMouseDown" @mouseup="onMouseUp" @mouseleave="onMouseUp"
    @contextmenu.prevent></canvas>
</template>

<script setup>
import { ref } from 'vue'
import { useMap } from '../composables/useMap.js'

const props = defineProps({
  camera: { type: Object, required: true },
})

const emit = defineEmits(['mousemove', 'mousedown', 'mouseup'])

const canvasRef = ref(null)

const { toScreen } = useMap(props.camera)

// ─── 输入事件透传 ───
const onMouseMove = (e) => emit('mousemove', e)
const onMouseDown = (e) => emit('mousedown', e)
const onMouseUp = (e) => emit('mouseup', e)

// ═════════════════════ 绘制函数（已抽取至 draw/ 目录） ═════════════════════
import { drawBackgroundGrid } from '../draw/background.js'
import { drawPlayerSprite } from '../draw/player.js'
import { drawHpBar } from '../draw/hpBar.js'
import { drawEnemySprite } from '../draw/enemies.js'
import { renderProjectile } from '../draw/projectile.js'
import { renderEffect } from '../draw/effects.js'
import { renderVampireAura } from '../draw/vampireAura.js'
import { renderMagicCircles } from '../draw/magicCircles.js'
import { renderLootDrops } from '../draw/lootDrops.js'

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
  drawBackgroundGrid(ctx, props.camera, toScreen)

  // 视觉特效
  effects.value.forEach(e => renderEffect(ctx, e, toScreen))

  // 吸血光环
  renderVampireAura(ctx, player, gameState.gameTime, toScreen)

  // 魔法阵火雨
  renderMagicCircles(ctx, magicCircles, gameState.gameTime, toScreen)

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
  renderLootDrops(ctx, lootDrops, gameState.gameTime, toScreen)

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
