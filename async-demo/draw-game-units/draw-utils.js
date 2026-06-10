export const drawPixel = ({ px, py, color, ctx, x, y, unit }) => {
  ctx.fillStyle = color
  ctx.fillRect(x + px * unit, y + py * unit, unit, unit)
}

/**
 * @description 绘制单位
 * @param {RenderingContext2D} ctx canvas元素
 * @param {Object} currentUnit 当前单位
 * @param {Number} currentUnit.x 当单位x坐标
 * @param {Number} currentUnit.y 当单位y坐标
 * @param {Number} currentUnit.size 当单位大小
 * @param {String} currentUnit.direction 当单位方向
 * @param {Number} currentUnit.frame 当单位帧数坐标
 * @param {Boolean} currentUnit.isMoving 当单位是否移动
 * @param {Object} facePixels 当单位人脸像素
 * @param {Array} facePixels.down 当单位人脸下像素
 * @param {Array} facePixels.up 当单位人脸上像素
 * @param {Array} facePixels.left 当单位人脸左像素
 * @param {Array} facePixels.right 当单位人脸右像素
 * @param {Array} facePixels.walk 当单位行走走像素
 * @param {Array} facePixels.idle 当单位空闲像素
 * @returns 
 */
export const drawUnit = (ctx, currentUnit, facePixels) => {
  const x = currentUnit.x
  const y = currentUnit.y
  const unit = currentUnit.size / 18
  const direction = currentUnit.direction || 'down'
  const frame = currentUnit.frame || 0
  ctx.imageSmoothingEnabled = false

  let basePixels = facePixels.down
  if (direction === 'up') basePixels = facePixels.up
  else if (direction === 'left') basePixels = facePixels.left
  else if (direction === 'right') basePixels = facePixels.right

  for (let i = 0; i < basePixels.length; i++) {
    drawPixel({ px: basePixels[i][0], py: basePixels[i][1], color: basePixels[i][2], ctx, x, y, unit })
  }

  const isMoving = currentUnit.isMoving || false
  const frames = isMoving ? facePixels.walk : facePixels.idle
  const frameIndex = Math.floor(frame) % frames.length
  const currentFrame = frames[frameIndex]

  for (const layer of currentFrame) {
    for (const pixel of layer.pixels) {
      drawPixel({ px: pixel[0], py: pixel[1], color: pixel[2], ctx, x, y, unit })
    }
  }
}

export const drawAvatar = (ctx, currentUnit, avatarPos, avatarPixels) => {
  const x = avatarPos.x
  const y = avatarPos.y
  const unit = currentUnit.size / 16
  ctx.imageSmoothingEnabled = false

  for (let i = 0; i < avatarPixels.length; i++) {
    drawPixel({ px: avatarPixels[i][0], py: avatarPixels[i][1], color: avatarPixels[i][2], ctx, x, y, unit })
  }
}

export const drawSelectionHighlight = (ctx, unit, unitKey) => {
  const size = unit.size || 40;
  const padding = 4;
  
  // 绘制选择指示器（顶部三角形）
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.moveTo(unit.x + size / 2 - 6, unit.y - padding - 8);
  ctx.lineTo(unit.x + size / 2 + 6, unit.y - padding - 8);
  ctx.lineTo(unit.x + size / 2, unit.y - padding - 2);
  ctx.closePath();
  ctx.fill();
}

export const drawBorder = (ctx, unit, unitKey) => {
  const size = unit.size || 40;
  const padding = 0; // 可配置加大判断范围

  ctx.beginPath();
  ctx.moveTo(unit.x - padding, unit.y - padding);
  ctx.lineTo(unit.x + size + padding, unit.y - padding);
  ctx.lineTo(unit.x + size + padding, unit.y + size + padding);
  ctx.lineTo(unit.x - padding, unit.y + size + padding);
  ctx.lineTo(unit.x - padding, unit.y - padding)
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.closePath();
}

/**
 * @description {drawHealthBar} 绘制单位生命值条
 * @param {CanvasRenderingContext2D} ctx canvas上下文
 * @param {Object} unit 单位
 * @param {Number} unit.maxHp 单位最大生命值
 * @param {Number} unit.hp 单位当前生命值
 * @param {Number} unit.maxMp 单位最大魔法值
 * @param {Number} unit.mp 单位当前魔法值
 * @param {Number} unit.size 单位大小
 * @param {Number} position 单位位置
 * @param {Number} position.x 单位x坐标
 * @param {Number} position.y 单位y坐标
 * @returns 
 */
