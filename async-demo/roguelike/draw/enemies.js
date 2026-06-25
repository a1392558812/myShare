import { DIRECTION } from '../constants.js'

// ═══════════ 近战敌人精灵（橙褐武士 — 宽肩 + 巨斧） ═══════════
export const drawMeleeEnemy = (ctx, half, dir, legOff, color, color2) => {
  const headColor = '#fed7aa'
  const axeShaft = '#78350f'
  const axeBlade = '#9ca3af'

  if (dir === DIRECTION.FRONT) {
    // 头部（宽大）
    ctx.fillStyle = headColor; ctx.fillRect(-10, -half + 2, 20, 13)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-7, -half + 6, 4, 4); ctx.fillRect(3, -half + 6, 4, 4)
    // 身体（壮硕宽体）
    ctx.fillStyle = color; ctx.fillRect(-13, -half + 15, 26, 17)
    ctx.fillStyle = color2; ctx.fillRect(-11, -half + 17, 22, 6)
    // 腿
    ctx.fillStyle = '#78350f'; ctx.fillRect(-11 + legOff, -half + 32, 9, 8); ctx.fillRect(2 - legOff, -half + 32, 9, 8)
    // ⭐ 巨斧（右侧 — 长柄 + 大刃）
    ctx.fillStyle = axeShaft; ctx.fillRect(14, -half + 10, 3, 20)
    ctx.fillStyle = axeBlade; ctx.fillRect(11, -half + 4, 6, 10)
    ctx.fillStyle = '#e5e7eb'; ctx.fillRect(10, -half + 2, 8, 4) // 斧刃高光
  } else if (dir === DIRECTION.LEFT) {
    ctx.fillStyle = headColor; ctx.fillRect(-8, -half + 2, 18, 13)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-6, -half + 6, 4, 4)
    ctx.fillStyle = color; ctx.fillRect(-13, -half + 15, 24, 17)
    ctx.fillStyle = color2; ctx.fillRect(-11, -half + 17, 20, 6)
    ctx.fillStyle = '#78350f'; ctx.fillRect(-8 + legOff, -half + 32, 9, 8); ctx.fillRect(-1 - legOff, -half + 32, 9, 8)
    ctx.fillStyle = axeShaft; ctx.fillRect(12, -half + 10, 3, 20)
    ctx.fillStyle = axeBlade; ctx.fillRect(8, -half + 4, 7, 12)
  } else {
    ctx.fillStyle = headColor; ctx.fillRect(-8, -half + 2, 18, 13)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(2, -half + 6, 4, 4)
    ctx.fillStyle = color; ctx.fillRect(-11, -half + 15, 24, 17)
    ctx.fillStyle = color2; ctx.fillRect(-9, -half + 17, 20, 6)
    ctx.fillStyle = '#78350f'; ctx.fillRect(-8 - legOff, -half + 32, 9, 8); ctx.fillRect(1 + legOff, -half + 32, 9, 8)
  }
}

