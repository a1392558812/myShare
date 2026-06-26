/**
 * draw/events.js — 事件与环境绘制
 * 死亡区域 / 交互事件图标（祭坛/神龛/宝箱/石碑）
 */

/** 绘制死亡区域（暗红半透明圆形 + 脉冲边框 + 骷髅图标） */
export const renderDeathZones = (ctx, events, toScreen, gameTime) => {
  events.forEach(e => {
    if (e.type !== 'deathZone') return
    const pos = toScreen(e.x, e.y, ctx)
    const r = e.zoneRadius || 80

    // 暗红填充
    ctx.save()
    ctx.globalAlpha = 0.25 + 0.05 * Math.sin(gameTime / 800)
    ctx.fillStyle = '#991b1b'
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2)
    ctx.fill()

    // 边框脉冲
    ctx.globalAlpha = 0.5 + 0.15 * Math.sin(gameTime / 600)
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.restore()

    // 骷髅图标
    ctx.save()
    ctx.globalAlpha = 0.7
    ctx.font = `${r * 0.6}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('💀', pos.x, pos.y)
    ctx.restore()
  })
}

/** 绘制交互事件图标（地面光晕 + 主体圆圈 + 剩余时间环 + emoji + 名称标签） */
export const renderEvents = (ctx, events, toScreen, gameTime, cw, ch) => {
  events.forEach(e => {
    if (e.type === 'deathZone' || e.activated) return
    const pos = toScreen(e.x, e.y, ctx)
    if (pos.x < -60 || pos.x > cw + 60 || pos.y < -60 || pos.y > ch + 60) return

    const cfg = e.config || {}

    // 地面光晕
    const pulseAlpha = 0.3 + 0.1 * Math.sin(gameTime / 400 + e.id % 100)
    ctx.save()
    ctx.globalAlpha = pulseAlpha
    ctx.fillStyle = cfg.color || '#f59e0b'
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, 32, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // 主体圆圈
    ctx.save()
    ctx.strokeStyle = cfg.color || '#f59e0b'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, 28, 0, Math.PI * 2)
    ctx.stroke()

    // 剩余时间环
    if (e.remaining > 0 && e.duration > 0 && e.duration !== Infinity) {
      const ratio = e.remaining / e.duration
      ctx.strokeStyle = cfg.color2 || cfg.color || '#f59e0b'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 28, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio)
      ctx.stroke()
    }
    ctx.restore()

    // 图标 emoji
    ctx.save()
    ctx.font = '26px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(cfg.icon || '❓', pos.x, pos.y - 2)
    ctx.restore()

    // 名称标签
    const isCursed = e.type === 'cursedStele'
    ctx.save()
    ctx.font = '11px monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = isCursed ? '#c4b5fd' : '#f8fafc'
    ctx.shadowColor = isCursed ? 'rgba(124,58,237,0.8)' : 'rgba(0,0,0,0.6)'
    ctx.shadowBlur = 3
    ctx.fillText(cfg.name || '', pos.x, pos.y + 42)
    ctx.restore()
  })
}
