import { cellAt, MAP_HEIGHT, MAP_WIDTH, PLAYER_SPAWN } from './map.ts'
import type { InputSnapshot, PlayerState } from './types.ts'
import { EYE_HEIGHT, MAX_PITCH } from './view.ts'

export const WALK_SPEED = 2.4
export const RUN_SPEED = 4.2
/** 下蹲移动速度，明显低于站立行走 */
export const CROUCH_SPEED = 1.2
/** 站立时的眼睛高度（世界单位），与墙高 1 的坐标系配合 */
export const STAND_HEIGHT = EYE_HEIGHT
/** 下蹲时的眼睛高度 */
export const CROUCH_HEIGHT = 0.3
/** 起跳初速度（世界单位 / 秒），约能跳起 0.24 */
export const JUMP_SPEED = 2.4
/** 重力加速度（世界单位 / 秒²） */
export const GRAVITY = 12
/** 站立 / 下蹲之间过渡的插值速度 */
const CROUCH_LERP = 14
/** 键盘转向速度（弧度 / 秒） */
export const TURN_SPEED = 2.2
/** 键盘俯仰速度（弧度 / 秒） */
export const LOOK_SPEED = 1.5
/** 指针锁定下每像素鼠标位移对应的转角 */
export const MOUSE_SENSITIVITY = 0.0032
/** 玩家碰撞半径，需小于半格才能通过门洞 */
export const PLAYER_RADIUS = 0.26

export const createPlayer = (): PlayerState => ({
  ...PLAYER_SPAWN,
  pitch: 0,
  eyeHeight: STAND_HEIGHT,
  verticalVelocity: 0,
})

const isSolid = (x: number, y: number): boolean => cellAt(Math.floor(x), Math.floor(y)) > 0

/** 用玩家外接方框的四角做碰撞检测，得到的效果接近圆形碰撞体 */
const canStand = (x: number, y: number): boolean => {
  const r = PLAYER_RADIUS
  return (
    !isSolid(x - r, y - r) &&
    !isSolid(x + r, y - r) &&
    !isSolid(x - r, y + r) &&
    !isSolid(x + r, y + r)
  )
}

const normalizeAngle = (angle: number): number => {
  const full = Math.PI * 2
  return ((angle % full) + full) % full
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

/**
 * 纯函数式更新：输入快照 + 时间步长 -> 新的玩家状态。
 * 移动量与帧率无关，碰撞按 X / Y 轴分别求解，贴墙时可以自然“滑行”。
 */
export const applyPlayerInput = (
  player: PlayerState,
  input: InputSnapshot,
  dt: number,
): PlayerState => {
  const yaw = normalizeAngle(
    player.yaw + input.turn * TURN_SPEED * dt + input.mouseDelta * MOUSE_SENSITIVITY,
  )
  // 鼠标向下移动（movementY > 0）对应低头，因此取负
  const pitch = clamp(
    player.pitch + input.lookVertical * LOOK_SPEED * dt - input.mouseDeltaY * MOUSE_SENSITIVITY,
    -MAX_PITCH,
    MAX_PITCH,
  )

  const magnitude = Math.hypot(input.forward, input.strafe)
  let speed = WALK_SPEED
  if (input.crouch) {
    speed = CROUCH_SPEED
  } else if (input.run) {
    speed = RUN_SPEED
  }
  let x = player.x
  let y = player.y

  if (magnitude > 0 && dt > 0) {
    // 斜向移动归一化，避免“按住 W+D 更快”
    const scale = (magnitude > 1 ? 1 / magnitude : 1) * speed * dt
    const dirX = Math.cos(yaw)
    const dirY = Math.sin(yaw)
    // 右方向 = 朝向顺时针旋转 90°
    const rightX = -dirY
    const rightY = dirX
    const dx = (dirX * input.forward + rightX * input.strafe) * scale
    const dy = (dirY * input.forward + rightY * input.strafe) * scale

    if (canStand(x + dx, y)) x += dx
    if (canStand(x, y + dy)) y += dy
  }

  // ── 竖直运动：起跳 / 重力 / 下蹲高度过渡 ─────────────────
  const groundHeight = input.crouch ? CROUCH_HEIGHT : STAND_HEIGHT
  let eyeHeight = player.eyeHeight
  let verticalVelocity = player.verticalVelocity

  if (verticalVelocity !== 0) {
    verticalVelocity -= GRAVITY * dt
    eyeHeight += verticalVelocity * dt
    if (eyeHeight <= groundHeight) {
      eyeHeight = groundHeight
      verticalVelocity = 0
    }
  } else {
    // 在地面上：站立与下蹲之间平滑过渡
    eyeHeight += (groundHeight - eyeHeight) * Math.min(1, dt * CROUCH_LERP)
    if (input.jump && !input.crouch && Math.abs(eyeHeight - STAND_HEIGHT) < 0.05) {
      verticalVelocity = JUMP_SPEED
      eyeHeight += verticalVelocity * dt
    }
  }

  return { x, y, yaw, pitch, eyeHeight, verticalVelocity }
}

/** 保证出生点合法性，方便后续换地图时自检 */
export const isSpawnValid = (): boolean => {
  const { x, y } = PLAYER_SPAWN
  return x > 0 && y > 0 && x < MAP_WIDTH - 1 && y < MAP_HEIGHT - 1 && canStand(x, y)
}