// 远程敌人精灵（法师）
export const drawRangedEnemy = (ctx, half, dir, legOff, color, color2) => {
  const headColor = '#bfdbfe'
  if (dir === DIRECTION.FRONT) {
    ctx.fillStyle = headColor; ctx.fillRect(-7, -half + 2, 14, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-4, -half + 6, 3, 3); ctx.fillRect(1, -half + 6, 3, 3)
    ctx.fillStyle = color; ctx.fillRect(-8, -half + 14, 16, 18)
    ctx.fillStyle = color2; ctx.fillRect(-6, -half + 16, 12, 4)
    ctx.fillStyle = '#1e3a5f'; ctx.fillRect(-5 + legOff, -half + 32, 5, 6); ctx.fillRect(0 - legOff, -half + 32, 5, 6)
    ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(10, -half + 6); ctx.lineTo(10, -half + 28); ctx.stroke()
    ctx.fillStyle = '#a78bfa'; ctx.beginPath(); ctx.arc(10, -half + 4, 4, 0, Math.PI * 2); ctx.fill()
  } else if (dir === DIRECTION.LEFT) {
    ctx.fillStyle = headColor; ctx.fillRect(-5, -half + 2, 12, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-3, -half + 6, 3, 3)
    ctx.fillStyle = color; ctx.fillRect(-8, -half + 14, 16, 18)
    ctx.fillStyle = '#1e3a5f'; ctx.fillRect(-4 + legOff, -half + 32, 5, 6); ctx.fillRect(0 - legOff, -half + 32, 5, 6)
    ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(-10, -half + 6); ctx.lineTo(-10, -half + 28); ctx.stroke()
    ctx.fillStyle = '#a78bfa'; ctx.beginPath(); ctx.arc(-10, -half + 4, 4, 0, Math.PI * 2); ctx.fill()
  } else {
    ctx.fillStyle = headColor; ctx.fillRect(-5, -half + 2, 12, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(0, -half + 6, 3, 3)
    ctx.fillStyle = color; ctx.fillRect(-6, -half + 14, 16, 18)
    ctx.fillStyle = '#1e3a5f'; ctx.fillRect(-4 - legOff, -half + 32, 5, 6); ctx.fillRect(0 + legOff, -half + 32, 5, 6)
    ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(10, -half + 6); ctx.lineTo(10, -half + 28); ctx.stroke()
    ctx.fillStyle = '#a78bfa'; ctx.beginPath(); ctx.arc(10, -half + 4, 4, 0, Math.PI * 2); ctx.fill()
  }
}

// ═══════════ 混合敌人精灵（青蓝战法师 — 双持：短剑 + 法球） ═══════════
export const drawHybridEnemy = (ctx, half, dir, legOff, color, color2) => {
  const headColor = '#cffafe'
  const bladeColor = '#0891b2'
  const bladeEdge = '#67e8f9'
  const orbColor = '#22d3ee'
  const orbGlow = 'rgba(34, 211, 238, 0.5)'

  if (dir === DIRECTION.FRONT) {
    ctx.fillStyle = headColor; ctx.fillRect(-8, -half + 2, 16, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-5, -half + 6, 3, 3); ctx.fillRect(2, -half + 6, 3, 3)
    // 身体（战袍）
    ctx.fillStyle = color; ctx.fillRect(-10, -half + 14, 20, 15)
    ctx.fillStyle = color2; ctx.fillRect(-8, -half + 16, 16, 5)
    // 腿
    ctx.fillStyle = '#155e75'; ctx.fillRect(-7 + legOff, -half + 29, 6, 8); ctx.fillRect(1 - legOff, -half + 29, 6, 8)
    // ⭐ 左手短剑（左侧）
    ctx.fillStyle = bladeColor; ctx.fillRect(-14, -half + 8, 3, 18)
    ctx.fillStyle = bladeEdge; ctx.fillRect(-15, -half + 6, 2, 6)
    // ⭐ 右手法球（右侧，发光）
    ctx.save()
    ctx.shadowColor = orbColor; ctx.shadowBlur = 8
    ctx.fillStyle = orbColor; ctx.beginPath(); ctx.arc(13, -half + 8, 5, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
    ctx.fillStyle = orbGlow; ctx.beginPath(); ctx.arc(13, -half + 8, 8, 0, Math.PI * 2); ctx.fill()
  } else if (dir === DIRECTION.LEFT) {
    ctx.fillStyle = headColor; ctx.fillRect(-6, -half + 2, 14, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-4, -half + 6, 3, 3)
    ctx.fillStyle = color; ctx.fillRect(-10, -half + 14, 18, 15)
    ctx.fillStyle = color2; ctx.fillRect(-8, -half + 16, 14, 5)
    ctx.fillStyle = '#155e75'; ctx.fillRect(-6 + legOff, -half + 29, 6, 8); ctx.fillRect(0 - legOff, -half + 29, 6, 8)
    // 短剑（侧视）
    ctx.fillStyle = bladeColor; ctx.fillRect(-12, -half + 8, 3, 16)
    ctx.fillStyle = bladeEdge; ctx.fillRect(-13, -half + 6, 2, 5)
    // 法球
    ctx.save(); ctx.shadowColor = orbColor; ctx.shadowBlur = 8
    ctx.fillStyle = orbColor; ctx.beginPath(); ctx.arc(11, -half + 8, 4, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  } else {
    ctx.fillStyle = headColor; ctx.fillRect(-6, -half + 2, 14, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(1, -half + 6, 3, 3)
    ctx.fillStyle = color; ctx.fillRect(-8, -half + 14, 18, 15)
    ctx.fillStyle = color2; ctx.fillRect(-6, -half + 16, 14, 5)
    ctx.fillStyle = '#155e75'; ctx.fillRect(-6 - legOff, -half + 29, 6, 8); ctx.fillRect(1 + legOff, -half + 29, 6, 8)
    // 法球
    ctx.save(); ctx.shadowColor = orbColor; ctx.shadowBlur = 8
    ctx.fillStyle = orbColor; ctx.beginPath(); ctx.arc(11, -half + 8, 5, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
    ctx.fillStyle = orbGlow; ctx.beginPath(); ctx.arc(11, -half + 8, 8, 0, Math.PI * 2); ctx.fill()
  }
}

// ═══════════ 自爆怪精灵（橙色、不稳定闪烁） ═══════════
export const drawBomberEnemy = (ctx, half, dir, legOff, color, color2, elapsed) => {
  const flicker = 0.7 + 0.3 * Math.sin((elapsed || 0) * 0.015)
  const headColor = '#fef3c7'
  ctx.globalAlpha = flicker
  if (dir === DIRECTION.FRONT) {
    ctx.fillStyle = headColor; ctx.fillRect(-7, -half + 2, 14, 10)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-4, -half + 5, 3, 3); ctx.fillRect(1, -half + 5, 3, 3)
    ctx.fillStyle = color; ctx.fillRect(-10, -half + 12, 20, 14)
    ctx.fillStyle = color2; ctx.fillRect(-8, -half + 14, 16, 8)
    ctx.fillStyle = '#78350f'; ctx.fillRect(-7 + legOff, -half + 26, 6, 8); ctx.fillRect(1 - legOff, -half + 26, 6, 8)
  } else {
    ctx.fillStyle = headColor; ctx.fillRect(-5, -half + 2, 12, 10)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(dir === DIRECTION.LEFT ? -3 : 1, -half + 5, 3, 3)
    ctx.fillStyle = color; ctx.fillRect(-9, -half + 12, 18, 14)
    ctx.fillStyle = color2; ctx.fillRect(-7, -half + 14, 14, 8)
    ctx.fillStyle = '#78350f'
    ctx.fillRect(dir === DIRECTION.LEFT ? -5 + legOff : -5 - legOff, -half + 26, 6, 8)
    ctx.fillRect(dir === DIRECTION.LEFT ? 1 - legOff : 1 + legOff, -half + 26, 6, 8)
  }
  ctx.globalAlpha = 1
}

// ═══════════ 召唤师精灵（深紫死灵师 — 兜帽长袍 + 法杖 + 浮游符文） ═══════════
export const drawSummonerEnemy = (ctx, half, dir, legOff, color, color2, elapsed) => {
  const headColor = '#e9d5ff'
  const robeDark = color2 || '#3b0764'
  const staffColor = '#4a1d6b'
  const staffOrb = '#c084fc'
  const runeColor = 'rgba(192, 132, 252, 0.8)'

  // ⭐ 浮游符文（3 颗，环绕身体旋转）
  const runeT = (elapsed || 0)
  for (let i = 0; i < 3; i++) {
    const angle = (Math.PI * 2 / 3) * i + runeT * 0.002
    const rx = Math.cos(angle) * (half + 10)
    const ry = Math.sin(angle) * (half + 4) - 4  // 偏上
    ctx.fillStyle = runeColor
    ctx.save()
    ctx.shadowColor = staffOrb; ctx.shadowBlur = 6
    // 菱形符文
    ctx.beginPath()
    ctx.moveTo(rx, ry - 3); ctx.lineTo(rx + 2, ry)
    ctx.lineTo(rx, ry + 3); ctx.lineTo(rx - 2, ry)
    ctx.closePath(); ctx.fill()
    ctx.restore()
  }

  if (dir === DIRECTION.FRONT) {
    // ⭐ 兜帽（高出头部的帽尖）
    ctx.fillStyle = robeDark
    ctx.fillRect(-7, -half - 3, 14, 7)
    ctx.fillRect(-3, -half - 6, 6, 4)         // 帽尖

    // 头部（罩在兜帽里）
    ctx.fillStyle = headColor; ctx.fillRect(-7, -half + 3, 14, 11)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-4, -half + 6, 3, 3); ctx.fillRect(1, -half + 6, 3, 3)
    // 长袍（垂至膝盖以下，比别的怪物长）
    ctx.fillStyle = color; ctx.fillRect(-10, -half + 14, 20, 18)
    ctx.fillStyle = robeDark; ctx.fillRect(-8, -half + 16, 16, 4)
    // 袍底
    ctx.fillStyle = '#2e1065'
    ctx.fillRect(-6 + legOff, -half + 32, 6, 7); ctx.fillRect(0 - legOff, -half + 32, 6, 7)
    // ⭐ 法杖（右侧）
    ctx.fillStyle = staffColor; ctx.fillRect(12, -half + 6, 3, 22)
    ctx.save()
    ctx.shadowColor = staffOrb; ctx.shadowBlur = 6
    ctx.fillStyle = staffOrb; ctx.beginPath(); ctx.arc(13.5, -half + 4, 4, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  } else if (dir === DIRECTION.LEFT) {
    // 兜帽（侧视）
    ctx.fillStyle = robeDark
    ctx.fillRect(-5, -half - 3, 13, 7)
    ctx.fillRect(-2, -half - 5, 4, 4)

    ctx.fillStyle = headColor; ctx.fillRect(-5, -half + 3, 12, 11)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-3, -half + 6, 3, 3)
    ctx.fillStyle = color; ctx.fillRect(-9, -half + 14, 18, 18)
    ctx.fillStyle = robeDark; ctx.fillRect(-7, -half + 16, 14, 4)
    ctx.fillStyle = '#2e1065'
    ctx.fillRect(-5 + legOff, -half + 32, 6, 7); ctx.fillRect(-1 - legOff, -half + 32, 6, 7)
    // 法杖
    ctx.fillStyle = staffColor; ctx.fillRect(10, -half + 6, 3, 20)
    ctx.save(); ctx.shadowColor = staffOrb; ctx.shadowBlur = 6
    ctx.fillStyle = staffOrb; ctx.beginPath(); ctx.arc(11, -half + 4, 3, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  } else {
    // 兜帽（侧视右向）
    ctx.fillStyle = robeDark
    ctx.fillRect(-6, -half - 3, 13, 7)
    ctx.fillRect(-1, -half - 5, 4, 4)

    ctx.fillStyle = headColor; ctx.fillRect(-6, -half + 3, 12, 11)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(1, -half + 6, 3, 3)
    ctx.fillStyle = color; ctx.fillRect(-9, -half + 14, 18, 18)
    ctx.fillStyle = robeDark; ctx.fillRect(-7, -half + 16, 14, 4)
    ctx.fillStyle = '#2e1065'
    ctx.fillRect(-5 - legOff, -half + 32, 6, 7); ctx.fillRect(1 + legOff, -half + 32, 6, 7)
    // 法杖
    ctx.fillStyle = staffColor; ctx.fillRect(9, -half + 6, 3, 22)
    ctx.save(); ctx.shadowColor = staffOrb; ctx.shadowBlur = 6
    ctx.fillStyle = staffOrb; ctx.beginPath(); ctx.arc(10.5, -half + 4, 4, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }

  // 符文光环（保留原有风格但颜色匹配新配色）
  ctx.strokeStyle = `rgba(192, 132, 252, ${0.25 + 0.12 * Math.sin((elapsed || 0) * 0.005)})`
  ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, half + 8, 0, Math.PI * 2); ctx.stroke()
}

// ═══════════ 冲锋者精灵（血红黑铠 — 角盔 + 刺肩 + 冲锋动效） ═══════════
export const drawChargerEnemy = (ctx, half, dir, legOff, color, color2, enemy) => {
  const chargeState = enemy.chargeState || 'idle'
  const isWinding = chargeState === 'winding'
  const isCharging = chargeState === 'charging'
  const headColor = '#fca5a5'
  const armorDark = color2 || '#1a1a2e'   // 黑铁铠色

  // ═══ winding 蓄力：进度 0→1 ═══
  const windProgress = isWinding ? Math.min((enemy.chargeStateTimer || 0) / (enemy.windUpDuration || 500), 1) : 0

  // ═══ charging 冲锋：进度 0→1（用于运动拖尾密度） ═══
  const chargeProgress = isCharging ? Math.min((enemy.chargeStateTimer || 0) / (enemy.chargeDuration || 400), 1) : 0

  // 冲锋方向向量
  const cdx = enemy.chargeDirX || 0
  const cdy = enemy.chargeDirY || 0

  // ──────────── winding 地面预警圈 ────────────
  if (isWinding) {
    ctx.save()
    const warnR = half * 1.2 + windProgress * half * 1.5
    const alpha = 0.2 + windProgress * 0.35
    ctx.strokeStyle = `rgba(255, 60, 30, ${alpha})`
    ctx.lineWidth = 2 + windProgress * 2
    ctx.setLineDash([4, 4])
    ctx.beginPath(); ctx.arc(0, 0, warnR, 0, Math.PI * 2); ctx.stroke()
    ctx.setLineDash([])
    // 内圈脉冲
    ctx.strokeStyle = `rgba(255, 60, 30, ${alpha * 0.7})`
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(0, 0, half * 0.8 + Math.sin(windProgress * 8) * 4, 0, Math.PI * 2); ctx.stroke()
    ctx.restore()
  }

  // ──────────── winding 方向箭头（头顶） ────────────
  if (isWinding && (cdx !== 0 || cdy !== 0)) {
    ctx.save()
    const arrowAlpha = 0.3 + windProgress * 0.6
    const arrowDist = half + 16
    const arrowX = cdx * arrowDist
    const arrowY = cdy * arrowDist - arrowDist * 0.3 // 偏上方
    // 箭头抖动
    const jitter = Math.sin(windProgress * 20) * (1 - windProgress) * 3
    ctx.translate(arrowX + jitter * cdx, arrowY + jitter * cdy)
    const arrowAngle = Math.atan2(cdy, cdx)
    ctx.rotate(arrowAngle)
    // 箭杆
    ctx.strokeStyle = `rgba(255, 100, 40, ${arrowAlpha})`
    ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.stroke()
    // 箭头尖
    ctx.fillStyle = `rgba(255, 80, 20, ${arrowAlpha})`
    ctx.beginPath()
    ctx.moveTo(10, 0); ctx.lineTo(3, -5); ctx.lineTo(3, 5); ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  // ──────────── winding 身体抖动 ────────────
  let shakeX = 0, shakeY = 0
  if (isWinding) {
    shakeX = Math.sin(windProgress * 30) * windProgress * 3
    shakeY = Math.cos(windProgress * 25) * windProgress * 2
  }

  ctx.save()
  ctx.translate(shakeX, shakeY)

  // ──────────── charging 拖尾残影（反向绘制 3 层） ────────────
  if (isCharging) {
    for (let t = 3; t >= 1; t--) {
      const trailAlpha = 0.18 / t
      const trailDist = t * 8
      ctx.save()
      ctx.globalAlpha = trailAlpha
      ctx.translate(-cdx * trailDist, -cdy * trailDist)
      // 简化残影：仅主体矩形
      ctx.fillStyle = '#ff6644'
      ctx.shadowColor = '#ff3300'
      ctx.shadowBlur = 4
      if (dir === DIRECTION.FRONT) {
        ctx.fillRect(-13, -half + 14, 26, 18)
      } else {
        ctx.fillRect(dir === DIRECTION.LEFT ? -12 : -10, -half + 14, 24, 18)
      }
      ctx.restore()
    }
  }

  // ──────────── 本体发光 ────────────
  if (isWinding) {
    ctx.shadowColor = '#ff2200'
    ctx.shadowBlur = 8 + windProgress * 18
  } else if (isCharging) {
    ctx.shadowColor = '#ffffff'
    ctx.shadowBlur = 22
  }

  // ──────────── 本体精灵绘制 ────────────
  if (dir === DIRECTION.FRONT) {
    // ⭐ 头盔角饰（顶部尖刺，冲锋者标志性轮廓）
    ctx.fillStyle = armorDark
    ctx.fillRect(-2, -half - 2, 4, 6)          // 中央角
    ctx.fillRect(-7, -half + 1, 2, 4)          // 左角
    ctx.fillRect(5, -half + 1, 2, 4)           // 右角

    // 头部
    ctx.fillStyle = isCharging ? '#ffffff' : (isWinding ? `rgb(${255},${180 + Math.round(windProgress * 75)},${140 + Math.round(windProgress * 60)})` : headColor)
    ctx.fillRect(-9, -half + 2, 18, 12)
    // 眼睛（蓄力/冲锋时发红）
    if (isWinding || isCharging) {
      ctx.fillStyle = '#ff0000'; ctx.fillRect(-5, -half + 5, 3, 3); ctx.fillRect(2, -half + 5, 3, 3)
    } else {
      ctx.fillStyle = '#1e293b'; ctx.fillRect(-6, -half + 6, 4, 3); ctx.fillRect(2, -half + 6, 4, 3)
    }
    // 身体（窄于 melee，披甲精悍）
    ctx.fillStyle = isCharging ? '#ff5533' : color
    ctx.fillRect(-11, -half + 14, 22, 17)
    ctx.fillStyle = isCharging ? '#ee3311' : armorDark
    ctx.fillRect(-10, -half + 16, 20, 5)
    // 腿（黑铁铠）
    ctx.fillStyle = armorDark
    ctx.fillRect(-9 + legOff, -half + 31, 7, 8); ctx.fillRect(2 - legOff, -half + 31, 7, 8)
    // 刺肩甲（外扩尖刺感）
    ctx.fillStyle = color
    ctx.fillRect(-15, -half + 11, 4, 12); ctx.fillRect(11, -half + 11, 4, 12)
    // 肩甲高光尖刺
    ctx.fillStyle = '#c53030'
    ctx.fillRect(-16, -half + 10, 2, 6); ctx.fillRect(14, -half + 10, 2, 6)
  } else {
    // ⭐ 头盔角饰（侧视角）
    ctx.fillStyle = armorDark
    ctx.fillRect(1, -half - 1, 3, 5)
    ctx.fillRect(dir === DIRECTION.LEFT ? -7 : 5, -half + 1, 2, 4)

    // 头部
    ctx.fillStyle = isCharging ? '#ffffff' : (isWinding ? `rgb(${255},${180 + Math.round(windProgress * 75)},${140 + Math.round(windProgress * 60)})` : headColor)
    ctx.fillRect(-7, -half + 2, 16, 12)
    // 眼睛
    if (isWinding || isCharging) {
      ctx.fillStyle = '#ff0000'; ctx.fillRect(dir === DIRECTION.LEFT ? -4 : 1, -half + 5, 3, 3)
    } else {
      ctx.fillStyle = '#1e293b'; ctx.fillRect(dir === DIRECTION.LEFT ? -5 : 1, -half + 6, 4, 3)
    }
    // 身体
    ctx.fillStyle = isCharging ? '#ff5533' : color
    ctx.fillRect(-10, -half + 14, 20, 17)
    ctx.fillStyle = isCharging ? '#ee3311' : armorDark
    ctx.fillRect(-9, -half + 16, 18, 5)
    // 腿（黑铁铠）
    ctx.fillStyle = armorDark
    ctx.fillRect(dir === DIRECTION.LEFT ? -7 + legOff : -7 - legOff, -half + 31, 7, 8)
    ctx.fillRect(dir === DIRECTION.LEFT ? 0 - legOff : 0 + legOff, -half + 31, 7, 8)
    // 刺肩甲
    ctx.fillStyle = color
    ctx.fillRect(dir === DIRECTION.LEFT ? -14 : 10, -half + 11, 4, 12)
    ctx.fillStyle = '#c53030'
    ctx.fillRect(dir === DIRECTION.LEFT ? -15 : 11, -half + 10, 2, 6)
  }

  ctx.restore() // 结束 body 变换（含抖动）

  // ──────────── charging 速度线（本体之外绘制） ────────────
  if (isCharging && (cdx !== 0 || cdy !== 0)) {
    ctx.save()
    for (let i = 0; i < 6; i++) {
      const lineAngle = Math.atan2(cdy, cdx) + (Math.random() - 0.5) * 0.6 // 指向后方 ±0.3rad
      const lineDir = -1 // 指向冲锋反方向
      const startDist = half * 1.4 + Math.random() * half
      const sx = Math.cos(lineAngle) * startDist * lineDir
      const sy = Math.sin(lineAngle) * startDist * lineDir
      const len = 12 + Math.random() * 18
      const ex = sx + Math.cos(lineAngle) * len * lineDir
      const ey = sy + Math.sin(lineAngle) * len * lineDir
      ctx.strokeStyle = `rgba(255, 200, 150, ${0.4 + Math.random() * 0.4})`
      ctx.lineWidth = 1 + Math.random() * 2
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke()
    }
    ctx.restore()
  }
}

// ═══════════ 护盾兵精灵（青色 + 护盾光罩） ═══════════
export const drawShielderEnemy = (ctx, half, dir, legOff, color, color2, elapsed) => {
  const headColor = '#cffafe'
  if (dir === DIRECTION.FRONT) {
    ctx.fillStyle = headColor; ctx.fillRect(-8, -half + 2, 16, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-5, -half + 6, 3, 3); ctx.fillRect(2, -half + 6, 3, 3)
    ctx.fillStyle = color; ctx.fillRect(-11, -half + 14, 22, 16)
    ctx.fillStyle = color2; ctx.fillRect(-9, -half + 16, 18, 5)
    ctx.fillStyle = '#164e63'; ctx.fillRect(-8 + legOff, -half + 30, 7, 8); ctx.fillRect(1 - legOff, -half + 30, 7, 8)
  } else {
    ctx.fillStyle = headColor; ctx.fillRect(-6, -half + 2, 14, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(dir === DIRECTION.LEFT ? -4 : 1, -half + 6, 3, 3)
    ctx.fillStyle = color; ctx.fillRect(-10, -half + 14, 20, 16)
    ctx.fillStyle = color2; ctx.fillRect(-8, -half + 16, 16, 5)
    ctx.fillStyle = '#164e63'
    ctx.fillRect(dir === DIRECTION.LEFT ? -6 + legOff : -6 - legOff, -half + 30, 7, 8)
    ctx.fillRect(dir === DIRECTION.LEFT ? 1 - legOff : 1 + legOff, -half + 30, 7, 8)
  }
  // 护盾光罩
  ctx.strokeStyle = `rgba(6, 182, 212, ${0.35 + 0.1 * Math.sin((elapsed || 0) * 0.006)})`
  ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, half + 10, 0, Math.PI * 2); ctx.stroke()
}

// ════════ 精英怪 — 疾风（青色高速） ════════
export const drawEliteWind = (ctx, half, dir, legOff, color, color2) => {
  // 青色尾迹粒子（3 颗，跟随身后）
  const angles = [0, 0.4, -0.4]
  angles.forEach((a, i) => {
    const px = -Math.cos(dir === 'front' ? 0 : (dir === 'right' ? 0.3 : -0.3)) * (half + 6 + i * 5)
    const py = Math.sin(dir === 'front' ? 0 : (dir === 'right' ? 0.3 : -0.3)) * (half + 6 + i * 5) + 4
    ctx.save()
    ctx.globalAlpha = 0.35 - i * 0.1
    ctx.fillStyle = '#67e8f9'
    ctx.beginPath(); ctx.arc(px, py, 3 - i * 0.5, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  })
  // 主体用近战精灵（青色）
  const tmpC = color || '#06b6d4'
  const tmpC2 = color2 || '#0891b2'
  if (dir === 'front') {
    ctx.fillStyle = '#bfdbfe'; ctx.fillRect(-7, -half + 2, 14, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-4, -half + 6, 3, 3); ctx.fillRect(1, -half + 6, 3, 3)
    ctx.fillStyle = tmpC; ctx.fillRect(-11, -half + 14, 22, 16)
    ctx.fillStyle = tmpC2; ctx.fillRect(-9, -half + 16, 18, 5)
    ctx.fillStyle = '#78350f'; ctx.fillRect(-8 + legOff, -half + 30, 7, 7); ctx.fillRect(1 - legOff, -half + 30, 7, 7)
  } else {
    ctx.fillStyle = '#bfdbfe'; ctx.fillRect(-6, -half + 2, 12, 12)
    ctx.fillStyle = tmpC; ctx.fillRect(-10, -half + 14, 20, 16)
    ctx.fillStyle = '#78350f'; ctx.fillRect(-7 + legOff, -half + 30, 7, 7); ctx.fillRect(0 - legOff, -half + 30, 7, 7)
  }
}

// ════════ 精英怪 — 血牛（暗红巨体） ════════
export const drawEliteBlood = (ctx, half, dir, legOff, color, color2) => {
  const headColor = '#fca5a5'
  if (dir === 'front') {
    ctx.fillStyle = headColor; ctx.fillRect(-12, -half + 2, 24, 16)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-8, -half + 8, 5, 5); ctx.fillRect(3, -half + 8, 5, 5)
    ctx.fillStyle = color || '#991b1b'; ctx.fillRect(-18, -half + 18, 36, 24)
    ctx.fillStyle = color2 || '#7f1d1d'; ctx.fillRect(-15, -half + 21, 30, 8)
    ctx.fillStyle = '#5c1a1a'; ctx.fillRect(-14 + legOff, -half + 42, 12, 12); ctx.fillRect(2 - legOff, -half + 42, 12, 12)
  } else {
    ctx.fillStyle = headColor; ctx.fillRect(-10, -half + 2, 20, 16)
    ctx.fillStyle = color || '#991b1b'; ctx.fillRect(-16, -half + 18, 32, 24)
    ctx.fillStyle = '#5c1a1a'; ctx.fillRect(-12 + legOff, -half + 42, 10, 12); ctx.fillRect(2 - legOff, -half + 42, 10, 12)
  }
}

// ════════ 精英怪 — 牧师（亡灵牧师，血色光环） ════════
export const drawElitePriest = (ctx, half, dir, legOff, color, color2, elapsed) => {
  // 血色光环
  if (elapsed !== undefined) {
    ctx.save()
    ctx.strokeStyle = `rgba(220, 38, 38, ${0.25 + 0.1 * Math.sin((elapsed || 0) * 0.006)})`
    ctx.lineWidth = 3
    ctx.beginPath(); ctx.arc(0, 0, half + 12, 0, Math.PI * 2); ctx.stroke()
    ctx.fillStyle = 'rgba(220, 38, 38, 0.08)'
    ctx.fill()
    ctx.restore()
  }
  // 主体（紫红长袍）
  const headColor = '#fca5a5'
  if (dir === 'front') {
    ctx.fillStyle = headColor; ctx.fillRect(-8, -half + 2, 16, 13)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-5, -half + 7, 4, 4); ctx.fillRect(1, -half + 7, 4, 4)
    ctx.fillStyle = color || '#7f1d1d'; ctx.fillRect(-12, -half + 15, 24, 17)
    ctx.fillStyle = color2 || '#fca5a5'; ctx.fillRect(-10, -half + 17, 20, 6)
    ctx.fillStyle = '#6b1a1a'; ctx.fillRect(-8 + legOff, -half + 32, 7, 8); ctx.fillRect(1 - legOff, -half + 32, 7, 8)
    // 法杖（右侧，红发光）
    ctx.fillStyle = '#fca5a5'; ctx.fillRect(14, -half + 8, 3, 20)
    ctx.save(); ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 8
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(15.5, -half + 6, 5, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  } else {
    ctx.fillStyle = headColor; ctx.fillRect(-6, -half + 2, 14, 13)
    ctx.fillStyle = color || '#7f1d1d'; ctx.fillRect(-11, -half + 15, 22, 17)
    ctx.fillStyle = '#6b1a1a'; ctx.fillRect(-7 + legOff, -half + 32, 7, 8); ctx.fillRect(1 - legOff, -half + 32, 7, 8)
    ctx.fillStyle = '#fca5a5'; ctx.fillRect(12, -half + 8, 3, 18)
    ctx.save(); ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 8
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(13.5, -half + 6, 4, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }
}

// ════════ 精英怪 — 毒虫（毒液虫，绿色毒雾） ════════
export const drawEliteVenom = (ctx, half, dir, legOff, color, color2, elapsed) => {
  // 绿色毒液粒子（环绕身体）
  if (elapsed !== undefined) {
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 / 4) * i + (elapsed || 0) * 0.003
      const px = Math.cos(angle) * (half + 6)
      const py = Math.sin(angle) * (half + 6) - 2
      ctx.save()
      ctx.globalAlpha = 0.4 + 0.2 * Math.sin((elapsed || 0) * 0.008 + i)
      ctx.fillStyle = '#4ade80'
      ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    }
  }
  const headColor = '#86efac'
  if (dir === 'front') {
    ctx.fillStyle = headColor; ctx.fillRect(-7, -half + 2, 14, 12)
    ctx.fillStyle = '#14532d'; ctx.fillRect(-4, -half + 6, 3, 3); ctx.fillRect(1, -half + 6, 3, 3)
    ctx.fillStyle = color || '#166534'; ctx.fillRect(-10, -half + 14, 20, 15)
    ctx.fillStyle = color2 || '#4ade80'; ctx.fillRect(-8, -half + 16, 16, 5)
    ctx.fillStyle = '#365314'; ctx.fillRect(-7 + legOff, -half + 29, 6, 7); ctx.fillRect(1 - legOff, -half + 29, 6, 7)
  } else {
    ctx.fillStyle = headColor; ctx.fillRect(-5, -half + 2, 12, 12)
    ctx.fillStyle = color || '#166534'; ctx.fillRect(-9, -half + 14, 18, 15)
    ctx.fillStyle = '#365314'; ctx.fillRect(-6 + legOff, -half + 29, 6, 7); ctx.fillRect(0 - legOff, -half + 29, 6, 7)
  }
}

export const drawEnemySprite = (ctx, sx, sy, enemy) => {
  const s = enemy.size; const half = s / 2
  ctx.save(); ctx.translate(sx, sy)

  const flash = enemy.hitFlash > 0
  if (flash) ctx.globalAlpha = 0.5 + 0.5 * (enemy.hitFlash % 2)

  const legOffset = [0, 3, 0, -3][enemy.frame]

  if (enemy.type === 'melee') {
    drawMeleeEnemy(ctx, half, enemy.direction, legOffset, enemy.color, enemy.color2)
  } else if (enemy.type === 'ranged') {
    drawRangedEnemy(ctx, half, enemy.direction, legOffset, enemy.color, enemy.color2)
  } else if (enemy.type === 'hybrid') {
    drawHybridEnemy(ctx, half, enemy.direction, legOffset, enemy.color, enemy.color2)
  } else if (enemy.type === 'bomber') {
    drawBomberEnemy(ctx, half, enemy.direction, legOffset, enemy.color, enemy.color2, enemy.skillTimer || 0)
  } else if (enemy.type === 'summoner') {
    drawSummonerEnemy(ctx, half, enemy.direction, legOffset, enemy.color, enemy.color2, enemy.summonTimer || 0)
  } else if (enemy.type === 'charger') {
    drawChargerEnemy(ctx, half, enemy.direction, legOffset, enemy.color, enemy.color2, enemy)
  } else if (enemy.type === 'shielder') {
    drawShielderEnemy(ctx, half, enemy.direction, legOffset, enemy.color, enemy.color2, enemy.skillTimer || 0)
  } else if (enemy.type === 'eliteWind') {
    drawEliteWind(ctx, half, enemy.direction, legOffset, enemy.color, enemy.color2)
  } else if (enemy.type === 'eliteBlood') {
    drawEliteBlood(ctx, half, enemy.direction, legOffset, enemy.color, enemy.color2)
  } else if (enemy.type === 'elitePriest') {
    drawElitePriest(ctx, half, enemy.direction, legOffset, enemy.color, enemy.color2, enemy.priestHealTimer || 0)
  } else if (enemy.type === 'eliteVenom') {
    drawEliteVenom(ctx, half, enemy.direction, legOffset, enemy.color, enemy.color2, enemy.venomBoltTimer || 0)
  } else {
    // 未知类型兜底：用混合敌人精灵
    drawHybridEnemy(ctx, half, enemy.direction, legOffset, enemy.color, enemy.color2)
  }

  ctx.restore()
}