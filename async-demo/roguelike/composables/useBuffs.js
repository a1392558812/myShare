import { ref } from 'vue'

export function useBuffs() {
  const buffs = ref([])

  
  const addBuff = (type, label, value, duration, source) => {
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

  
  const tickBuffs = (dt) => {
    buffs.value = buffs.value.filter(b => {
      b.remaining -= dt
      return b.remaining > 0
    })
  }

  const getAttackMultiplier = () => {
    let mult = 1
    buffs.value.forEach(b => {
      if (b.type === 'attackBoost') {
        mult *= (1 + b.value)
      }
    })
    return mult
  }

  const getSpeedMultiplier = () => {
    let mult = 1
    buffs.value.forEach(b => {
      if (b.type === 'speedShrine') {
        mult *= (1 + b.value.speedBoost)
      }
    })
    return mult
  }

  const getDodgeChance = () => {
    let chance = 0
    buffs.value.forEach(b => {
      if (b.type === 'speedShrine') {
        chance += b.value.dodgeChance
      }
    })
    return chance
  }

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
