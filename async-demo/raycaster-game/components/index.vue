<template>
  <div class="raycaster">
    <div class="viewport">
      <canvas ref="viewportRef" class="viewport-canvas" @click="requestLock"></canvas>

      <canvas ref="minimapRef" class="minimap"
        :style="{ width: `${MINIMAP_CSS_SIZE}px`, height: `${MINIMAP_CSS_SIZE}px` }"></canvas>

      <div class="hud">
        <div class="hud-item">FPS:{{ hud.fps }}</div>
        <div class="hud-item">坐标:{{ hud.position }}</div>
        <div class="hud-item">朝向:{{ hud.heading }}°</div>
        <div class="hud-item">{{ hud.reloading ? '换弹中…' : `AMMO: ${hud.ammo} / ∞` }}</div>
      </div>

      <div v-if="!pointerLocked" class="lock-hint">
        <div>点击画面进入第一人称</div>
        <div>锁定后鼠标可自由转视角 · 左键开火 · Esc 释放光标</div>
      </div>
    </div>

    <div class="help">
      <button @click="() => emit('loadCode')">查看源码</button>
      <button @click="() => emit('loadDocs')">查看文档</button>
      <div class="help-item" v-for="(item, index) in [
        { label: '视角已锁定', info: pointerLocked ? 'Y' : 'N' },
        { label: 'W / S', info: '前进 / 后退' },
        { label: 'A / D', info: '左右平移' },
        { label: '← / → 或 Q / E', info: '转身' },
        { label: '鼠标', info: '水平 + 垂直自由视角' },
        { label: '左键', info: '射击（可长按连发）' },
        { label: 'R', info: '换弹' },
        { label: 'Shift', info: '冲刺' },
        { label: 'Space', info: '跳跃' },
        { label: 'Ctrl', info: '下蹲' },
        { label: 'M', info: '音效开关' },
        { label: 'T', info: '回到出生点' },
        { label: 'PgUp / PgDn', info: '键盘抬低头' },
      ]" :key="index">
        {{ item.label }}: {{ item.info }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { createInput, type InputController } from './game/input.ts'
import { drawMinimap } from './game/minimap.ts'
import { applyPlayerInput, createPlayer } from './game/player.ts'
import { drawCrosshair, renderScene } from './game/raycaster.ts'
import { createSfx, type SfxController } from './game/sfx.ts'
import type { PlayerState } from './game/types.ts'
import { MAX_PITCH } from './game/view.ts'
import { createWeapon, FLASH_TIME, RELOAD_TIME, updateWeapon, type WeaponState } from './game/weapon.ts'
import { createWeaponArt, type WeaponSprite } from './game/weaponArt.ts'
import { drawWeapon } from './game/weaponView.ts'

const emit = defineEmits(['loadCode', 'loadDocs'])

/** 小地图在 CSS 上的边长，内部像素会按 devicePixelRatio 放大 */
const MINIMAP_CSS_SIZE = 148
/** 单帧最大步长，避免切后台回来时“瞬移” */
const MAX_DELTA_TIME = 0.05
/** 渲染俯仰上限：在后坐力叠加之后再做一次兜底 */
const RENDER_PITCH_LIMIT = MAX_PITCH + 0.08

const viewportRef = ref<HTMLCanvasElement | null>(null)
const minimapRef = ref<HTMLCanvasElement | null>(null)
const pointerLocked = ref(false)

const hud = reactive({
  fps: 0,
  position: '0.00 / 0.00',
  heading: 0,
  ammo: 30,
  reloading: false,
})

let player: PlayerState = createPlayer()
let weapon: WeaponState = createWeapon()
let weaponSprite: WeaponSprite | null = null
let input: InputController | null = null
let sfx: SfxController | null = null
let rafId = 0
let lastTimestamp = 0
let statWindowStart = 0
let frameCounter = 0
let resizeObserver: ResizeObserver | null = null
let viewWidth = 0
let viewHeight = 0

/** 扳机与换弹的“意图”，由事件写入、每帧消费 */
let triggerHeld = false
let reloadQueued = false
/** 射击后的视角上跳与横向抖动，按指数回弹 */
const viewKick = { pitch: 0, yaw: 0 }
/** 准星开火闪光 1 -> 0 */
let hitFlash = 0
/** 走路时枪身摆动 */
let bobPhase = 0
let bobBlend = 0

const requestLock = () => {
  input?.requestPointerLock()
}

const clampPitch = (value: number): number =>
  Math.min(Math.max(value, -RENDER_PITCH_LIMIT), RENDER_PITCH_LIMIT)

/** 只在不影响渲染节奏的时机写入响应式 HUD，避免每帧触发组件更新 */
const syncAmmo = () => {
  hud.ammo = weapon.ammoInMag
  hud.reloading = weapon.reloadRemaining > 0
}

const syncHud = () => {
  const full = Math.PI * 2
  hud.position = `${player.x.toFixed(2)} / ${player.y.toFixed(2)}`
  hud.heading = Math.round((((player.yaw % full) + full) % full) * (180 / Math.PI)) % 360
  syncAmmo()
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.code === 'KeyR') {
    reloadQueued = true
  } else if (event.code === 'KeyT') {
    player = createPlayer()
    weapon = createWeapon()
    syncAmmo()
  } else if (event.code === 'KeyM') {
    sfx?.toggleMute()
  }
}

