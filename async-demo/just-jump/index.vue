<template>
  <div ref="rootRef" class="just-jump-container">
    <layout-com style="width: 400px;" title="路径绘制控制器" type="panel"
      :addLayerBtnList="[{ label: '显示源码', callback: () => openDialog({ overlayStyle: { zIndex: 1000 } }) }]">
      <controlItem label="重力" inputType="range" v-model.number="config.gravity" :labelValue="`${config.gravity} px/s²`"
        :slotProps="{ min: 0, max: 4000, step: 50 }" />
      <controlItem label="反弹系数" inputType="range" v-model.number="config.bounce" :labelValue="config.bounce.toFixed(2)"
        :slotProps="{ min: 0, max: 1, step: 0.05 }" />
      <controlItem label="地面摩擦" inputType="range" v-model.number="config.friction"
        :labelValue="config.friction.toFixed(1)" :slotProps="{ min: 0, max: 10, step: 0.1 }" />
      <controlItem label="蓄力上限" inputType="range" v-model.number="config.maxCharge"
        :labelValue="`${config.maxCharge} px`" :slotProps="{ min: 50, max: 400, step: 10 }" />
      <controlItem label="拖拽阻尼" inputType="range" v-model.number="config.damping"
        :labelValue="config.damping.toFixed(2)" :slotProps="{ min: 0.1, max: 1, step: 0.05 }" />
      <controlItem label="换算系数" inputType="range" v-model.number="config.launchPower"
        :labelValue="config.launchPower.toFixed(1)" :slotProps="{ min: 1, max: 20, step: 0.5 }" />
      <controlItem label="辅助轨迹" inputType="checkbox" v-model="config.showTrajectory" />
      <div class="debug-row">
        <div>
          <div>playerX：<input style="width: 100px;" id="playerX" type="number" :value.number="playerX" /></div>
          <div>playerY：<input style="width: 100px;" id="playerY" type="number" :value.number="playerY" /></div>
        </div>
        <customBtnCom @click="onTeleport">传送</customBtnCom>
      </div>
      <div class="debug-row">
        <span>速度x-y:</span>
        <span>{{ velocityX }}-{{ velocityY }}</span>
      </div>
      <div class="debug-row">
        <span>相机:</span>
        <span>{{ cameraPos }}</span>
      </div>
      <div class="debug-row">
        <span>落地:</span>
        <span>{{ isGrounded ? '✅' : '❌' }}</span>
      </div>
      <div class="debug-row">
        <span>平台数:</span>
        <span>{{ platformCount }}</span>
      </div>
      <div class="debug-row">
        <customBtnCom @click="onReset">🔄 回到原点</customBtnCom>
        <customBtnCom @click="onRegenerate">🗺️ 重新生成</customBtnCom>
      </div>
      <div>
        <p>按住并拖拽屏幕 → 蓄力跳跃</p>
        <p>箭头方向 = 拖拽反方向</p>
        <p>上升越高，分数越高！</p>
      </div>
    </layout-com>

    <div class="game-canvas-wrap">
      <canvas ref="canvasRef" class="game-canvas" @pointerdown.prevent="onPointerDown" />
      <div class="joystick-wrap">
        <div class="joystick-body">
          <div ref="joystickBase" class="joystick-base" @pointerdown.prevent="onJoystickDown">
            <div class="joystick-stick" :style="joystickStyle" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, shallowRef, computed } from 'vue'
import { createGame, DEFAULT_CONFIG } from './game.js'
import { controlItem, customBtnCom, layoutCom, } from '../components/form-control/index.vue'
import baseConfig from '../static/hooks/extends.js'
defineOptions({
  extends: baseConfig({
    customDialog: import('../components/dialog/index.vue'),
  }),
})

const rootRef = ref(null)
const canvasRef = ref(null)
const config = reactive({ ...DEFAULT_CONFIG })
const game = shallowRef(null)

const playerX = ref(0)
const playerY = ref(0)
const velocityX = ref(0)
const velocityY = ref(0)

const joystickStick = ref(null)
const joystickActive = ref(false)
const joystickBase = ref(null)
const joystickOrigin = reactive({ x: 0, y: 0 })
const joystickPos = reactive({ x: 0, y: 0 })
const joystickHeadAtDown = reactive({ x: 0, y: 0 })

