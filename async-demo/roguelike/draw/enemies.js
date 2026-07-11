import { DIRECTION } from '../constants.js'


export const drawMeleeEnemy = (ctx, half, dir, legOff, color, color2) => {
  const headColor = '#fed7aa'
  const axeShaft = '#78350f'
  const axeBlade = '#9ca3af'

  if (dir === DIRECTION.FRONT) {
    
    ctx.fillStyle = headColor; ctx.fillRect(-10, -half + 2, 20, 13)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-7, -half + 6, 4, 4); ctx.fillRect(3, -half + 6, 4, 4)
    
    ctx.fillStyle = color; ctx.fillRect(-13, -half + 15, 26, 17)
    ctx.fillStyle = color2; ctx.fillRect(-11, -half + 17, 22, 6)
    
    ctx.fillStyle = '#78350f'; ctx.fillRect(-11 + legOff, -half + 32, 9, 8); ctx.fillRect(2 - legOff, -half + 32, 9, 8)
    
    ctx.fillStyle = axeShaft; ctx.fillRect(14, -half + 10, 3, 20)
    ctx.fillStyle = axeBlade; ctx.fillRect(11, -half + 4, 6, 10)
    ctx.fillStyle = '#e5e7eb'; ctx.fillRect(10, -half + 2, 8, 4) 
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


export const drawHybridEnemy = (ctx, half, dir, legOff, color, color2) => {
  const headColor = '#cffafe'
  const bladeColor = '#0891b2'
  const bladeEdge = '#67e8f9'
  const orbColor = '#22d3ee'
  const orbGlow = 'rgba(34, 211, 238, 0.5)'

  if (dir === DIRECTION.FRONT) {
    ctx.fillStyle = headColor; ctx.fillRect(-8, -half + 2, 16, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-5, -half + 6, 3, 3); ctx.fillRect(2, -half + 6, 3, 3)
    
    ctx.fillStyle = color; ctx.fillRect(-10, -half + 14, 20, 15)
    ctx.fillStyle = color2; ctx.fillRect(-8, -half + 16, 16, 5)
    
    ctx.fillStyle = '#155e75'; ctx.fillRect(-7 + legOff, -half + 29, 6, 8); ctx.fillRect(1 - legOff, -half + 29, 6, 8)
    
    ctx.fillStyle = bladeColor; ctx.fillRect(-14, -half + 8, 3, 18)
    ctx.fillStyle = bladeEdge; ctx.fillRect(-15, -half + 6, 2, 6)
    
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
    
    ctx.fillStyle = bladeColor; ctx.fillRect(-12, -half + 8, 3, 16)
    ctx.fillStyle = bladeEdge; ctx.fillRect(-13, -half + 6, 2, 5)
    
    ctx.save(); ctx.shadowColor = orbColor; ctx.shadowBlur = 8
    ctx.fillStyle = orbColor; ctx.beginPath(); ctx.arc(11, -half + 8, 4, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  } else {
    ctx.fillStyle = headColor; ctx.fillRect(-6, -half + 2, 14, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(1, -half + 6, 3, 3)
    ctx.fillStyle = color; ctx.fillRect(-8, -half + 14, 18, 15)
    ctx.fillStyle = color2; ctx.fillRect(-6, -half + 16, 14, 5)
    ctx.fillStyle = '#155e75'; ctx.fillRect(-6 - legOff, -half + 29, 6, 8); ctx.fillRect(1 + legOff, -half + 29, 6, 8)
    
    ctx.save(); ctx.shadowColor = orbColor; ctx.shadowBlur = 8
    ctx.fillStyle = orbColor; ctx.beginPath(); ctx.arc(11, -half + 8, 5, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
    ctx.fillStyle = orbGlow; ctx.beginPath(); ctx.arc(11, -half + 8, 8, 0, Math.PI * 2); ctx.fill()
  }
}


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


export const drawSummonerEnemy = (ctx, half, dir, legOff, color, color2, elapsed) => {
  const headColor = '#e9d5ff'
  const robeDark = color2 || '#3b0764'
  const staffColor = '#4a1d6b'
  const staffOrb = '#c084fc'
  const runeColor = 'rgba(192, 132, 252, 0.8)'

  
  const runeT = (elapsed || 0)
  for (let i = 0; i < 3; i++) {
    const angle = (Math.PI * 2 / 3) * i + runeT * 0.002
    const rx = Math.cos(angle) * (half + 10)
    const ry = Math.sin(angle) * (half + 4) - 4  
    ctx.fillStyle = runeColor
    ctx.save()
    ctx.shadowColor = staffOrb; ctx.shadowBlur = 6
    
    ctx.beginPath()
    ctx.moveTo(rx, ry - 3); ctx.lineTo(rx + 2, ry)
    ctx.lineTo(rx, ry + 3); ctx.lineTo(rx - 2, ry)
    ctx.closePath(); ctx.fill()
    ctx.restore()
  }

  if (dir === DIRECTION.FRONT) {
    
    ctx.fillStyle = robeDark
    ctx.fillRect(-7, -half - 3, 14, 7)
    ctx.fillRect(-3, -half - 6, 6, 4)         

    
    ctx.fillStyle = headColor; ctx.fillRect(-7, -half + 3, 14, 11)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-4, -half + 6, 3, 3); ctx.fillRect(1, -half + 6, 3, 3)
    
    ctx.fillStyle = color; ctx.fillRect(-10, -half + 14, 20, 18)
    ctx.fillStyle = robeDark; ctx.fillRect(-8, -half + 16, 16, 4)
    
    ctx.fillStyle = '#2e1065'
    ctx.fillRect(-6 + legOff, -half + 32, 6, 7); ctx.fillRect(0 - legOff, -half + 32, 6, 7)
    
    ctx.fillStyle = staffColor; ctx.fillRect(12, -half + 6, 3, 22)
    ctx.save()
    ctx.shadowColor = staffOrb; ctx.shadowBlur = 6
    ctx.fillStyle = staffOrb; ctx.beginPath(); ctx.arc(13.5, -half + 4, 4, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  } else if (dir === DIRECTION.LEFT) {
    
    ctx.fillStyle = robeDark
    ctx.fillRect(-5, -half - 3, 13, 7)
    ctx.fillRect(-2, -half - 5, 4, 4)

    ctx.fillStyle = headColor; ctx.fillRect(-5, -half + 3, 12, 11)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-3, -half + 6, 3, 3)
    ctx.fillStyle = color; ctx.fillRect(-9, -half + 14, 18, 18)
    ctx.fillStyle = robeDark; ctx.fillRect(-7, -half + 16, 14, 4)
    ctx.fillStyle = '#2e1065'
    ctx.fillRect(-5 + legOff, -half + 32, 6, 7); ctx.fillRect(-1 - legOff, -half + 32, 6, 7)
    
    ctx.fillStyle = staffColor; ctx.fillRect(10, -half + 6, 3, 20)
    ctx.save(); ctx.shadowColor = staffOrb; ctx.shadowBlur = 6
    ctx.fillStyle = staffOrb; ctx.beginPath(); ctx.arc(11, -half + 4, 3, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  } else {
    
    ctx.fillStyle = robeDark
    ctx.fillRect(-6, -half - 3, 13, 7)
    ctx.fillRect(-1, -half - 5, 4, 4)

    ctx.fillStyle = headColor; ctx.fillRect(-6, -half + 3, 12, 11)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(1, -half + 6, 3, 3)
    ctx.fillStyle = color; ctx.fillRect(-9, -half + 14, 18, 18)
    ctx.fillStyle = robeDark; ctx.fillRect(-7, -half + 16, 14, 4)
    ctx.fillStyle = '#2e1065'
    ctx.fillRect(-5 - legOff, -half + 32, 6, 7); ctx.fillRect(1 + legOff, -half + 32, 6, 7)
    
    ctx.fillStyle = staffColor; ctx.fillRect(9, -half + 6, 3, 22)
    ctx.save(); ctx.shadowColor = staffOrb; ctx.shadowBlur = 6
    ctx.fillStyle = staffOrb; ctx.beginPath(); ctx.arc(10.5, -half + 4, 4, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }

  
  ctx.strokeStyle = `rgba(192, 132, 252, ${0.25 + 0.12 * Math.sin((elapsed || 0) * 0.005)})`
  ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, half + 8, 0, Math.PI * 2); ctx.stroke()
}


export const drawChargerEnemy = (ctx, half, dir, legOff, color, color2, enemy) => {
  const chargeState = enemy.chargeState || 'idle'
  const isWinding = chargeState === 'winding'
  const isCharging = chargeState === 'charging'
  const headColor = '#fca5a5'
  const armorDark = color2 || '#1a1a2e'   

  
  const windProgress = isWinding ? Math.min((enemy.chargeStateTimer || 0) / (enemy.windUpDuration || 500), 1) : 0

  
  const chargeProgress = isCharging ? Math.min((enemy.chargeStateTimer || 0) / (enemy.chargeDuration || 400), 1) : 0

  
  const cdx = enemy.chargeDirX || 0
  const cdy = enemy.chargeDirY || 0

  
  if (isWinding) {
    ctx.save()
    const warnR = half * 1.2 + windProgress * half * 1.5
    const alpha = 0.2 + windProgress * 0.35
    ctx.strokeStyle = `rgba(255, 60, 30, ${alpha})`
    ctx.lineWidth = 2 + windProgress * 2
    ctx.setLineDash([4, 4])
    ctx.beginPath(); ctx.arc(0, 0, warnR, 0, Math.PI * 2); ctx.stroke()
    ctx.setLineDash([])
    
    ctx.strokeStyle = `rgba(255, 60, 30, ${alpha * 0.7})`
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(0, 0, half * 0.8 + Math.sin(windProgress * 8) * 4, 0, Math.PI * 2); ctx.stroke()
    ctx.restore()
  }

  
  if (isWinding && (cdx !== 0 || cdy !== 0)) {
    ctx.save()
    const arrowAlpha = 0.3 + windProgress * 0.6
    const arrowDist = half + 16
    const arrowX = cdx * arrowDist
    const arrowY = cdy * arrowDist - arrowDist * 0.3 
    
    const jitter = Math.sin(windProgress * 20) * (1 - windProgress) * 3
    ctx.translate(arrowX + jitter * cdx, arrowY + jitter * cdy)
    const arrowAngle = Math.atan2(cdy, cdx)
    ctx.rotate(arrowAngle)
    
    ctx.strokeStyle = `rgba(255, 100, 40, ${arrowAlpha})`
    ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.stroke()
    
    ctx.fillStyle = `rgba(255, 80, 20, ${arrowAlpha})`
    ctx.beginPath()
    ctx.moveTo(10, 0); ctx.lineTo(3, -5); ctx.lineTo(3, 5); ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  
  let shakeX = 0, shakeY = 0
  if (isWinding) {
    shakeX = Math.sin(windProgress * 30) * windProgress * 3
    shakeY = Math.cos(windProgress * 25) * windProgress * 2
  }

  ctx.save()
  ctx.translate(shakeX, shakeY)

  
  if (isCharging) {
    for (let t = 3; t >= 1; t--) {
      const trailAlpha = 0.18 / t
      const trailDist = t * 8
      ctx.save()
      ctx.globalAlpha = trailAlpha
      ctx.translate(-cdx * trailDist, -cdy * trailDist)
      
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

  
  if (isWinding) {
    ctx.shadowColor = '#ff2200'
    ctx.shadowBlur = 8 + windProgress * 18
  } else if (isCharging) {
    ctx.shadowColor = '#ffffff'
    ctx.shadowBlur = 22
  }

  
  if (dir === DIRECTION.FRONT) {
    
    ctx.fillStyle = armorDark
    ctx.fillRect(-2, -half - 2, 4, 6)          
    ctx.fillRect(-7, -half + 1, 2, 4)          
    ctx.fillRect(5, -half + 1, 2, 4)           

    
    ctx.fillStyle = isCharging ? '#ffffff' : (isWinding ? `rgb(${255},${180 + Math.round(windProgress * 75)},${140 + Math.round(windProgress * 60)})` : headColor)
    ctx.fillRect(-9, -half + 2, 18, 12)
    
    if (isWinding || isCharging) {
      ctx.fillStyle = '#ff0000'; ctx.fillRect(-5, -half + 5, 3, 3); ctx.fillRect(2, -half + 5, 3, 3)
    } else {
      ctx.fillStyle = '#1e293b'; ctx.fillRect(-6, -half + 6, 4, 3); ctx.fillRect(2, -half + 6, 4, 3)
    }
    
    ctx.fillStyle = isCharging ? '#ff5533' : color
    ctx.fillRect(-11, -half + 14, 22, 17)
    ctx.fillStyle = isCharging ? '#ee3311' : armorDark
    ctx.fillRect(-10, -half + 16, 20, 5)
    
    ctx.fillStyle = armorDark
    ctx.fillRect(-9 + legOff, -half + 31, 7, 8); ctx.fillRect(2 - legOff, -half + 31, 7, 8)
    
    ctx.fillStyle = color
    ctx.fillRect(-15, -half + 11, 4, 12); ctx.fillRect(11, -half + 11, 4, 12)
    
    ctx.fillStyle = '#c53030'
    ctx.fillRect(-16, -half + 10, 2, 6); ctx.fillRect(14, -half + 10, 2, 6)
  } else {
    
    ctx.fillStyle = armorDark
    ctx.fillRect(1, -half - 1, 3, 5)
    ctx.fillRect(dir === DIRECTION.LEFT ? -7 : 5, -half + 1, 2, 4)

    
    ctx.fillStyle = isCharging ? '#ffffff' : (isWinding ? `rgb(${255},${180 + Math.round(windProgress * 75)},${140 + Math.round(windProgress * 60)})` : headColor)
    ctx.fillRect(-7, -half + 2, 16, 12)
    
    if (isWinding || isCharging) {
      ctx.fillStyle = '#ff0000'; ctx.fillRect(dir === DIRECTION.LEFT ? -4 : 1, -half + 5, 3, 3)
    } else {
      ctx.fillStyle = '#1e293b'; ctx.fillRect(dir === DIRECTION.LEFT ? -5 : 1, -half + 6, 4, 3)
    }
    
    ctx.fillStyle = isCharging ? '#ff5533' : color
    ctx.fillRect(-10, -half + 14, 20, 17)
    ctx.fillStyle = isCharging ? '#ee3311' : armorDark
    ctx.fillRect(-9, -half + 16, 18, 5)
    
    ctx.fillStyle = armorDark
    ctx.fillRect(dir === DIRECTION.LEFT ? -7 + legOff : -7 - legOff, -half + 31, 7, 8)
    ctx.fillRect(dir === DIRECTION.LEFT ? 0 - legOff : 0 + legOff, -half + 31, 7, 8)
    
    ctx.fillStyle = color
    ctx.fillRect(dir === DIRECTION.LEFT ? -14 : 10, -half + 11, 4, 12)
    ctx.fillStyle = '#c53030'
    ctx.fillRect(dir === DIRECTION.LEFT ? -15 : 11, -half + 10, 2, 6)
  }

  ctx.restore() 

  
  if (isCharging && (cdx !== 0 || cdy !== 0)) {
    ctx.save()
    for (let i = 0; i < 6; i++) {
      const lineAngle = Math.atan2(cdy, cdx) + (Math.random() - 0.5) * 0.6 
      const lineDir = -1 
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
  
  ctx.strokeStyle = `rgba(6, 182, 212, ${0.35 + 0.1 * Math.sin((elapsed || 0) * 0.006)})`
  ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, half + 10, 0, Math.PI * 2); ctx.stroke()
}


export const drawEliteWind = (ctx, half, dir, legOff, color, color2) => {
  
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


export const drawElitePriest = (ctx, half, dir, legOff, color, color2, elapsed) => {
  
  if (elapsed !== undefined) {
    ctx.save()
    ctx.strokeStyle = `rgba(220, 38, 38, ${0.25 + 0.1 * Math.sin((elapsed || 0) * 0.006)})`
    ctx.lineWidth = 3
    ctx.beginPath(); ctx.arc(0, 0, half + 12, 0, Math.PI * 2); ctx.stroke()
    ctx.fillStyle = 'rgba(220, 38, 38, 0.08)'
    ctx.fill()
    ctx.restore()
  }
  
  const headColor = '#fca5a5'
  if (dir === 'front') {
    ctx.fillStyle = headColor; ctx.fillRect(-8, -half + 2, 16, 13)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-5, -half + 7, 4, 4); ctx.fillRect(1, -half + 7, 4, 4)
    ctx.fillStyle = color || '#7f1d1d'; ctx.fillRect(-12, -half + 15, 24, 17)
    ctx.fillStyle = color2 || '#fca5a5'; ctx.fillRect(-10, -half + 17, 20, 6)
    ctx.fillStyle = '#6b1a1a'; ctx.fillRect(-8 + legOff, -half + 32, 7, 8); ctx.fillRect(1 - legOff, -half + 32, 7, 8)
    
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


export const drawEliteVenom = (ctx, half, dir, legOff, color, color2, elapsed) => {
  
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


export const drawEliteRoadhog = (ctx, half, dir, legOff, color, color2, enemy) => {
  const hookState = enemy.hookState || 'normal'
  const isStanding = hookState !== 'normal'
  const headColor = '#fde68a'
  const snoutColor = '#fcd34d'
  const bodyColor = color || '#92400e'
  const bodyColor2 = color2 || '#fbbf24'

  const hookColor = '#78350f'
  const hookMetal = '#d97706'

  if (dir === DIRECTION.FRONT) {
    ctx.fillStyle = headColor; ctx.fillRect(-14, -half + 2, 28, 16)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-8, -half + 5, 5, 5); ctx.fillRect(3, -half + 5, 5, 5)
    ctx.fillStyle = snoutColor; ctx.fillRect(-5, -half + 10, 10, 7)
    ctx.fillStyle = '#92400e'; ctx.fillRect(-3, -half + 13, 2, 2); ctx.fillRect(1, -half + 13, 2, 2)

    ctx.fillStyle = bodyColor; ctx.fillRect(-18, -half + 18, 36, 22)
    ctx.fillStyle = bodyColor2; ctx.fillRect(-15, -half + 20, 30, 8)

    ctx.fillStyle = '#78350f'; ctx.fillRect(-12, -half + 26, 24, 6)

    ctx.fillStyle = '#78350f'
    ctx.fillRect(-12 + (isStanding ? 0 : legOff), -half + 40, 10, 8)
    ctx.fillRect(2 - (isStanding ? 0 : legOff), -half + 40, 10, 8)

    ctx.fillStyle = hookColor; ctx.fillRect(16, -half + 16, 3, 18)
    ctx.fillStyle = hookMetal
    ctx.beginPath()
    ctx.moveTo(19, -half + 14); ctx.lineTo(22, -half + 12)
    ctx.lineTo(22, -half + 18); ctx.lineTo(19, -half + 16)
    ctx.closePath(); ctx.fill()

  } else if (dir === DIRECTION.LEFT) {
    ctx.fillStyle = headColor; ctx.fillRect(-12, -half + 2, 24, 16)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-9, -half + 5, 5, 5)
    ctx.fillStyle = snoutColor; ctx.fillRect(-6, -half + 10, 8, 7)
    ctx.fillStyle = '#92400e'; ctx.fillRect(-4, -half + 13, 2, 2)

    ctx.fillStyle = bodyColor; ctx.fillRect(-18, -half + 18, 32, 22)
    ctx.fillStyle = bodyColor2; ctx.fillRect(-15, -half + 20, 28, 8)
    ctx.fillStyle = '#78350f'; ctx.fillRect(-12, -half + 26, 24, 6)

    ctx.fillStyle = '#78350f'
    ctx.fillRect(-10 + (isStanding ? 0 : legOff), -half + 40, 9, 8)
    ctx.fillRect(0 - (isStanding ? 0 : legOff), -half + 40, 9, 8)

    ctx.fillStyle = hookColor; ctx.fillRect(-20, -half + 16, 3, 18)
    ctx.fillStyle = hookMetal
    ctx.beginPath()
    ctx.moveTo(-20, -half + 14); ctx.lineTo(-23, -half + 12)
    ctx.lineTo(-23, -half + 18); ctx.lineTo(-20, -half + 16)
    ctx.closePath(); ctx.fill()

  } else {
    ctx.fillStyle = headColor; ctx.fillRect(-12, -half + 2, 24, 16)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(4, -half + 5, 5, 5)
    ctx.fillStyle = snoutColor; ctx.fillRect(-2, -half + 10, 8, 7)
    ctx.fillStyle = '#92400e'; ctx.fillRect(0, -half + 13, 2, 2)

    ctx.fillStyle = bodyColor; ctx.fillRect(-14, -half + 18, 32, 22)
    ctx.fillStyle = bodyColor2; ctx.fillRect(-11, -half + 20, 28, 8)
    ctx.fillStyle = '#78350f'; ctx.fillRect(-8, -half + 26, 22, 6)

    ctx.fillStyle = '#78350f'
    ctx.fillRect(-10 - (isStanding ? 0 : legOff), -half + 40, 9, 8)
    ctx.fillRect(2 + (isStanding ? 0 : legOff), -half + 40, 9, 8)

    ctx.fillStyle = hookColor; ctx.fillRect(16, -half + 16, 3, 18)
    ctx.fillStyle = hookMetal
    ctx.beginPath()
    ctx.moveTo(19, -half + 14); ctx.lineTo(22, -half + 12)
    ctx.lineTo(22, -half + 18); ctx.lineTo(19, -half + 16)
    ctx.closePath(); ctx.fill()
  }

  if (isStanding) {
    ctx.save()
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)'
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(0, 0, half + 4, 0, Math.PI * 2); ctx.stroke()
    ctx.restore()
  }
}


export const drawRoadhogHook = (ctx, roadhogSX, roadhogSY, hookSX, hookSY, enemy) => {
  const hookState = enemy.hookState || 'normal'
  if (hookState === 'normal') return

  const chainColor = '#78350f'
  const chainLinkSize = 6

  ctx.save()
  ctx.strokeStyle = chainColor
  ctx.lineWidth = 3
  ctx.setLineDash([chainLinkSize, chainLinkSize])

  ctx.beginPath()
  ctx.moveTo(roadhogSX, roadhogSY)
  ctx.lineTo(hookSX, hookSY)
  ctx.stroke()

  ctx.setLineDash([])

  ctx.fillStyle = '#d97706'
  ctx.beginPath()
  ctx.arc(hookSX, hookSY, 6, 0, Math.PI * 2)
  ctx.fill()

  if (hookState === 'hookedRetract') {
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.6)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(hookSX, hookSY)
    ctx.lineTo(roadhogSX, roadhogSY)
    ctx.stroke()
  }

  ctx.restore()
}


export const drawEliteThrower = (ctx, half, dir, legOff, color, color2, enemy) => {
  const throwState = enemy.throwState || 'normal'
  const isGrabbing = throwState === 'grabPrep'
  const isThrowing = throwState === 'throwFlying'
  const headColor = '#d4d4aa'
  const skinDark = color || '#4a5e3a'
  const skinLight = color2 || '#6b7a4e'
  const rotColor = '#5c6b3a'
  const armColor = '#556b2f'

  if (dir === DIRECTION.FRONT) {
    ctx.fillStyle = headColor; ctx.fillRect(-16, -half + 2, 32, 18)
    ctx.fillStyle = '#2e2920'; ctx.fillRect(-10, -half + 7, 5, 5); ctx.fillRect(5, -half + 7, 5, 5)
    ctx.fillStyle = '#3d2b1f'; ctx.fillRect(-8, -half + 14, 16, 5)
    ctx.fillStyle = '#5c3a1f'; ctx.fillRect(-6, -half + 15, 4, 3); ctx.fillRect(2, -half + 15, 4, 3)

    ctx.fillStyle = skinDark; ctx.fillRect(-20, -half + 20, 40, 24)
    ctx.fillStyle = skinLight; ctx.fillRect(-17, -half + 22, 34, 8)
    ctx.fillStyle = rotColor; ctx.fillRect(-14, -half + 28, 8, 4); ctx.fillRect(6, -half + 26, 10, 6)

    ctx.fillStyle = '#3d4a2e'
    ctx.fillRect(-14 + (isGrabbing || isThrowing ? 0 : legOff), -half + 44, 12, 10)
    ctx.fillRect(2 - (isGrabbing || isThrowing ? 0 : legOff), -half + 44, 12, 10)

    ctx.fillStyle = armColor
    if (isGrabbing) {
      ctx.fillRect(-24, -half + 18, 6, 10); ctx.fillRect(-28, -half + 14, 4, 8)
      ctx.fillRect(18, -half + 18, 6, 10); ctx.fillRect(22, -half + 14, 4, 8)
    } else if (isThrowing) {
      ctx.fillRect(-24, -half + 22, 6, 8)
      ctx.fillRect(18, -half + 16, 6, 14); ctx.fillRect(22, -half + 12, 4, 10)
    } else {
      ctx.fillRect(-24, -half + 22, 6, 16)
      ctx.fillRect(18, -half + 22, 6, 16)
    }
  } else if (dir === DIRECTION.LEFT) {
    ctx.fillStyle = headColor; ctx.fillRect(-14, -half + 2, 28, 18)
    ctx.fillStyle = '#2e2920'; ctx.fillRect(-11, -half + 7, 5, 5)
    ctx.fillStyle = '#3d2b1f'; ctx.fillRect(-6, -half + 14, 12, 5)

    ctx.fillStyle = skinDark; ctx.fillRect(-22, -half + 20, 38, 24)
    ctx.fillStyle = skinLight; ctx.fillRect(-19, -half + 22, 32, 8)
    ctx.fillStyle = rotColor; ctx.fillRect(-12, -half + 28, 8, 4)

    ctx.fillStyle = '#3d4a2e'
    ctx.fillRect(-12 + (isGrabbing || isThrowing ? 0 : legOff), -half + 44, 10, 10)
    ctx.fillRect(0 - (isGrabbing || isThrowing ? 0 : legOff), -half + 44, 10, 10)

    ctx.fillStyle = armColor
    if (isGrabbing) {
      ctx.fillRect(-26, -half + 16, 5, 12); ctx.fillRect(-30, -half + 14, 4, 6)
    } else if (isThrowing) {
      ctx.fillRect(-26, -half + 16, 5, 14); ctx.fillRect(-30, -half + 12, 4, 10)
      ctx.fillRect(16, -half + 22, 5, 10)
    } else {
      ctx.fillRect(-24, -half + 22, 5, 16)
      ctx.fillRect(16, -half + 22, 5, 14)
    }
  } else {
    ctx.fillStyle = headColor; ctx.fillRect(-14, -half + 2, 28, 18)
    ctx.fillStyle = '#2e2920'; ctx.fillRect(6, -half + 7, 5, 5)
    ctx.fillStyle = '#3d2b1f'; ctx.fillRect(-4, -half + 14, 12, 5)

    ctx.fillStyle = skinDark; ctx.fillRect(-16, -half + 20, 38, 24)
    ctx.fillStyle = skinLight; ctx.fillRect(-13, -half + 22, 32, 8)
    ctx.fillStyle = rotColor; ctx.fillRect(-6, -half + 28, 8, 4)

    ctx.fillStyle = '#3d4a2e'
    ctx.fillRect(-10 - (isGrabbing || isThrowing ? 0 : legOff), -half + 44, 10, 10)
    ctx.fillRect(4 + (isGrabbing || isThrowing ? 0 : legOff), -half + 44, 10, 10)

    ctx.fillStyle = armColor
    if (isGrabbing) {
      ctx.fillRect(20, -half + 16, 5, 12); ctx.fillRect(24, -half + 14, 4, 6)
    } else if (isThrowing) {
      ctx.fillRect(20, -half + 16, 5, 14); ctx.fillRect(24, -half + 12, 4, 10)
      ctx.fillRect(-18, -half + 22, 5, 10)
    } else {
      ctx.fillRect(-18, -half + 22, 5, 14)
      ctx.fillRect(18, -half + 22, 5, 16)
    }
  }

  if (isGrabbing) {
    ctx.save()
    ctx.strokeStyle = 'rgba(107, 122, 78, 0.4)'
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(0, 0, half + 6, 0, Math.PI * 2); ctx.stroke()
    ctx.restore()
  }
  if (isThrowing) {
    ctx.save()
    ctx.strokeStyle = 'rgba(93, 107, 58, 0.5)'
    ctx.lineWidth = 3
    ctx.beginPath(); ctx.arc(0, 0, half + 8, 0, Math.PI * 2); ctx.stroke()
    ctx.restore()
  }
}


export const drawThrowProjectile = (ctx, sx, sy, enemy, gameTime) => {
  const half = enemy.size / 2 * 0.7

  ctx.save()
  ctx.translate(sx, sy)

  const rotation = (gameTime || Date.now()) * 0.012
  ctx.rotate(rotation)

  ctx.fillStyle = enemy.color || '#ea580c'
  ctx.fillRect(-half * 0.8, -half, half * 1.6, half * 2)
  ctx.fillStyle = enemy.color2 || '#9a3412'
  ctx.fillRect(-half * 0.6, -half + 3, half * 1.2, half * 0.4)

  ctx.fillStyle = '#fca5a5'
  ctx.fillRect(-half * 0.5, -half - 4, half * 1, half * 0.4)

  ctx.restore()

  const throwDirX = enemy.throwDirX || 0
  const throwDirY = enemy.throwDirY || 0
  if (throwDirX !== 0 || throwDirY !== 0) {
    ctx.save()
    for (let i = 1; i <= 3; i++) {
      const trailDist = i * 14
      const trailX = sx - throwDirX * trailDist
      const trailY = sy - throwDirY * trailDist
      ctx.globalAlpha = 0.3 / i
      ctx.fillStyle = enemy.color || '#ea580c'
      ctx.beginPath()
      ctx.arc(trailX, trailY, half * 0.6 / i, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }
}

export const drawEliteHacker = (ctx, half, dir, legOff, color, color2, enemy) => {
  const skinColor = color || '#1a1a2e'
  const glowColor = color2 || '#00ff88'
  const rayActive = enemy.rayActive

  if (dir === DIRECTION.FRONT) {
    ctx.fillStyle = skinColor; ctx.fillRect(-7, -half + 2, 14, 14)
    ctx.fillStyle = '#00ff88'; ctx.fillRect(-5, -half + 6, 10, 3)
    ctx.fillStyle = '#0d0d1a'; ctx.fillRect(-4, -half + 7, 3, 2); ctx.fillRect(1, -half + 7, 3, 2)

    ctx.fillStyle = skinColor; ctx.fillRect(-11, -half + 16, 22, 18)
    ctx.fillStyle = '#16213e'; ctx.fillRect(-9, -half + 18, 18, 6)
    ctx.fillStyle = glowColor; ctx.fillRect(-6, -half + 20, 12, 2)

    ctx.fillStyle = '#0d0d1a'
    ctx.fillRect(-7 + legOff, -half + 34, 6, 8)
    ctx.fillRect(1 - legOff, -half + 34, 6, 8)

    ctx.fillStyle = skinColor
    if (rayActive) {
      ctx.fillRect(10, -half + 16, 4, 12)
      ctx.fillRect(-13, -half + 18, 3, 10)
      ctx.fillStyle = glowColor
      ctx.fillRect(12, -half + 26, 3, 3)
    } else {
      ctx.fillRect(-13, -half + 18, 3, 14)
      ctx.fillRect(10, -half + 18, 3, 14)
    }
  } else {
    ctx.fillStyle = skinColor; ctx.fillRect(-5, -half + 2, 12, 14)
    ctx.fillStyle = '#00ff88'; ctx.fillRect(-3, -half + 6, 8, 3)
    ctx.fillStyle = skinColor; ctx.fillRect(-9, -half + 16, 20, 18)
    ctx.fillStyle = '#16213e'; ctx.fillRect(-7, -half + 18, 16, 6)
    ctx.fillStyle = glowColor; ctx.fillRect(-4, -half + 20, 8, 2)

    ctx.fillStyle = '#0d0d1a'
    ctx.fillRect(-5 + legOff, -half + 34, 5, 8)

    ctx.fillStyle = skinColor
    if (rayActive) {
      ctx.fillRect(9, -half + 16, 3, 14)
      ctx.fillStyle = glowColor
      ctx.fillRect(10, -half + 28, 3, 3)
    } else {
      ctx.fillRect(-10, -half + 18, 3, 14)
    }
  }

  if (rayActive) {
    ctx.save()
    ctx.strokeStyle = glowColor
    ctx.lineWidth = 1.5
    ctx.globalAlpha = 0.5 + 0.3 * Math.sin((enemy.rayDamageTimer || 0) * 0.01)
    ctx.beginPath(); ctx.arc(0, 0, half + 4, 0, Math.PI * 2); ctx.stroke()
    ctx.restore()
  }
}

export const drawHackerRay = (ctx, hackerSX, hackerSY, playerSX, playerSY, enemy, gameTime) => {
  const glowColor = enemy.color2 || '#00ff88'
  const t = gameTime || Date.now()

  ctx.save()
  ctx.strokeStyle = glowColor
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 0.008)
  ctx.beginPath()
  ctx.moveTo(hackerSX, hackerSY)
  ctx.lineTo(playerSX, playerSY)
  ctx.stroke()

  const pulsePhase = (t * 0.005) % 1
  const px = hackerSX + (playerSX - hackerSX) * pulsePhase
  const py = hackerSY + (playerSY - hackerSY) * pulsePhase
  ctx.globalAlpha = 0.9
  ctx.fillStyle = '#ffffff'
  ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = glowColor
  ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill()

  ctx.globalAlpha = 0.4
  ctx.strokeStyle = glowColor
  ctx.lineWidth = 1
  const dataAngle = t * 0.006
  ctx.beginPath(); ctx.arc(playerSX, playerSY, 20, dataAngle, dataAngle + Math.PI * 0.8); ctx.stroke()
  ctx.beginPath(); ctx.arc(playerSX, playerSY, 20, dataAngle + Math.PI, dataAngle + Math.PI + Math.PI * 0.6); ctx.stroke()

  ctx.restore()
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
  } else if (enemy.type === 'eliteRoadhog') {
    drawEliteRoadhog(ctx, half, enemy.direction, legOffset, enemy.color, enemy.color2, enemy)
  } else if (enemy.type === 'eliteThrower') {
    drawEliteThrower(ctx, half, enemy.direction, legOffset, enemy.color, enemy.color2, enemy)
  } else if (enemy.type === 'eliteHacker') {
    drawEliteHacker(ctx, half, enemy.direction, legOffset, enemy.color, enemy.color2, enemy)
  } else {
    
    drawHybridEnemy(ctx, half, enemy.direction, legOffset, enemy.color, enemy.color2)
  }

  ctx.restore()
}