export const drawHealthBar = (ctx, unit, config) => {
  const marginTop = 4
  const marginLeft = 4
  const marginRight = 4

  const size = unit.size || 40
  const barWidth = size - marginLeft - marginRight
  const barHeight = 2
  const barGap = 1
  
  const x = config.x
  const y = config.y
  
  // 血条参数
  const maxHp = unit.maxHp || 100
  const hp = unit.hp ?? maxHp
  const hpRatio = Math.max(0, Math.min(1, hp / maxHp))
  
  // 蓝条参数
  const maxMp = unit.maxMp || 100
  const mp = unit.mp ?? maxMp
  const mpRatio = Math.max(0, Math.min(1, mp / maxMp))
  
  // 血条位置（单位下方）
  const barX = x + marginLeft
  const hpBarY = y + size + marginTop
  const mpBarY = hpBarY + barHeight + barGap
  
  // 绘制血条背景
  ctx.fillStyle = '#3A3A3A'
  ctx.fillRect(barX, hpBarY, barWidth, barHeight)
  
  // 绘制血条当前值
  const hpColor = '#F44336'
  ctx.fillStyle = hpColor
  ctx.fillRect(barX, hpBarY, barWidth * hpRatio, barHeight)
  
  // 绘制蓝条背景
  ctx.fillStyle = '#3A3A3A'
  ctx.fillRect(barX, mpBarY, barWidth, barHeight)
  
  // 绘制蓝条当前值
  ctx.fillStyle = '#2196F3'
  ctx.fillRect(barX, mpBarY, barWidth * mpRatio, barHeight)

  ctx.fillStyle = config.textColor || '#333';
  ctx.font = '8px sans-serif';
  ctx.textAlign = 'center';   
  ctx.textBaseline = 'top'; 

  ctx.fillText(
    unit.name,
    barX + barWidth / 2,
    hpBarY + barHeight * 2 + 4
  );
}
/**
 * @description {drawSelectMenus} 绘制选择菜单
 * @param {CanvasRenderingContext2D} ctx canvas上下文
 * @param {Object} config 选择菜单配置
 * @param {Number} config.x 选择菜单x坐标
 * @param {Number} config.y 选择菜单y坐标
 * @param {Number} config.width 选择菜单item宽度
 * @param {Number} config.height 选择菜单item高度
 * @param {Function} config.callback 选择菜单item点击回调函数, 参数为选择菜单项item
 * @param {Array} config.list 选择菜单列表
 * @param {Object} config.list[0] 选择菜单项
 * @param {String} config.list[0].label 选择菜单项标签文本
 * @param {Number} config.list[0].value 选择菜单项值
 * @param {Number} config.list[0].isDisabled 是否可点击
 */
export const drawSelectMenus = (ctx, config) => {
  const list = config.list || []
  const x = config.x
  const y = config.y
  const itemWidth = config.width || 80
  const itemHeight = config.height || 14
  const padding = 2
  const borderWidth = 1

  ctx.imageSmoothingEnabled = false

  const listCount = list.length
  const menuHeight = listCount * itemHeight + padding * 2

  ctx.fillStyle = '#1A1A2E'
  ctx.fillRect(x, y, itemWidth + padding * 2, menuHeight)

  ctx.fillStyle = '#16213E'
  ctx.fillRect(x + borderWidth, y + borderWidth, itemWidth + padding * 2 - borderWidth * 2, menuHeight - borderWidth * 2)

  for (let i = 0; i < listCount; i++) {
    const item = list[i]
    const itemY = y + padding + i * itemHeight
    const itemX = x + padding

    if (item.isDisabled) {
      ctx.fillStyle = '#2A2A3E'
    } else {
      ctx.fillStyle = '#2E3A5E'
    }
    ctx.fillRect(itemX, itemY, itemWidth, itemHeight - padding)

    if (!item.isDisabled) {
      ctx.fillStyle = '#4A5A8E'
      ctx.fillRect(itemX, itemY, itemWidth, borderWidth)
      ctx.fillStyle = '#0E1A2E'
      ctx.fillRect(itemX, itemY + itemHeight - padding - borderWidth, itemWidth, borderWidth)
    }

    ctx.font = '10px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = item.isDisabled ? '#666666' : '#E0E0E0'
    ctx.fillText(item.label, itemX + 6, itemY + (itemHeight - padding) / 2)
  }
}