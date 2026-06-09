/**
 * 绘制史莱姆怪物
 * @param {CanvasElement} canvasRef canvas元素
 * @param {Object} currentUnit 史莱姆位置和状态
 * @param {Number} currentUnit.x 史莱姆x坐标
 * @param {Number} currentUnit.y 史莱姆y坐标
 * @param {Number} currentUnit.size 史莱姆大小(px)
 * @param {String} currentUnit.direction 方向 'down' | 'up' | 'left' | 'right'
 * @param {Number} currentUnit.frame 动画帧 0-1
 */

export const config = {
  IDLE_SPEED: 0.005, // 待机动画速度（已优化，跳动更平缓）
  WALK_SPEED: 0.005, // 行走动画速度
}

// 史莱姆颜色定义
const SLIME_COLORS = {
  body: '#32CD32',      // 主体绿色
  bodyLight: '#90EE90', // 浅绿色高光
  bodyDark: '#228B22',  // 深绿色阴影
  bodyDarker: '#006400', // 更深的阴影
  eye: '#FFFFFF',       // 眼白
  pupil: '#000000',     // 瞳孔
  highlight: '#FFFFFF'  // 高光点
};

// 史莱姆弹跳动画帧 - 16x12 网格设计
const SLIME_FRAMES = [
  // 帧0：正常状态（中间高度）
  {
    body: [
      [5, 1, SLIME_COLORS.bodyLight], [6, 1, SLIME_COLORS.bodyLight], [7, 1, SLIME_COLORS.bodyLight], [8, 1, SLIME_COLORS.bodyLight], [9, 1, SLIME_COLORS.bodyLight],
      [4, 2, SLIME_COLORS.bodyLight], [5, 2, SLIME_COLORS.body], [6, 2, SLIME_COLORS.body], [7, 2, SLIME_COLORS.body], [8, 2, SLIME_COLORS.body], [9, 2, SLIME_COLORS.body], [10, 2, SLIME_COLORS.body],
      [4, 3, SLIME_COLORS.body], [5, 3, SLIME_COLORS.body], [6, 3, SLIME_COLORS.bodyLight], [7, 3, SLIME_COLORS.bodyLight], [8, 3, SLIME_COLORS.bodyLight], [9, 3, SLIME_COLORS.body], [10, 3, SLIME_COLORS.body],
      [3, 4, SLIME_COLORS.body], [4, 4, SLIME_COLORS.body], [5, 4, SLIME_COLORS.body], [6, 4, SLIME_COLORS.body], [7, 4, SLIME_COLORS.body], [8, 4, SLIME_COLORS.body], [9, 4, SLIME_COLORS.body], [10, 4, SLIME_COLORS.body], [11, 4, SLIME_COLORS.body],
      [3, 5, SLIME_COLORS.body], [4, 5, SLIME_COLORS.body], [5, 5, SLIME_COLORS.body], [6, 5, SLIME_COLORS.body], [7, 5, SLIME_COLORS.body], [8, 5, SLIME_COLORS.body], [9, 5, SLIME_COLORS.body], [10, 5, SLIME_COLORS.body], [11, 5, SLIME_COLORS.body],
      [3, 6, SLIME_COLORS.body], [4, 6, SLIME_COLORS.body], [5, 6, SLIME_COLORS.body], [6, 6, SLIME_COLORS.body], [7, 6, SLIME_COLORS.body], [8, 6, SLIME_COLORS.body], [9, 6, SLIME_COLORS.body], [10, 6, SLIME_COLORS.body], [11, 6, SLIME_COLORS.body],
      [3, 7, SLIME_COLORS.body], [4, 7, SLIME_COLORS.body], [5, 7, SLIME_COLORS.bodyDark], [6, 7, SLIME_COLORS.bodyDark], [7, 7, SLIME_COLORS.bodyDark], [8, 7, SLIME_COLORS.bodyDark], [9, 7, SLIME_COLORS.bodyDark], [10, 7, SLIME_COLORS.bodyDark], [11, 7, SLIME_COLORS.body],
      [3, 8, SLIME_COLORS.body], [4, 8, SLIME_COLORS.bodyDark], [5, 8, SLIME_COLORS.bodyDarker], [6, 8, SLIME_COLORS.bodyDarker], [7, 8, SLIME_COLORS.bodyDarker], [8, 8, SLIME_COLORS.bodyDarker], [9, 8, SLIME_COLORS.bodyDarker], [10, 8, SLIME_COLORS.bodyDarker], [11, 8, SLIME_COLORS.bodyDark],
      [4, 9, SLIME_COLORS.bodyDark], [5, 9, SLIME_COLORS.bodyDarker], [6, 9, SLIME_COLORS.bodyDarker], [7, 9, SLIME_COLORS.bodyDarker], [8, 9, SLIME_COLORS.bodyDarker], [9, 9, SLIME_COLORS.bodyDarker], [10, 9, SLIME_COLORS.bodyDarker],
      [5, 10, SLIME_COLORS.bodyDarker], [6, 10, SLIME_COLORS.bodyDarker], [7, 10, SLIME_COLORS.bodyDarker], [8, 10, SLIME_COLORS.bodyDarker],
    ],
    eyes: [
      [5, 4, SLIME_COLORS.eye], [6, 4, SLIME_COLORS.eye], [8, 4, SLIME_COLORS.eye], [9, 4, SLIME_COLORS.eye],
      [5, 5, SLIME_COLORS.eye], [6, 5, SLIME_COLORS.pupil], [8, 5, SLIME_COLORS.pupil], [9, 5, SLIME_COLORS.eye],
      [5, 6, SLIME_COLORS.eye], [6, 6, SLIME_COLORS.eye], [8, 6, SLIME_COLORS.eye], [9, 6, SLIME_COLORS.eye],
    ],
    highlight: [
      [6, 2, SLIME_COLORS.highlight], [7, 2, SLIME_COLORS.highlight],
      [7, 3, SLIME_COLORS.highlight],
    ]
  },
  // 帧1：压缩状态（底部更宽更扁）
  {
    body: [
      [4, 3, SLIME_COLORS.bodyLight], [5, 3, SLIME_COLORS.bodyLight], [6, 3, SLIME_COLORS.bodyLight], [7, 3, SLIME_COLORS.bodyLight], [8, 3, SLIME_COLORS.bodyLight], [9, 3, SLIME_COLORS.bodyLight], [10, 3, SLIME_COLORS.bodyLight],
      [3, 4, SLIME_COLORS.bodyLight], [4, 4, SLIME_COLORS.body], [5, 4, SLIME_COLORS.body], [6, 4, SLIME_COLORS.body], [7, 4, SLIME_COLORS.body], [8, 4, SLIME_COLORS.body], [9, 4, SLIME_COLORS.body], [10, 4, SLIME_COLORS.body], [11, 4, SLIME_COLORS.body],
      [3, 5, SLIME_COLORS.body], [4, 5, SLIME_COLORS.body], [5, 5, SLIME_COLORS.bodyLight], [6, 5, SLIME_COLORS.bodyLight], [7, 5, SLIME_COLORS.bodyLight], [8, 5, SLIME_COLORS.bodyLight], [9, 5, SLIME_COLORS.body], [10, 5, SLIME_COLORS.body], [11, 5, SLIME_COLORS.body],
      [2, 6, SLIME_COLORS.body], [3, 6, SLIME_COLORS.body], [4, 6, SLIME_COLORS.body], [5, 6, SLIME_COLORS.body], [6, 6, SLIME_COLORS.body], [7, 6, SLIME_COLORS.body], [8, 6, SLIME_COLORS.body], [9, 6, SLIME_COLORS.body], [10, 6, SLIME_COLORS.body], [11, 6, SLIME_COLORS.body], [12, 6, SLIME_COLORS.body],
      [2, 7, SLIME_COLORS.body], [3, 7, SLIME_COLORS.body], [4, 7, SLIME_COLORS.body], [5, 7, SLIME_COLORS.body], [6, 7, SLIME_COLORS.body], [7, 7, SLIME_COLORS.body], [8, 7, SLIME_COLORS.body], [9, 7, SLIME_COLORS.body], [10, 7, SLIME_COLORS.body], [11, 7, SLIME_COLORS.body], [12, 7, SLIME_COLORS.body],
      [2, 8, SLIME_COLORS.body], [3, 8, SLIME_COLORS.body], [4, 8, SLIME_COLORS.bodyDark], [5, 8, SLIME_COLORS.bodyDark], [6, 8, SLIME_COLORS.bodyDark], [7, 8, SLIME_COLORS.bodyDark], [8, 8, SLIME_COLORS.bodyDark], [9, 8, SLIME_COLORS.bodyDark], [10, 8, SLIME_COLORS.bodyDark], [11, 8, SLIME_COLORS.bodyDark], [12, 8, SLIME_COLORS.body],
      [2, 9, SLIME_COLORS.body], [3, 9, SLIME_COLORS.bodyDark], [4, 9, SLIME_COLORS.bodyDarker], [5, 9, SLIME_COLORS.bodyDarker], [6, 9, SLIME_COLORS.bodyDarker], [7, 9, SLIME_COLORS.bodyDarker], [8, 9, SLIME_COLORS.bodyDarker], [9, 9, SLIME_COLORS.bodyDarker], [10, 9, SLIME_COLORS.bodyDarker], [11, 9, SLIME_COLORS.bodyDarker], [12, 9, SLIME_COLORS.bodyDark],
      [3, 10, SLIME_COLORS.bodyDark], [4, 10, SLIME_COLORS.bodyDarker], [5, 10, SLIME_COLORS.bodyDarker], [6, 10, SLIME_COLORS.bodyDarker], [7, 10, SLIME_COLORS.bodyDarker], [8, 10, SLIME_COLORS.bodyDarker], [9, 10, SLIME_COLORS.bodyDarker], [10, 10, SLIME_COLORS.bodyDarker], [11, 10, SLIME_COLORS.bodyDarker],
      [4, 11, SLIME_COLORS.bodyDarker], [5, 11, SLIME_COLORS.bodyDarker], [6, 11, SLIME_COLORS.bodyDarker], [7, 11, SLIME_COLORS.bodyDarker], [8, 11, SLIME_COLORS.bodyDarker], [9, 11, SLIME_COLORS.bodyDarker], [10, 11, SLIME_COLORS.bodyDarker],
    ],
    eyes: [
      [4, 6, SLIME_COLORS.eye], [5, 6, SLIME_COLORS.eye], [7, 6, SLIME_COLORS.eye], [8, 6, SLIME_COLORS.eye],
      [4, 7, SLIME_COLORS.eye], [5, 7, SLIME_COLORS.pupil], [7, 7, SLIME_COLORS.pupil], [8, 7, SLIME_COLORS.eye],
      [4, 8, SLIME_COLORS.eye], [5, 8, SLIME_COLORS.eye], [7, 8, SLIME_COLORS.eye], [8, 8, SLIME_COLORS.eye],
    ],
    highlight: [
      [5, 4, SLIME_COLORS.highlight], [6, 4, SLIME_COLORS.highlight], [7, 4, SLIME_COLORS.highlight],
      [6, 5, SLIME_COLORS.highlight], [7, 5, SLIME_COLORS.highlight],
    ]
  },
  // 帧2：伸展状态（顶部更高更窄）
  {
    body: [
      [6, 0, SLIME_COLORS.bodyLight], [7, 0, SLIME_COLORS.bodyLight], [8, 0, SLIME_COLORS.bodyLight],
      [5, 1, SLIME_COLORS.bodyLight], [6, 1, SLIME_COLORS.bodyLight], [7, 1, SLIME_COLORS.bodyLight], [8, 1, SLIME_COLORS.bodyLight], [9, 1, SLIME_COLORS.bodyLight],
      [5, 2, SLIME_COLORS.bodyLight], [6, 2, SLIME_COLORS.body], [7, 2, SLIME_COLORS.body], [8, 2, SLIME_COLORS.body], [9, 2, SLIME_COLORS.body],
      [4, 3, SLIME_COLORS.body], [5, 3, SLIME_COLORS.body], [6, 3, SLIME_COLORS.bodyLight], [7, 3, SLIME_COLORS.bodyLight], [8, 3, SLIME_COLORS.bodyLight], [9, 3, SLIME_COLORS.body], [10, 3, SLIME_COLORS.body],
      [4, 4, SLIME_COLORS.body], [5, 4, SLIME_COLORS.body], [6, 4, SLIME_COLORS.body], [7, 4, SLIME_COLORS.body], [8, 4, SLIME_COLORS.body], [9, 4, SLIME_COLORS.body], [10, 4, SLIME_COLORS.body],
      [4, 5, SLIME_COLORS.body], [5, 5, SLIME_COLORS.body], [6, 5, SLIME_COLORS.body], [7, 5, SLIME_COLORS.body], [8, 5, SLIME_COLORS.body], [9, 5, SLIME_COLORS.body], [10, 5, SLIME_COLORS.body],
      [4, 6, SLIME_COLORS.body], [5, 6, SLIME_COLORS.bodyDark], [6, 6, SLIME_COLORS.bodyDark], [7, 6, SLIME_COLORS.bodyDark], [8, 6, SLIME_COLORS.bodyDark], [9, 6, SLIME_COLORS.bodyDark], [10, 6, SLIME_COLORS.bodyDark],
      [4, 7, SLIME_COLORS.body], [5, 7, SLIME_COLORS.bodyDark], [6, 7, SLIME_COLORS.bodyDarker], [7, 7, SLIME_COLORS.bodyDarker], [8, 7, SLIME_COLORS.bodyDarker], [9, 7, SLIME_COLORS.bodyDarker], [10, 7, SLIME_COLORS.bodyDark],
      [5, 8, SLIME_COLORS.bodyDark], [6, 8, SLIME_COLORS.bodyDarker], [7, 8, SLIME_COLORS.bodyDarker], [8, 8, SLIME_COLORS.bodyDarker], [9, 8, SLIME_COLORS.bodyDarker],
      [5, 9, SLIME_COLORS.bodyDarker], [6, 9, SLIME_COLORS.bodyDarker], [7, 9, SLIME_COLORS.bodyDarker], [8, 9, SLIME_COLORS.bodyDarker], [9, 9, SLIME_COLORS.bodyDarker],
    ],
    eyes: [
      [5, 4, SLIME_COLORS.eye], [6, 4, SLIME_COLORS.eye], [8, 4, SLIME_COLORS.eye], [9, 4, SLIME_COLORS.eye],
      [5, 5, SLIME_COLORS.eye], [6, 5, SLIME_COLORS.pupil], [8, 5, SLIME_COLORS.pupil], [9, 5, SLIME_COLORS.eye],
      [5, 6, SLIME_COLORS.eye], [6, 6, SLIME_COLORS.eye], [8, 6, SLIME_COLORS.eye], [9, 6, SLIME_COLORS.eye],
    ],
    highlight: [
      [6, 2, SLIME_COLORS.highlight], [7, 2, SLIME_COLORS.highlight],
      [7, 3, SLIME_COLORS.highlight],
    ]
  }
];

