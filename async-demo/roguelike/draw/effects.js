import { ENTITY_SIZE } from '../constants.js'

export const renderEffect = (ctx, e, toScreen) => {
  const pos = toScreen(e.x, e.y, ctx)
  const progress = e.elapsed / e.duration
  ctx.save()
  if (e.type === 'meleeSlash') {
    // 全圆范围指示（ faint 底色圆，与伤害判定范围一致）
    const visualRadius = e.radius + ENTITY_SIZE / 2
    ctx.globalAlpha = 0.10 * (1 - progress)
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(pos.x, pos.y, visualRadius, 0, Math.PI * 2); ctx.stroke()
    // 斩击弧线
    ctx.globalAlpha = 1 - progress
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 4
    ctx.beginPath(); ctx.arc(pos.x, pos.y, e.radius, e.angle - Math.PI / 3, e.angle + Math.PI / 3); ctx.stroke()
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(pos.x, pos.y, e.radius * 0.7, e.angle - Math.PI / 4, e.angle + Math.PI / 4); ctx.stroke()
  } else if (e.type === 'freezeCircle') {
    const radius = e.radius * (0.3 + progress * 0.7)
    ctx.globalAlpha = 0.6 * (1 - progress)
    ctx.strokeStyle = '#93c5fd'; ctx.lineWidth = 3
    ctx.beginPath(); ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2); ctx.stroke()
    ctx.fillStyle = 'rgba(147, 197, 253, 0.15)'
    ctx.beginPath(); ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2); ctx.fill()
  } else if (e.type === 'magicFireball') {
    // 火球坠落 → 闪白爆发 → 多层渐变 → 冲击波 → 裂片
    const r = e.radius * (0.2 + progress * 0.8)
    const fade = 1 - progress
    const pulse = 1 + 0.04 * Math.sin(e.elapsed * 0.015)
    ctx.save()

    // ═══════ 阶段1：闪白爆发（前 18%） ═══════
    if (progress < 0.18) {
      ctx.globalAlpha = (1 - progress / 0.18) * 0.75
      ctx.fillStyle = '#FFFFFF'
      ctx.shadowColor = '#FFFFFF'
      ctx.shadowBlur = 20
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r * (1.5 + progress * 2), 0, Math.PI * 2); ctx.fill()
    }

    // ═══════ 外层辉光 ═══════
    ctx.globalAlpha = fade * 0.28 * pulse
    ctx.shadowColor = '#FF4400'
    ctx.shadowBlur = 20
    const outerGrad = ctx.createRadialGradient(
      pos.x, pos.y, r * 0.4 * pulse,
      pos.x, pos.y, r * 2 * (1 + progress * 0.3) * pulse
    )
    outerGrad.addColorStop(0, 'rgba(255, 180, 20, 0.65)')
    outerGrad.addColorStop(0.5, 'rgba(255, 80, 10, 0.28)')
    outerGrad.addColorStop(1, 'rgba(255, 20, 0, 0)')
    ctx.fillStyle = outerGrad
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 2 * (1 + progress * 0.3) * pulse, 0, Math.PI * 2); ctx.fill()

    // ═══════ 中层渐变（偏移高光模拟光照） ═══════
    ctx.globalAlpha = fade * 0.75
    ctx.shadowColor = '#FF6600'
    ctx.shadowBlur = 16
    const midGrad = ctx.createRadialGradient(
      pos.x - r * 0.18, pos.y - r * 0.25, r * 0.08,
      pos.x, pos.y, r * 1.8 * pulse
    )
    midGrad.addColorStop(0, '#FFF5CC')
    midGrad.addColorStop(0.25, '#FFCC44')
    midGrad.addColorStop(0.55, '#FF7722')
    midGrad.addColorStop(0.85, '#CC3300')
    midGrad.addColorStop(1, 'rgba(160, 20, 0, 0)')
    ctx.fillStyle = midGrad
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 1.8 * pulse, 0, Math.PI * 2); ctx.fill()

    // ═══════ 核心白色高光 ═══════
    ctx.globalAlpha = fade * 0.95
    const coreGrad = ctx.createRadialGradient(
      pos.x, pos.y, 0,
      pos.x, pos.y, r * pulse
    )
    coreGrad.addColorStop(0, '#FFFFFF')
    coreGrad.addColorStop(0.25, '#FFEE88')
    coreGrad.addColorStop(0.7, '#FF9922')
    coreGrad.addColorStop(1, 'rgba(255, 100, 20, 0)')
    ctx.fillStyle = coreGrad
    ctx.shadowColor = '#FF8800'
    ctx.shadowBlur = 8
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r * pulse, 0, Math.PI * 2); ctx.fill()

    // ═══════ 5 个甩动火花粒子 ═══════
    for (let i = 0; i < 5; i++) {
      const angle = Math.PI * 1.5 + (i - 2) * 0.35 + Math.sin(e.elapsed * 0.04 + i) * 0.18
      const sparkDist = r * (1.1 + 0.55 * Math.sin(e.elapsed * 0.06 + i * 2.1))
      const sx = pos.x + Math.cos(angle) * sparkDist
      const sy = pos.y + Math.sin(angle) * sparkDist
      ctx.globalAlpha = fade * (0.45 + 0.3 * Math.sin(e.elapsed * 0.06 + i))
      ctx.fillStyle = i % 2 === 0 ? '#FFEE44' : '#FFAA33'
      ctx.shadowColor = '#FF6600'
      ctx.shadowBlur = 3
      ctx.beginPath(); ctx.arc(sx, sy, 1.4 + Math.sin(e.elapsed * 0.07 + i) * 0.6, 0, Math.PI * 2); ctx.fill()
    }

    // ═══════ 双层冲击波圆环 ═══════
    // 外层冲击环
    ctx.globalAlpha = fade * 0.45
    ctx.strokeStyle = '#FF7722'
    ctx.lineWidth = 3.5 * (1 - progress * 0.4)
    ctx.shadowColor = '#FF4400'
    ctx.shadowBlur = 10
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r * (1.0 + progress * 3), 0, Math.PI * 2); ctx.stroke()

    // 内层冲击环
    ctx.globalAlpha = fade * 0.2
    ctx.strokeStyle = '#FFAA44'
    ctx.lineWidth = 2 * (1 - progress)
    ctx.shadowBlur = 6
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r * (1.0 + progress * 2), 0, Math.PI * 2); ctx.stroke()

    // ═══════ 16 个爆破裂片（三色轮替） ═══════
    const particleCount = 16
    for (let i = 0; i < particleCount; i++) {
      const pa = (i / particleCount) * Math.PI * 2 + progress * 1.8
      const pd = r * (1.0 + progress * 2.5 + Math.sin(i * 3.7) * 0.15)
      const px = pos.x + Math.cos(pa) * pd
      const py = pos.y + Math.sin(pa) * pd
      ctx.globalAlpha = fade * (0.5 - progress * 0.35)
      const colors = ['#FFEE44', '#FF9922', '#EE3311']
      ctx.fillStyle = colors[i % 3]
      ctx.shadowColor = '#FF6600'
      ctx.shadowBlur = 2
      const ps = 1.6 + Math.sin(i * 2.4) * 0.6
      ctx.beginPath(); ctx.arc(px, py, ps * (1 - progress * 0.5), 0, Math.PI * 2); ctx.fill()
    }

    // ═══════ 余烬光晕 ═══════
    ctx.globalAlpha = fade * 0.12
    const emberGrad = ctx.createRadialGradient(pos.x, pos.y, r * 0.3, pos.x, pos.y, r * 1.8)
    emberGrad.addColorStop(0, 'rgba(255, 100, 20, 0.5)')
    emberGrad.addColorStop(1, 'rgba(255, 40, 0, 0)')
    ctx.fillStyle = emberGrad
    ctx.shadowBlur = 0
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 1.8, 0, Math.PI * 2); ctx.fill()

    ctx.restore()
  } else if (e.type === 'explosion') {
    if (e.variant === 'sacrifice') {
      // ── 召唤物溢出自爆：弱化版，紫色调，更小范围 ──
      const r = e.radius * (0.2 + progress * 0.7)
      const fade = 1 - progress
      ctx.save()

      // 核心光点（淡紫）
      ctx.globalAlpha = fade * 0.95
      ctx.fillStyle = '#d8b4fe'
      ctx.shadowColor = '#a855f7'
      ctx.shadowBlur = 6
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 0.2, 0, Math.PI * 2); ctx.fill()

      // 紫色冲击波外圈（比正版细）
      ctx.globalAlpha = fade * 0.3
      ctx.strokeStyle = e.color || '#7e22ce'
      ctx.lineWidth = 2 * fade
      ctx.shadowColor = e.color || '#7e22ce'
      ctx.shadowBlur = 5
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2); ctx.stroke()

      // 内圈填充（半透明）
      ctx.globalAlpha = fade * 0.75
      ctx.fillStyle = e.color || '#7e22ce'
      ctx.shadowBlur = 0
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 0.4, 0, Math.PI * 2); ctx.fill()

      // 4 个紫色火花（比正版少一半，更小）
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 / 4) * i + progress * 1.5
        const dist = r * (0.5 + progress * 0.5)
        const px = pos.x + Math.cos(angle) * dist
        const py = pos.y + Math.sin(angle) * dist
        ctx.globalAlpha = fade * 0.55
        ctx.fillStyle = i % 2 === 0 ? '#c084fc' : '#a855f7'
        ctx.beginPath(); ctx.arc(px, py, 1.5 * fade, 0, Math.PI * 2); ctx.fill()
      }

      ctx.restore()
    } else {
      // ── 正版自爆怪爆炸：橙色冲击波 + 碎片粒子 ──
      const r = e.radius * (0.3 + progress * 1.0)
      const fade = 1 - progress
      ctx.save()

      // 闪白核心
      ctx.globalAlpha = fade * 0.8
      ctx.fillStyle = '#FFFFFF'
      ctx.shadowColor = '#FFFFFF'
      ctx.shadowBlur = 15
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 0.3, 0, Math.PI * 2); ctx.fill()

      // 橙色冲击波外圈
      ctx.globalAlpha = fade * 0.5
      ctx.strokeStyle = e.color || '#f59e0b'
      ctx.lineWidth = 4 * fade
      ctx.shadowColor = e.color || '#f59e0b'
      ctx.shadowBlur = 10
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2); ctx.stroke()

      // 内圈填充
      ctx.globalAlpha = fade * 0.6
      ctx.fillStyle = e.color || '#f59e0b'
      ctx.shadowBlur = 0
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 0.5, 0, Math.PI * 2); ctx.fill()

      // 8 个碎片粒子向外飞散
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i + progress * 2
        const dist = r * (0.6 + progress * 0.6)
        const px = pos.x + Math.cos(angle) * dist
        const py = pos.y + Math.sin(angle) * dist
        ctx.globalAlpha = fade * 0.7
        ctx.fillStyle = i % 2 === 0 ? '#fbbf24' : '#ef4444'
        ctx.beginPath(); ctx.arc(px, py, 2 * fade, 0, Math.PI * 2); ctx.fill()
      }

      ctx.restore()
    }
  }
  // 统一恢复外层 save——修复 meleeSlash / freezeCircle / magicFireball 分支
  // 未配对 restore 导致 globalAlpha 泄漏，使所有单位跟着闪烁的问题
  ctx.restore()
}
