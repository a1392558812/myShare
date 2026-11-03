import { DESIGN, CARD, LAYOUT, COLORS } from '../constants.js'
import { cardPoints, SUIT_SYMBOLS } from '../core/cards.js'
import { drawBack, drawCard } from './cards-art.js'

const SUIT_FONT = '"Segoe UI Symbol", "Microsoft YaHei", serif'
const TEXT_FONT = '"Microsoft YaHei", system-ui, sans-serif'

const roundRect = (context, x, y, width, height, radius) => {
  const limit = Math.min(radius, width / 2, height / 2)
  context.beginPath()
  context.moveTo(x + limit, y)
  context.arcTo(x + width, y, x + width, y + height, limit)
  context.arcTo(x + width, y + height, x, y + height, limit)
  context.arcTo(x, y + height, x, y, limit)
  context.arcTo(x, y, x + width, y, limit)
  context.closePath()
}

/** 手牌横向排布：张数变化时自动压缩间距 */
const layoutHand = (count) => {
  const card = CARD.hand
  const usable = DESIGN.width - LAYOUT.handPadding * 2
  const gap = count > 1 ? Math.min(46, (usable - card.width) / (count - 1)) : 0
  const totalWidth = card.width + gap * Math.max(0, count - 1)
  const startX = (DESIGN.width - totalWidth) / 2
  return { startX, gap, y: LAYOUT.handY, width: card.width, height: card.height }
}

/** 出牌区：一墩最多能看到 8 张，超出的压在一起 */
const layoutPlay = (zone, count) => {
  const card = CARD.table
  const gap = count <= 1 ? 0 : Math.min(LAYOUT.tableGap, 168 / (count - 1))
  const totalWidth = card.width + gap * Math.max(0, count - 1)
  return {
    startX: zone.x - totalWidth / 2,
    gap,
    y: zone.y - card.height / 2,
    width: card.width,
    height: card.height,
  }
}