const joystickStyle = computed(() => {
  return {
    transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`,
  }
})

const playerPos = computed(() => {
  const p = game.value?.state.player
  return p ? `(${p.x.toFixed(0)}, ${p.y.toFixed(0)})` : '(0, 0)'
})

const playerVel = computed(() => {
  const p = game.value?.state.player
  return p ? `(${p.vx.toFixed(0)}, ${p.vy.toFixed(0)})` : '(0, 0)'
})

const cameraPos = computed(() => {
  const c = game.value?.state.camera
  return c ? `(${c.x.toFixed(0)}, ${c.y.toFixed(0)})` : '(0, 0)'
})

const isGrounded = computed(() => {
  return game.value?.state.player.isGrounded ?? false
})

const platformCount = computed(() => {
  return game.value?.state.platforms.length ?? 0
})

const onJoystickDown = (e) => {
  if (game.value?.state.gameOver) {
    game.value.reset()
    return
  }
  if (game.value?.state.input.state !== 'idle' || !game.value?.state.player.isGrounded) return

  const baseRect = joystickBase.value.getBoundingClientRect()
  joystickOrigin.x = baseRect.left + baseRect.width / 2
  joystickOrigin.y = baseRect.top + baseRect.height / 2
  joystickActive.value = true

  const head = game.value?.getPlayerHeadScreenPos() || { x: 0, y: 0 }
  joystickHeadAtDown.x = head.x
  joystickHeadAtDown.y = head.y
  const canvasRect = canvasRef.value.getBoundingClientRect()
  game.value?.onPointerDown({
    clientX: canvasRect.left + head.x,
    clientY: canvasRect.top + head.y,
  })
}

const onJoystickMove = (e) => {
  if (!joystickActive.value) return

  const dx = e.clientX - joystickOrigin.x
  const dy = e.clientY - joystickOrigin.y
  const dist = Math.hypot(dx, dy)
  const maxDist = 60

  if (dist > maxDist) {
    const k = maxDist / dist
    joystickPos.x = dx * k
    joystickPos.y = dy * k
  } else {
    joystickPos.x = dx
    joystickPos.y = dy
  }

  const scale = config.maxCharge / maxDist
  const canvasRect = canvasRef.value.getBoundingClientRect()
  game.value?.onPointerMove({
    clientX: canvasRect.left + joystickHeadAtDown.x + joystickPos.x * scale,
    clientY: canvasRect.top + joystickHeadAtDown.y + joystickPos.y * scale,
  })
}

const onJoystickUp = () => {
  if (!joystickActive.value) return
  joystickActive.value = false
  joystickPos.x = 0
  joystickPos.y = 0
  game.value?.onPointerUp()
}

const onPointerDown = (e) => {
  if (game.value?.state.gameOver) {
    game.value.reset()
    return
  }
  game.value?.onPointerDown(e)
}
const onPointerMove = (e) => game.value?.onPointerMove(e)
const onPointerUp = () => game.value?.onPointerUp()
const onPointerCancel = () => game.value?.onPointerUp()

const onReset = () => game.value?.reset()
const onRegenerate = () => game.value?.reset()

const onTeleport = () => {
  const rawX = document.querySelector('#playerX')?.value
  const rawY = document.querySelector('#playerY')?.value
  const valX = Number(rawX)
  const valY = Number(rawY)
  if (!Number.isFinite(valX) || !Number.isFinite(valY)) {
    console.warn('传送失败：坐标无效', rawX, rawY)
    return
  }
  console.log('dom called', valX, valY)
  game.value?.teleport(valX, valY)
}

let resizeObserver = null

let debugUpdateId = null

const updateDebugValues = () => {
  const activeEl = document.activeElement
  if ((activeEl && activeEl.tagName === 'INPUT')) {
    debugUpdateId = requestAnimationFrame(updateDebugValues)
    return
  }
  const p = game.value?.state.player
  if (p) {
    playerX.value = Math.round(p.x)
    playerY.value = Math.round(p.y)
    velocityX.value = Math.round(p.vx)
    velocityY.value = Math.round(p.vy)
  }
  debugUpdateId = requestAnimationFrame(updateDebugValues)
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  game.value = createGame(canvas, config)
  game.value.resize()
  game.value.start()

  updateDebugValues()

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerCancel)

  window.addEventListener('pointermove', onJoystickMove)
  window.addEventListener('pointerup', onJoystickUp)
  window.addEventListener('pointercancel', onJoystickUp)

  resizeObserver = new ResizeObserver(() => game.value?.resize())
  resizeObserver.observe(canvas)
})

onBeforeUnmount(() => {
  game.value?.stop()
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerCancel)
  window.removeEventListener('pointermove', onJoystickMove)
  window.removeEventListener('pointerup', onJoystickUp)
  window.removeEventListener('pointercancel', onJoystickUp)
  resizeObserver?.disconnect()
  if (debugUpdateId !== null) cancelAnimationFrame(debugUpdateId)
})
</script>

<style scoped lang="scss">
$unit: 100px;

.just-jump-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  overflow: auto;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  display: flex;

  .game-canvas-wrap {
    width: 5 * $unit;
    height: 8 * $unit;
    border: 1px solid #000;
    padding: 0 200px 0 0;
    flex-shrink: 0;
    position: relative;

    .game-canvas {
      display: block;
      width: 100%;
      height: 100%;
      cursor: grab;

      &:active {
        cursor: grabbing;
      }
    }

    .joystick-wrap {
      position: absolute;
      right: 40px;
      bottom: 40px;

      .joystick-body {

        .joystick-base {
          width: 120px;
          height: 120px;
          background: rgba(15, 23, 42, 0.7);
          border: 2px solid #334155;
          border-radius: 50%;
          position: relative;
          cursor: grab;
          touch-action: none;

          &:active {
            cursor: grabbing;
          }
        }

        .joystick-stick {
          position: absolute;
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #475569, #334155);
          border: 2px solid #64748b;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: transform 0.05s ease-out;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);

          &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            transform: translate(-50%, -50%);
          }
        }
      }
    }
  }
}
</style>
