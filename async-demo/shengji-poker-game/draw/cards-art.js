import { JOKER_BIG, JOKER_SMALL, RANK_LABELS, RED_SUITS, SUIT_SYMBOLS, cardPoints, isJoker } from '../core/cards.js'
import { COLORS } from '../constants.js'

/** 预渲染倍率：牌面按 2.5 倍画，缩放到实际尺寸时边缘更干净 */
const SCALE = 2.5
const CARD_RADIUS = 6
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

const createCanvas = (width, height) => {
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * SCALE)
  canvas.height = Math.round(height * SCALE)
  const context = canvas.getContext('2d')
  context.scale(SCALE, SCALE)
  return { canvas, context }
}

/** 单张牌面：左上角大小字 + 中央花色 + 描边；主牌加金边，分牌加金点 */
const paintFace = (context, card, width, height) => {
  context.clearRect(0, 0, width, height)
  const gradient = context.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, COLORS.cardBg)
  gradient.addColorStop(1, '#f1e9da')
  roundRect(context, 0.8, 0.8, width - 1.6, height - 1.6, CARD_RADIUS)
  context.fillStyle = gradient
  context.fill()
  context.strokeStyle = COLORS.cardEdge
  context.lineWidth = 1
  context.stroke()

  if (isJoker(card)) {
    const isBig = card.joker === JOKER_BIG
    context.fillStyle = isBig ? COLORS.cardRed : COLORS.cardInk
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.font = `700 ${width * 0.3}px ${TEXT_FONT}`
    context.fillText(isBig ? '大' : '小', width / 2, height * 0.34)
    context.fillText('王', width / 2, height * 0.66)
    context.strokeStyle = isBig ? COLORS.cardRed : COLORS.cardInk
    context.lineWidth = 1.2
    roundRect(context, width * 0.18, height * 0.1, width * 0.64, height * 0.8, 5)
    context.stroke()
    return
  }

  const red = RED_SUITS.includes(card.suit)
  const ink = red ? COLORS.cardRed : COLORS.cardInk
  const rankLabel = RANK_LABELS[card.rank]
  const suitGlyph = SUIT_SYMBOLS[card.suit]

  context.fillStyle = ink
  context.textAlign = 'left'
  context.textBaseline = 'top'
  context.font = `700 ${width * (rankLabel.length > 1 ? 0.34 : 0.4)}px ${TEXT_FONT}`
  context.fillText(rankLabel, width * 0.11, height * 0.07)
  context.font = `${width * 0.24}px ${SUIT_FONT}`
  context.fillText(suitGlyph, width * 0.13, height * 0.36)

  context.save()
  context.translate(width * 0.88, height * 0.92)
  context.rotate(Math.PI)
  context.textAlign = 'left'
  context.textBaseline = 'top'
  context.font = `700 ${width * (rankLabel.length > 1 ? 0.3 : 0.34)}px ${TEXT_FONT}`
  context.fillText(rankLabel, 0, 0)
  context.restore()

  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = red ? 'rgba(192, 39, 45, .92)' : 'rgba(35, 32, 29, .9)'
  context.font = `${width * 0.5}px ${SUIT_FONT}`
  context.fillText(suitGlyph, width / 2, height * 0.56)

  if (cardPoints(card) > 0) {
    context.beginPath()
    context.arc(width * 0.78, height * 0.76, width * 0.075, 0, Math.PI * 2)
    context.fillStyle = COLORS.gold
    context.fill()
  }
}

const paintBack = (context, width, height) => {
  context.clearRect(0, 0, width, height)
  const gradient = context.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, COLORS.cardBack)
  gradient.addColorStop(1, COLORS.cardBackDark)
  roundRect(context, 0.8, 0.8, width - 1.6, height - 1.6, CARD_RADIUS)
  context.fillStyle = gradient
  context.fill()
  context.strokeStyle = 'rgba(242, 193, 78, .45)'
  context.lineWidth = 1.4
  roundRect(context, 3.2, 3.2, width - 6.4, height - 6.4, CARD_RADIUS - 2)
  context.stroke()
  context.strokeStyle = 'rgba(242, 193, 78, .16)'
  context.lineWidth = 1
  const step = width / 5
  for (let index = 1; index < 5; index++) {
    context.beginPath()
    context.moveTo(step * index, 5)
    context.lineTo(step * index, height - 5)
    context.stroke()
  }
}

let faceCache = null
let backCanvas = null

const faceKey = (card) => {
  if (card.joker === JOKER_BIG) {
    return 'joker-big'
  }
  if (card.joker === JOKER_SMALL) {
    return 'joker-small'
  }
  return `s${card.suit}-r${card.rank}`
}

const buildAtlas = (width, height) => {
  const atlas = new Map()
  for (let suit = 0; suit < 4; suit++) {
    for (let rank = 2; rank <= 14; rank++) {
      const card = { id: 'probe', suit, rank, joker: 0 }
      const { canvas, context } = createCanvas(width, height)
      paintFace(context, card, width, height)
      atlas.set(faceKey(card), canvas)
    }
  }
  ;[JOKER_SMALL, JOKER_BIG].forEach((kind) => {
    const card = { id: 'probe', suit: 4, rank: 0, joker: kind }
    const { canvas, context } = createCanvas(width, height)
    paintFace(context, card, width, height)
    atlas.set(faceKey(card), canvas)
  })
  return atlas
}

/** 牌面缓存（按手牌尺寸预渲染一次，其他尺寸直接缩放贴图） */
export const getFace = (card) => {
  if (!faceCache) {
    faceCache = buildAtlas(62, 86)
  }
  return faceCache.get(faceKey(card))
}

export const getBack = () => {
  if (!backCanvas) {
    const { canvas, context } = createCanvas(62, 86)
    paintBack(context, 62, 86)
    backCanvas = canvas
  }
  return backCanvas
}

/**
 * 在指定矩形内画一张牌。
 * options: { trump, selected, dim }
 */
export const drawCard = (context, card, x, y, width, height, options = {}) => {
  const image = getFace(card)
  context.save()
  context.shadowColor = 'rgba(0, 0, 0, .35)'
  context.shadowBlur = options.selected ? 12 : 5
  context.shadowOffsetY = options.selected ? 5 : 2
  roundRect(context, x, y, width, height, CARD_RADIUS * (width / 62))
  context.fillStyle = '#fff'
  context.fill()
  context.restore()

  if (image) {
    context.drawImage(image, x, y, width, height)
  }
  if (options.trump) {
    context.save()
    roundRect(context, x + 0.8, y + 0.8, width - 1.6, height - 1.6, CARD_RADIUS * (width / 62))
    context.strokeStyle = options.selected ? 'rgba(255, 255, 255, .9)' : COLORS.gold
    context.lineWidth = options.selected ? 2.2 : 1.8
    context.stroke()
    context.restore()
  }
  if (options.dim) {
    context.save()
    roundRect(context, x, y, width, height, CARD_RADIUS * (width / 62))
    context.fillStyle = 'rgba(20, 6, 10, .5)'
    context.fill()
    context.restore()
  }
}

export const drawBack = (context, x, y, width, height) => {
  const image = getBack()
  if (!image) {
    return
  }
  context.save()
  context.shadowColor = 'rgba(0, 0, 0, .3)'
  context.shadowBlur = 4
  context.shadowOffsetY = 2
  context.drawImage(image, x, y, width, height)
  context.restore()
}