export const drawSlime = (canvasRef, currentUnit) => {
  if (!canvasRef) return;
  const ctx = canvasRef.getContext('2d');
  const x = currentUnit.x;
  const y = currentUnit.y;
  const unit = currentUnit.size / 12;
  const frame = currentUnit.frame || 0;

  ctx.imageSmoothingEnabled = false;

  const drawPixel = (px, py, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + px * unit, y + py * unit, unit, unit);
  };

  // 选择动画帧
  const frameIndex = Math.floor(frame) % SLIME_FRAMES.length;
  const currentFrame = SLIME_FRAMES[frameIndex];

  // 绘制身体
  for (const pixel of currentFrame.body) {
    drawPixel(pixel[0], pixel[1], pixel[2]);
  }

  // 绘制眼睛
  for (const pixel of currentFrame.eyes) {
    drawPixel(pixel[0], pixel[1], pixel[2]);
  }

  // 绘制高光
  for (const pixel of currentFrame.highlight) {
    drawPixel(pixel[0], pixel[1], pixel[2]);
  }
};


export const drawSlimeAvatar = (canvasRef, currentUnit, avatarPos) => {
  if (!canvasRef) return;
  const ctx = canvasRef.getContext('2d');
  const x = avatarPos.x;
  const y = avatarPos.y;
  const unit = currentUnit.size / 12;

  ctx.imageSmoothingEnabled = false;

  const drawPixel = (px, py, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + px * unit, y + py * unit, unit, unit);
  };

  // 使用第一帧（正常状态）作为头像
  const avatarFrame = SLIME_FRAMES[0];

  // 绘制身体
  for (const pixel of avatarFrame.body) {
    drawPixel(pixel[0], pixel[1], pixel[2]);
  }

  // 绘制眼睛
  for (const pixel of avatarFrame.eyes) {
    drawPixel(pixel[0], pixel[1], pixel[2]);
  }

  // 绘制高光
  for (const pixel of avatarFrame.highlight) {
    drawPixel(pixel[0], pixel[1], pixel[2]);
  }
};
