<template>
  <canvas ref="canvasRef" @mousemove="onMouseMove" @mousedown="onMouseDown" @mouseup="onMouseUp" @mouseleave="onMouseUp"
    @contextmenu.prevent></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useMap } from '../composables/useMap.js'
import { groundZones } from '../composables/useEnemy.js'

const props = defineProps({
  camera: { type: Object, required: true },
  events: { type: Array, default: () => [] },
})

const emit = defineEmits(['mousemove', 'mousedown', 'mouseup'])

const canvasRef = ref(null)
const canvasWidth = ref(0)
const canvasHeight = ref(0)

const { toScreen } = useMap(props.camera)

const onMouseMove = (e) => emit('mousemove', e)
const onMouseDown = (e) => emit('mousedown', e)
const onMouseUp = (e) => emit('mouseup', e)

import { drawBackgroundGrid } from '../draw/background.js'
import { drawPlayerSprite, drawPlayerConfusion } from '../draw/player.js'
import { drawHpBar } from '../draw/hpBar.js'
import { drawEnemySprite, drawRoadhogHook, drawThrowProjectile, drawHackerRay } from '../draw/enemies.js'
import { renderProjectile } from '../draw/projectile.js'
import { renderEffect } from '../draw/effects.js'
import { renderVampireAura } from '../draw/vampireAura.js'
import { renderMagicCircles } from '../draw/magicCircles.js'
import { renderTraps } from '../draw/traps.js'
import { renderLootDrops } from '../draw/lootDrops.js'
import { renderGroundZones } from '../draw/effects.js'
import { drawBossSprite, drawVoidLines, drawSlowFields, drawFireRay } from '../draw/boss.js'
import { renderDeathZones, renderEvents, renderLightningQuadrants } from '../draw/events.js'
import { renderBoundaryLines, renderBoundaryWarning, renderBoundaryText } from '../draw/boundary.js'
import { drawUltimateRay } from '../draw/ultimateRay.js'

let resizeObserver = null
let resizeTimeout = null

const handleResize = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const parent = canvas.parentElement
  if (!parent) return

  const newWidth = parent.clientWidth
  const newHeight = parent.clientHeight
  if (canvas.width !== newWidth || canvas.height !== newHeight) {
    canvas.width = newWidth
    canvas.height = newHeight
    canvasWidth.value = newWidth
    canvasHeight.value = newHeight
  }
}

const debouncedResize = () => {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(handleResize, 100)
}

onMounted(() => {
  handleResize()
  resizeObserver = new ResizeObserver(debouncedResize)
  const canvas = canvasRef.value
  if (canvas && canvas.parentElement) {
    resizeObserver.observe(canvas.parentElement)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
    resizeTimeout = null
  }
})

const render = (state) => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const { player, enemies, projectiles, effects, lootDrops, magicCircles, traps, gameState, voidLines, slowFields, activeBoss, boundary } = state
  const cw = canvas.width
  const ch = canvas.height

  drawBackgroundGrid(ctx, props.camera, toScreen)

  if (boundary) {
    renderBoundaryLines(ctx, props.camera, canvas, boundary.radX, boundary.radY, gameState.gameTime)
  }

  renderLightningQuadrants(ctx, props.events, toScreen, gameState.gameTime, cw, ch)

  effects.value.forEach(e => renderEffect(ctx, e, toScreen))

  renderGroundZones(ctx, groundZones.value, toScreen)

  if (voidLines && voidLines.length > 0) drawVoidLines(ctx, voidLines, toScreen, gameState.gameTime)
  if (slowFields && slowFields.length > 0) drawSlowFields(ctx, slowFields, toScreen, gameState.gameTime)
  if (activeBoss && activeBoss.bossId === 'infernoCore') drawFireRay(ctx, activeBoss, player, toScreen, gameState.gameTime)

  const ultimateRaySkill = player.skills?.find(s => s.id === 'ultimateRay' && s.active)
  if (ultimateRaySkill) drawUltimateRay(ctx, player, ultimateRaySkill, toScreen, gameState.gameTime)

  renderDeathZones(ctx, props.events, toScreen, gameState.gameTime)

  renderEvents(ctx, props.events, toScreen, gameState.gameTime, cw, ch)

  renderVampireAura(ctx, player, gameState.gameTime, toScreen)

  renderMagicCircles(ctx, magicCircles, gameState.gameTime, toScreen)

  renderTraps(ctx, traps, gameState.gameTime, toScreen)

  enemies.value.forEach(e => {
    if (e.dead) return
    const pos = toScreen(e.x, e.y, ctx)
    const margin = e.size
    if (pos.x < -margin || pos.x > cw + margin || pos.y < -margin || pos.y > ch + margin) return

    const stealthAlpha = e.stealthOpacity || e.stealthLevel || 1.0
    if (stealthAlpha < 1.0) {
      ctx.save()
      ctx.globalAlpha = Math.max(stealthAlpha, 0.05)
    }

    if (e.isBoss) {
      drawBossSprite(ctx, pos.x, pos.y, e, gameState.gameTime)
    } else {
      drawEnemySprite(ctx, pos.x, pos.y, e)
    }

    const hpAlpha = stealthAlpha < 1.0 ? Math.max(stealthAlpha * 0.7, 0.05) : 1.0
    ctx.save()
    ctx.globalAlpha = hpAlpha
    drawHpBar(ctx, pos.x, pos.y - e.size / 2 - 8, e.hp, e.maxHp, e.size, e.color)
    ctx.restore()

    if (stealthAlpha < 1.0) {
      ctx.restore()
    }

    if (e.frozen) {
      ctx.save()
      ctx.globalAlpha = stealthAlpha < 1.0 ? Math.max(stealthAlpha * 0.5, 0.05) : 0.5
      ctx.strokeStyle = '#93c5fd'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(pos.x, pos.y, e.size / 2 + 4, 0, Math.PI * 2); ctx.stroke()
      ctx.restore()
    }
    if (e.type === 'eliteRoadhog' && e.hookState !== 'normal') {
      const hookPos = toScreen(e.hookX, e.hookY, ctx)
      drawRoadhogHook(ctx, pos.x, pos.y, hookPos.x, hookPos.y, e)
    }
    if (e.throwFlying) {
      drawThrowProjectile(ctx, pos.x, pos.y, e, gameState.gameTime)
    }
    if (e.type === 'eliteHacker' && e.rayActive) {
      const playerPos = toScreen(player.x, player.y, ctx)
      drawHackerRay(ctx, pos.x, pos.y, playerPos.x, playerPos.y, e, gameState.gameTime)
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
  const ultRaySkill = player.skills?.find(s => s.id === 'ultimateRay' && s.active)
  const isInvincible = !!invSkill || !!ultRaySkill
  const invTimer = invSkill ? invSkill.invincibleTimer : (ultRaySkill ? ultRaySkill.ultimateRayTimer : 0)
  const invTotal = invSkill ? invSkill.invincibleTotalDuration : (ultRaySkill ? ultRaySkill.ultimateRayTotalDuration : 0)
  drawPlayerSprite(
    ctx, playerScreen.x, playerScreen.y,
    player.direction, player.frame, player.hitFlash > 0,
    isInvincible,
    invTimer,
    invTotal
  )

  if (player.confusionTimer > 0) {
    drawPlayerConfusion(ctx, playerScreen.x, playerScreen.y)
  }

  if (boundary) {
    renderBoundaryWarning(ctx, cw, ch, boundary.warningLevel, boundary.dangerLevel, gameState.gameTime)
    renderBoundaryText(ctx, cw, ch, boundary.warningLevel, boundary.dangerLevel, gameState.gameTime)
  }
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