const handleMouseDown = (event: MouseEvent) => {
  if (event.button !== 0) return
  // 未锁定时第一次点击只用来锁定指针，不开火
  if (document.pointerLockElement !== viewportRef.value) return
  triggerHeld = true
}

const handleMouseUp = (event: MouseEvent) => {
  if (event.button === 0) triggerHeld = false
}

/** 画布分辨率跟随容器尺寸，上限 2 倍 DPR 以控制渲染开销 */
const syncViewportSize = (canvas: HTMLCanvasElement) => {
  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  const cssWidth = Math.max(320, canvas.clientWidth)
  const cssHeight = Math.max(220, canvas.clientHeight)
  const width = Math.round(cssWidth * ratio)
  const height = Math.round(cssHeight * ratio)

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }

  viewWidth = width
  viewHeight = height
}

onMounted(() => {
  const canvas = viewportRef.value
  const minimap = minimapRef.value
  if (!canvas || !minimap) return

  const ctx = canvas.getContext('2d')
  const minimapCtx = minimap.getContext('2d')
  if (!ctx || !minimapCtx) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const minimapPixelSize = Math.round(MINIMAP_CSS_SIZE * dpr)
  minimap.width = minimapPixelSize
  minimap.height = minimapPixelSize

  syncViewportSize(canvas)
  resizeObserver = new ResizeObserver(() => syncViewportSize(canvas))
  resizeObserver.observe(canvas)
  weaponSprite = createWeaponArt()

  input = createInput(canvas, (locked) => {
    pointerLocked.value = locked
    if (!locked) triggerHeld = false
  })
  sfx = createSfx()

  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('mousedown', handleMouseDown)
  window.addEventListener('mouseup', handleMouseUp)
  syncHud()

  const frame = (timestamp: number) => {
    rafId = window.requestAnimationFrame(frame)

    const dt = lastTimestamp === 0 ? 0 : Math.min((timestamp - lastTimestamp) / 1000, MAX_DELTA_TIME)
    lastTimestamp = timestamp
    if (statWindowStart === 0) statWindowStart = timestamp

    const snapshot = input?.read()
    if (snapshot) player = applyPlayerInput(player, snapshot, dt)

    // ── 武器状态机 ─────────────────────────────────────────
    const weaponUpdate = updateWeapon(weapon, { trigger: triggerHeld, reload: reloadQueued }, dt)
    weapon = weaponUpdate.weapon
    reloadQueued = false

    if (weaponUpdate.shot) {
      viewKick.pitch += 0.02 + Math.random() * 0.012
      viewKick.yaw += (Math.random() - 0.5) * 0.016
      hitFlash = 1
      sfx?.shot()
    }
    if (weaponUpdate.reloadStarted) sfx?.reload()
    if (weaponUpdate.dryFire) sfx?.dry()
    if (weaponUpdate.shot || weaponUpdate.reloadStarted || weaponUpdate.reloadFinished) syncAmmo()

    // 后坐力回弹与准星闪光衰减
    const kickDecay = Math.exp(-dt * 9)
    viewKick.pitch *= kickDecay
    viewKick.yaw *= kickDecay
    hitFlash = Math.max(0, hitFlash - dt * 9)

    // ── 枪身摆动 ───────────────────────────────────────────
    const moving = snapshot ? Math.hypot(snapshot.forward, snapshot.strafe) > 0 : false
    bobBlend += ((moving ? 1 : 0) - bobBlend) * Math.min(1, dt * 10)
    if (moving && snapshot) bobPhase += dt * (snapshot.run ? 11 : 7)

    // ── 渲染 ───────────────────────────────────────────────
    const camera: PlayerState = {
      x: player.x,
      y: player.y,
      yaw: player.yaw + viewKick.yaw,
      pitch: clampPitch(player.pitch + viewKick.pitch),
      eyeHeight: player.eyeHeight,
      verticalVelocity: player.verticalVelocity,
    }

    renderScene(ctx, camera, viewWidth, viewHeight)

    if (weaponSprite) {
      const reloadElapsed = weapon.reloadRemaining > 0 ? 1 - weapon.reloadRemaining / RELOAD_TIME : 0
      drawWeapon(
        ctx,
        weaponSprite,
        {
          bobX: Math.sin(bobPhase) * viewHeight * 0.006 * bobBlend,
          bobY: Math.abs(Math.cos(bobPhase)) * viewHeight * 0.007 * bobBlend,
          recoil: weapon.recoil,
          flash: weapon.flashRemaining / FLASH_TIME,
          reloadProgress: Math.sin(Math.PI * reloadElapsed),
        },
        viewWidth,
        viewHeight,
      )
    }

    drawCrosshair(ctx, viewWidth, viewHeight, hitFlash)
    drawMinimap(minimapCtx, player, minimapPixelSize)

    frameCounter += 1
    if (timestamp - statWindowStart >= 500) {
      const elapsed = Math.max((timestamp - statWindowStart) / 1000, 0.001)
      hud.fps = Math.round(frameCounter / elapsed)
      syncHud()
      statWindowStart = timestamp
      frameCounter = 0
    }
  }

  rafId = window.requestAnimationFrame(frame)
})

