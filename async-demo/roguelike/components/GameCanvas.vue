<template>
  <canvas ref="canvasRef" @mousemove="onMouseMove" @mousedown="onMouseDown" @mouseup="onMouseUp" @mouseleave="onMouseUp"
    @contextmenu.prevent></canvas>
</template>

<script setup>
import { ref } from 'vue'
import { useMap } from '../composables/useMap.js'
import { groundZones } from '../composables/useEnemy.js'

const props = defineProps({
  camera: { type: Object, required: true },
  events: { type: Array, default: () => [] },
})

const emit = defineEmits(['mousemove', 'mousedown', 'mouseup'])

const canvasRef = ref(null)

const { toScreen } = useMap(props.camera)

const onMouseMove = (e) => emit('mousemove', e)
const onMouseDown = (e) => emit('mousedown', e)
const onMouseUp = (e) => emit('mouseup', e)

import { drawBackgroundGrid } from '../draw/background.js'
import { drawPlayerSprite } from '../draw/player.js'
import { drawHpBar } from '../draw/hpBar.js'
import { drawEnemySprite } from '../draw/enemies.js'
import { renderProjectile } from '../draw/projectile.js'
import { renderEffect } from '../draw/effects.js'
import { renderVampireAura } from '../draw/vampireAura.js'
import { renderMagicCircles } from '../draw/magicCircles.js'
import { renderLootDrops } from '../draw/lootDrops.js'
import { renderGroundZones } from '../draw/effects.js'
import { drawBossSprite, drawVoidLines, drawSlowFields } from '../draw/boss.js'
import { renderDeathZones, renderEvents } from '../draw/events.js'

const render = (state) => {
  const canvas = canvasRef.value
  if (!canvas) return

  const parent = canvas.parentElement
  if (parent) {
    canvas.width = parent.clientWidth
    canvas.height = parent.clientHeight
  }

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const { player, enemies, projectiles, effects, lootDrops, magicCircles, gameState, voidLines, slowFields } = state
  const cw = canvas.width
  const ch = canvas.height

  drawBackgroundGrid(ctx, props.camera, toScreen)

  effects.value.forEach(e => renderEffect(ctx, e, toScreen))

  renderGroundZones(ctx, groundZones.value, toScreen)

  if (voidLines && voidLines.length > 0) drawVoidLines(ctx, voidLines, toScreen, gameState.gameTime)
  if (slowFields && slowFields.length > 0) drawSlowFields(ctx, slowFields, toScreen, gameState.gameTime)

  renderDeathZones(ctx, props.events, toScreen, gameState.gameTime)

  renderEvents(ctx, props.events, toScreen, gameState.gameTime, cw, ch)

  renderVampireAura(ctx, player, gameState.gameTime, toScreen)

  renderMagicCircles(ctx, magicCircles, gameState.gameTime, toScreen)

  enemies.value.forEach(e => {
    if (e.dead) return
    const pos = toScreen(e.x, e.y, ctx)
    const margin = e.size
    if (pos.x < -margin || pos.x > cw + margin || pos.y < -margin || pos.y > ch + margin) return
    if (e.isBoss) {
      drawBossSprite(ctx, pos.x, pos.y, e, gameState.gameTime)
    } else {
      drawEnemySprite(ctx, pos.x, pos.y, e)
    }
    drawHpBar(ctx, pos.x, pos.y - e.size / 2 - 8, e.hp, e.maxHp, e.size, e.color)
    if (e.frozen) {
      ctx.save()
      ctx.globalAlpha = 0.5
      ctx.strokeStyle = '#93c5fd'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(pos.x, pos.y, e.size / 2 + 4, 0, Math.PI * 2); ctx.stroke()
      ctx.restore()
    }
  })

  renderLootDrops(ctx, lootDrops, gameState.gameTime, toScreen)

  projectiles.value.forEach(p => {
    const pos = toScreen(p.x, p.y, ctx)
    const psize = p.size || 10
    if (pos.x < -psize || pos.x > cw + psize || pos.y < -psize || pos.y > ch + psize) return
    renderProjectile(ctx, pos.x, pos.y, p)
  })

  const playerScreen = toScreen(player.x, player.y, ctx)
  const invSkill = player.skills?.find(s => s.id === 'invincible' && s.active)
  drawPlayerSprite(
    ctx, playerScreen.x, playerScreen.y,
    player.direction, player.frame, player.hitFlash > 0,
    !!invSkill,
    invSkill ? invSkill.invincibleTimer : 0,
    invSkill ? invSkill.invincibleTotalDuration : 0
  )
}

const getCanvasSize = () => {
  const canvas = canvasRef.value
  if (!canvas) return { width: 0, height: 0 }
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
</template>