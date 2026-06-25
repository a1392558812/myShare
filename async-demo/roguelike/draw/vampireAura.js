import { ENTITY_SIZE } from '../constants.js'

/**
 * 绘制吸血光环——以玩家为中心的血红色脉动圆环。
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} player   - 玩家状态对象（skills / x / y）
 * @param {number} now      - gameTime（用于呼吸脉动）
 * @param {Function} toScreen
 */
export function renderVampireAura(ctx, player, now, toScreen) {
  const vampireSkill = player.skills.find(s => s.id === 'vampireAura' && s.active)
  if (!vampireSkill) return

  const pos = toScreen(player.x, player.y, ctx)
  const visualRadius = vampireSkill.auraRange + ENTITY_SIZE / 2

  ctx.save()
  ctx.globalAlpha = 0.25 + 0.10 * Math.sin(now / 200)
  ctx.beginPath()
  ctx.arc(pos.x, pos.y, visualRadius, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(220, 38, 38, 0.18)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(220, 38, 38, 0.5)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()
}