onBeforeUnmount(() => {
  if (rafId) window.cancelAnimationFrame(rafId)
  rafId = 0
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('mousedown', handleMouseDown)
  window.removeEventListener('mouseup', handleMouseUp)
  resizeObserver?.disconnect()
  resizeObserver = null
  triggerHeld = false
  sfx?.dispose()
  sfx = null
  input?.dispose()
  input = null
})
</script>



<style scoped lang="scss">
.raycaster {
  height: 100vh;
  box-sizing: border-box;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #000;
  font-size: 12px;
  color: #fff;
  overflow: hidden;

  .header {
    padding: 2px 14px;
    display: flex;
    gap: 8px;
  }

  .viewport {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    border: 1px solid #fff;
    background: #000;

    .viewport-canvas {
      display: block;
      width: 100%;
      height: 100%;
      cursor: crosshair;
    }

    .minimap {
      position: absolute;
      top: 14px;
      right: 14px;
      border: 1px solid #fff;
      background: #000;
      pointer-events: none;
    }

    .hud {
      position: absolute;
      left: 14px;
      bottom: 14px;
      display: flex;
      gap: 8px;
      pointer-events: none;

      .hud-item {
        padding: 7px 12px;
        border: 1px solid #fff;
      }
    }

    .lock-hint {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      padding: 14px;
      background: #000;
      border: 1px solid #fff;
      pointer-events: none;
    }
  }

  .help {
    flex-shrink: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .help-item {
      padding: 2px 8px;
      border: 1px solid #fff;
    }

    .help-item,
    button {
      flex-shrink: 0;
      white-space: nowrap;
      word-break: nowrap;
    }
  }
}
</style>
