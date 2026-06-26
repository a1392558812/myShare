/**
 * useBuffs — 玩家临时增益状态管理
 * 管理力量祭坛、速度神龛等事件施加的临时 buff
 */
import { ref } from 'vue'

/**
 * @returns {object} buff API
 */
export function useBuffs() {
  /** @type {import('vue').Ref<Array<{ type: string, label: string, value: any, remaining: number, source: string }>>} */
  const buffs = ref([])

  /**
   * 施加一个增益
   * @param {string} type - buff 类型标识
   * @param {string} label - HUD 显示文本
   * @param {any} value - buff 数值
   * @param {number} duration - 持续时间 ms
   * @param {string} source - 来源事件 id
   */
  const addBuff = (type, label, value, duration, source) => {
    // 同类型 buff 刷新时间（不叠加）
    const existing = buffs.value.find(b => b.type === type)
    if (existing) {
      existing.remaining = Math.max(existing.remaining, duration)
      return
    }
    buffs.value.push({
      type,
      label,
      value,
      remaining: duration,
      source,
    })
  }

  /**
   * 每帧递减计时，到期自动移除
   * @param {number} dt - 帧间隔 ms
   */
  const tickBuffs = (dt) => {
    buffs.value = buffs.value.filter(b => {
      b.remaining -= dt
      return b.remaining > 0
    })
  }

  /** 获取当前总攻击倍率（1 = 无加成） */
  const getAttackMultiplier = () => {
    let mult = 1
    buffs.value.forEach(b => {
      if (b.type === 'attackBoost') {
        mult *= (1 + b.value)
      }
    })
    return mult
  }

  /** 获取当前总移速倍率（1 = 无加成） */
  const getSpeedMultiplier = () => {
    let mult = 1
    buffs.value.forEach(b => {
      if (b.type === 'speedShrine') {
        mult *= (1 + b.value.speedBoost)
      }
      // 无敌自带的移速加成不在这里处理（usePlayer 内部已处理）
    })
    return mult
  }

  /** 获取当前总闪避率（0 = 不闪避） */
  const getDodgeChance = () => {
    let chance = 0
    buffs.value.forEach(b => {
      if (b.type === 'speedShrine') {
        chance += b.value.dodgeChance
      }
    })
    return chance
  }

  /** 查询是否有指定类型的 buff */
  const hasBuff = (type) => buffs.value.some(b => b.type === type)

  return {
    buffs,
    addBuff,
    tickBuffs,
    getAttackMultiplier,
    getSpeedMultiplier,
    getDodgeChance,
    hasBuff,
  }
}