export const createTableRenderer = (canvas) => {
  const context = canvas.getContext('2d')
  let viewScale = 1

  const resize = () => {
    const parent = canvas.parentElement
    const ratio = window.devicePixelRatio || 1
    const boxWidth = parent ? parent.clientWidth : DESIGN.width
    const boxHeight = parent ? parent.clientHeight : DESIGN.height
    viewScale = Math.min(boxWidth / DESIGN.width, boxHeight / DESIGN.height)
    if (!Number.isFinite(viewScale) || viewScale <= 0) {
      viewScale = 1
    }
    const cssWidth = DESIGN.width * viewScale
    const cssHeight = DESIGN.height * viewScale
    canvas.style.width = `${cssWidth}px`
    canvas.style.height = `${cssHeight}px`
    canvas.width = Math.round(cssWidth * ratio)
    canvas.height = Math.round(cssHeight * ratio)
    context.setTransform(viewScale * ratio, 0, 0, viewScale * ratio, 0, 0)
  }

  const paintBackground = () => {
    const gradient = context.createRadialGradient(580, 300, 60, 580, 320, 780)
    gradient.addColorStop(0, '#6b1d2c')
    gradient.addColorStop(0.55, COLORS.felt)
    gradient.addColorStop(1, COLORS.feltDark)
    context.fillStyle = gradient
    context.fillRect(0, 0, DESIGN.width, DESIGN.height)

    context.save()
    context.strokeStyle = COLORS.line
    context.lineWidth = 1
    roundRect(context, 44, 44, DESIGN.width - 88, DESIGN.height - 88, 24)
    context.stroke()
    roundRect(context, 52, 52, DESIGN.width - 104, DESIGN.height - 104, 20)
    context.strokeStyle = 'rgba(242, 193, 78, .08)'
    context.stroke()
    context.restore()

    context.save()
    context.globalAlpha = 0.05
    context.strokeStyle = '#ffffff'
    context.lineWidth = 1
    for (let index = 0; index < 40; index++) {
      context.beginPath()
      context.moveTo(index * 30, 0)
      context.lineTo(index * 30 - 220, DESIGN.height)
      context.stroke()
    }
    context.restore()
  }

  const paintOpponentBacks = (view) => {
    const back = CARD.back
    const northCount = view.handCounts[2]
    const northGap = LAYOUT.northBack.gap
    const northWidth = back.width + northGap * Math.max(0, northCount - 1)
    for (let index = 0; index < northCount; index++) {
      drawBack(context, 580 - northWidth / 2 + index * northGap, LAYOUT.northBack.y, back.width, back.height)
    }

    ;[1, 3].forEach((seat) => {
      const count = view.handCounts[seat]
      const x = seat === 3 ? LAYOUT.westBack.x : LAYOUT.eastBack.x
      for (let index = 0; index < count; index++) {
        drawBack(context, x, LAYOUT.westBack.y + index * LAYOUT.westBack.gap, back.width, back.height)
      }
    })
  }

  const paintSeatLabels = (view) => {
    context.save()
    context.font = `600 12px ${TEXT_FONT}`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    const spots = [
      { x: 580, y: 610 },
      { x: 1020, y: 300 },
      { x: 580, y: 76 },
      { x: 140, y: 300 },
    ]
    spots.forEach((spot, seat) => {
      const isDealer = view.dealer === seat
      const text = `${view.seatLabels[seat]} · ${view.handCounts[seat]}${isDealer ? ' · 庄' : ''}`
      context.fillStyle = isDealer ? COLORS.gold : COLORS.dim
      context.fillText(text, spot.x, spot.y)
    })
    context.restore()
  }

  const paintPlays = (view) => {
    const zones = LAYOUT.playZones
    view.trick.forEach((entry) => {
      const zone = zones[entry.seat]
      const layout = layoutPlay(zone, entry.cards.length)
      const isWinner = view.trickWinner === entry.seat
      if (isWinner) {
        context.save()
        context.beginPath()
        context.arc(zone.x, zone.y, 86, 0, Math.PI * 2)
        context.strokeStyle = COLORS.gold
        context.lineWidth = 2
        context.shadowColor = COLORS.gold
        context.shadowBlur = 16
        context.stroke()
        context.restore()
      }
      entry.cards.forEach((card, index) => {
        drawCard(context, card, layout.startX + index * layout.gap, layout.y, layout.width, layout.height, {
          trump: view.rule.isTrump(card),
          selected: false,
        })
      })
      if (entry.cards.length > 1) {
        const total = entry.cards.reduce((sum, card) => sum + cardPoints(card), 0)
        if (total > 0) {
          context.save()
          context.font = `700 12px ${TEXT_FONT}`
          context.fillStyle = COLORS.gold
          context.textAlign = 'center'
          context.textBaseline = 'middle'
          context.fillText(`+${total}`, zone.x, layout.y + layout.height + 14)
          context.restore()
        }
      }
    })
  }

  const paintCenter = (view) => {
    const center = LAYOUT.center
    context.save()
    context.beginPath()
    context.arc(center.x, center.y, center.radius, 0, Math.PI * 2)
    const gradient = context.createRadialGradient(center.x, center.y - 30, 20, center.x, center.y, center.radius)
    gradient.addColorStop(0, 'rgba(40, 10, 17, .85)')
    gradient.addColorStop(1, 'rgba(20, 6, 10, .55)')
    context.fillStyle = gradient
    context.fill()
    context.strokeStyle = 'rgba(242, 193, 78, .35)'
    context.lineWidth = 1.4
    context.stroke()

    context.textAlign = 'center'
    context.textBaseline = 'middle'

    context.fillStyle = COLORS.gold
    context.font = `700 17px ${TEXT_FONT}`
    context.fillText(`打 ${view.levelLabel}`, center.x, center.y - 54)

    if (view.trumpSuit < 0) {
      context.fillStyle = COLORS.text
      context.font = `700 22px ${TEXT_FONT}`
      context.fillText('无主', center.x, center.y - 24)
    } else {
      context.fillStyle = [1, 3].includes(view.trumpSuit) ? '#ff8a90' : COLORS.text
      context.font = `700 34px ${SUIT_FONT}`
      context.fillText(SUIT_SYMBOLS[view.trumpSuit], center.x, center.y - 22)
    }

    context.fillStyle = view.points >= view.target ? COLORS.green : COLORS.text
    context.font = `700 20px ${TEXT_FONT}`
    context.fillText(`${view.points} / ${view.target}`, center.x, center.y + 14)

    const barWidth = 116
    const barX = center.x - barWidth / 2
    const barY = center.y + 30
    context.fillStyle = 'rgba(255, 255, 255, .14)'
    roundRect(context, barX, barY, barWidth, 5, 2.5)
    context.fill()
    const ratio = Math.max(0, Math.min(1, view.points / view.target))
    context.fillStyle = view.points >= view.target ? COLORS.green : COLORS.red
    roundRect(context, barX, barY, Math.max(3, barWidth * ratio), 5, 2.5)
    context.fill()

    context.fillStyle = COLORS.dim
    context.font = `500 11px ${TEXT_FONT}`
    context.fillText(`第 ${view.trickIndex} 墩 · 剩 ${25 - view.trickIndex} 墩`, center.x, center.y + 52)
    context.restore()
  }

  const paintHand = (view) => {
    const layout = layoutHand(view.hand.length)
    view.hand.forEach((card, index) => {
      const selected = view.selectedIds.includes(card.id)
      const hovered = view.hoverIndex === index
      let offset = 0
      if (selected) {
        offset = LAYOUT.handRaise
      } else if (hovered) {
        offset = LAYOUT.handHover
      }
      drawCard(context, card, layout.startX + index * layout.gap, layout.y - offset, layout.width, layout.height, {
        trump: view.rule.isTrump(card),
        selected,
        dim: view.dimHand,
      })
    })
  }

  const draw = (view) => {
    context.clearRect(0, 0, DESIGN.width, DESIGN.height)
    paintBackground()
    paintOpponentBacks(view)
    paintSeatLabels(view)
    paintPlays(view)
    paintCenter(view)
    paintHand(view)
  }

  /** 客户端坐标 → 逻辑坐标 */
  const toLocal = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect()
    if (!rect.width || !rect.height) {
      return { x: -1, y: -1 }
    }
    return {
      x: ((clientX - rect.left) / rect.width) * DESIGN.width,
      y: ((clientY - rect.top) / rect.height) * DESIGN.height,
    }
  }

  /** 命中手牌：从右往左找，后画的牌在上层 */
  const hitHand = (clientX, clientY, view) => {
    const point = toLocal(clientX, clientY)
    const layout = layoutHand(view.hand.length)
    for (let index = view.hand.length - 1; index >= 0; index--) {
      const selected = view.selectedIds.includes(view.hand[index].id)
      const hovered = view.hoverIndex === index
      const offset = selected ? LAYOUT.handRaise : hovered ? LAYOUT.handHover : 0
      const top = layout.y - offset
      const left = layout.startX + index * layout.gap
      const right = left + layout.width
      const bottom = top + layout.height
      if (point.x >= left && point.x <= right && point.y >= top && point.y <= bottom) {
        return index
      }
    }
    return -1
  }

  return { resize, draw, hitHand }
}
