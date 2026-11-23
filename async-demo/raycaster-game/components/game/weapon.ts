/** AK-47 的武器状态，全部用秒 / 发计数，方便逐帧推进 */
export interface WeaponState {
  /** 弹匣内剩余子弹 */
  ammoInMag: number
  /** 备弹总数 */
  reserveAmmo: number
  /** 换弹剩余时间（秒），> 0 表示正在换弹 */
  reloadRemaining: number
  /** 距离下一发可击发的冷却（秒） */
  cooldown: number
  /** 枪口火焰剩余时间（秒） */
  flashRemaining: number
  /** 后坐力强度 0~1，随时间衰减 */
  recoil: number
}

export interface WeaponCommand {
  trigger: boolean
  reload: boolean
}

export interface WeaponUpdate {
  weapon: WeaponState
  shot: boolean
  dryFire: boolean
  reloadStarted: boolean
  reloadFinished: boolean
}

export const MAG_SIZE = 30
/** 备弹无限：换弹永远可以补满，HUD 显示为 ∞ */
export const RESERVE_START = Number.POSITIVE_INFINITY
/** 换弹时长（秒） */
export const RELOAD_TIME = 2.1
/** AK 理论射速约 600 发/分 */
export const FIRE_INTERVAL = 0.095
/** 枪口火焰持续时间（秒） */
export const FLASH_TIME = 0.055

export const createWeapon = (): WeaponState => ({
  ammoInMag: MAG_SIZE,
  reserveAmmo: RESERVE_START,
  reloadRemaining: 0,
  cooldown: 0,
  flashRemaining: 0,
  recoil: 0,
})

/**
 * 纯函数状态机：换弹计时、射速冷却、后坐力衰减都在这里，
 * 组件只负责把按键状态喂进来、把产生的音效 / 反馈播出去。
 */
export const updateWeapon = (
  weapon: WeaponState,
  command: WeaponCommand,
  dt: number,
): WeaponUpdate => {
  let ammoInMag = weapon.ammoInMag
  let reserveAmmo = weapon.reserveAmmo
  let reloadRemaining = weapon.reloadRemaining
  let cooldown = Math.max(0, weapon.cooldown - dt)
  let flashRemaining = Math.max(0, weapon.flashRemaining - dt)
  let recoil = Math.max(0, weapon.recoil - dt * 6.5)

  let shot = false
  let dryFire = false
  let reloadStarted = false
  let reloadFinished = false

  // 换弹读条：这一帧刚好走完就补弹
  const wasReloading = reloadRemaining > 0
  reloadRemaining = Math.max(0, reloadRemaining - dt)
  if (wasReloading && reloadRemaining === 0) {
    const needed = MAG_SIZE - ammoInMag
    const taken = Math.min(needed, reserveAmmo)
    ammoInMag += taken
    reserveAmmo -= taken
    reloadFinished = true
  }

  if (command.reload && !wasReloading && ammoInMag < MAG_SIZE && reserveAmmo > 0) {
    reloadRemaining = RELOAD_TIME
    reloadStarted = true
  }

  const canShoot = command.trigger && reloadRemaining <= 0 && cooldown <= 0

  if (canShoot && ammoInMag > 0) {
    ammoInMag -= 1
    cooldown = FIRE_INTERVAL
    flashRemaining = FLASH_TIME
    recoil = Math.min(1, recoil + 0.55)
    shot = true
  } else if (canShoot && reserveAmmo > 0) {
    // 打空后继续扣扳机：自动换弹
    reloadRemaining = RELOAD_TIME
    reloadStarted = true
  } else if (canShoot) {
    dryFire = true
    cooldown = 0.35
  }

  return {
    weapon: { ammoInMag, reserveAmmo, reloadRemaining, cooldown, flashRemaining, recoil },
    shot,
    dryFire,
    reloadStarted,
    reloadFinished,
  }
}
