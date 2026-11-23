import type { InputSnapshot } from './types.ts'

const MOVEMENT_KEYS = new Set([
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'KeyQ',
  'KeyE',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ShiftLeft',
  'ShiftRight',
  'PageUp',
  'PageDown',
  'Space',
  'ControlLeft',
  'ControlRight',
])

export interface InputController {
  /** 取走当前帧的输入快照，并清零累积的鼠标位移 */
  read: () => InputSnapshot
  requestPointerLock: () => void
  isPointerLocked: () => boolean
  dispose: () => void
}

/**
 * 键盘 + 鼠标输入统一收敛到这里：
 * - 键盘只记录按下集合，由 read() 换算成方向量；
 * - 鼠标只在指针锁定状态下累积 movementX / movementY，避免未锁定时的抖动。
 */
export const createInput = (
  canvas: HTMLCanvasElement,
  onLockChange?: (locked: boolean) => void,
): InputController => {
  const pressed = new Set<string>()
  let mouseDelta = 0
  let mouseDeltaY = 0
  /** 空格按下沿：只在按下瞬间置位，read() 消费后清零，避免按住空格连跳 */
  let jumpQueued = false

  const onKeyDown = (event: KeyboardEvent) => {
    if (MOVEMENT_KEYS.has(event.code)) event.preventDefault()
    if (event.code === 'Space' && !pressed.has('Space')) jumpQueued = true
    pressed.add(event.code)
  }

  const onKeyUp = (event: KeyboardEvent) => {
    pressed.delete(event.code)
  }

  const onWindowBlur = () => {
    pressed.clear()
    jumpQueued = false
  }

  const onMouseMove = (event: MouseEvent) => {
    if (document.pointerLockElement !== canvas) return
    mouseDelta += event.movementX
    mouseDeltaY += event.movementY
  }

  const onPointerLockChange = () => {
    onLockChange?.(document.pointerLockElement === canvas)
  }

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onWindowBlur)
  window.addEventListener('mousemove', onMouseMove)
  document.addEventListener('pointerlockchange', onPointerLockChange)

  const read = (): InputSnapshot => {
    const forward =
      Number(pressed.has('KeyW') || pressed.has('ArrowUp')) -
      Number(pressed.has('KeyS') || pressed.has('ArrowDown'))
    const strafe = Number(pressed.has('KeyD')) - Number(pressed.has('KeyA'))
    const turn =
      Number(pressed.has('KeyE') || pressed.has('ArrowRight')) -
      Number(pressed.has('KeyQ') || pressed.has('ArrowLeft'))
    const run = pressed.has('ShiftLeft') || pressed.has('ShiftRight')
    const jump = jumpQueued
    const crouch = pressed.has('ControlLeft') || pressed.has('ControlRight')
    const lookVertical = Number(pressed.has('PageUp')) - Number(pressed.has('PageDown'))
    const snapshot: InputSnapshot = {
      forward,
      strafe,
      turn,
      run,
      jump,
      crouch,
      mouseDelta,
      mouseDeltaY,
      lookVertical,
    }
    mouseDelta = 0
    mouseDeltaY = 0
    jumpQueued = false
    return snapshot
  }

  const requestPointerLock = () => {
    if (document.pointerLockElement === canvas) return
    canvas.requestPointerLock()
  }

  const isPointerLocked = () => document.pointerLockElement === canvas

  const dispose = () => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('blur', onWindowBlur)
    window.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('pointerlockchange', onPointerLockChange)
    pressed.clear()
    if (document.pointerLockElement === canvas) document.exitPointerLock()
  }

  return { read, requestPointerLock, isPointerLocked, dispose }
}
