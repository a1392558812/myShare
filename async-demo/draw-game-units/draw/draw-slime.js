export const config = {
  IDLE_SPEED: 0.005,
  WALK_SPEED: 0.005,
}

const SLIME_COLORS = {
  body: '#32CD32',
  bodyLight: '#90EE90',
  bodyDark: '#228B22',
  bodyDarker: '#006400',
  eye: '#FFFFFF',
  pupil: '#000000',
  highlight: '#FFFFFF'
};

const SLIME_FRAMES = [
  {
    body: [
      [3, 1, SLIME_COLORS.bodyLight], [4, 1, SLIME_COLORS.bodyLight], [5, 1, SLIME_COLORS.bodyLight], [6, 1, SLIME_COLORS.bodyLight], [7, 1, SLIME_COLORS.bodyLight],
      [2, 2, SLIME_COLORS.bodyLight], [3, 2, SLIME_COLORS.body], [4, 2, SLIME_COLORS.body], [5, 2, SLIME_COLORS.body], [6, 2, SLIME_COLORS.body], [7, 2, SLIME_COLORS.body], [8, 2, SLIME_COLORS.body],
      [2, 3, SLIME_COLORS.body], [3, 3, SLIME_COLORS.body], [4, 3, SLIME_COLORS.bodyLight], [5, 3, SLIME_COLORS.bodyLight], [6, 3, SLIME_COLORS.bodyLight], [7, 3, SLIME_COLORS.body], [8, 3, SLIME_COLORS.body],
      [1, 4, SLIME_COLORS.body], [2, 4, SLIME_COLORS.body], [3, 4, SLIME_COLORS.body], [4, 4, SLIME_COLORS.body], [5, 4, SLIME_COLORS.body], [6, 4, SLIME_COLORS.body], [7, 4, SLIME_COLORS.body], [8, 4, SLIME_COLORS.body], [9, 4, SLIME_COLORS.body],
      [1, 5, SLIME_COLORS.body], [2, 5, SLIME_COLORS.body], [3, 5, SLIME_COLORS.body], [4, 5, SLIME_COLORS.body], [5, 5, SLIME_COLORS.body], [6, 5, SLIME_COLORS.body], [7, 5, SLIME_COLORS.body], [8, 5, SLIME_COLORS.body], [9, 5, SLIME_COLORS.body],
      [1, 6, SLIME_COLORS.body], [2, 6, SLIME_COLORS.body], [3, 6, SLIME_COLORS.body], [4, 6, SLIME_COLORS.body], [5, 6, SLIME_COLORS.body], [6, 6, SLIME_COLORS.body], [7, 6, SLIME_COLORS.body], [8, 6, SLIME_COLORS.body], [9, 6, SLIME_COLORS.body],
      [1, 7, SLIME_COLORS.body], [2, 7, SLIME_COLORS.body], [3, 7, SLIME_COLORS.bodyDark], [4, 7, SLIME_COLORS.bodyDark], [5, 7, SLIME_COLORS.bodyDark], [6, 7, SLIME_COLORS.bodyDark], [7, 7, SLIME_COLORS.bodyDark], [8, 7, SLIME_COLORS.bodyDark], [9, 7, SLIME_COLORS.body],
      [1, 8, SLIME_COLORS.body], [2, 8, SLIME_COLORS.bodyDark], [3, 8, SLIME_COLORS.bodyDarker], [4, 8, SLIME_COLORS.bodyDarker], [5, 8, SLIME_COLORS.bodyDarker], [6, 8, SLIME_COLORS.bodyDarker], [7, 8, SLIME_COLORS.bodyDarker], [8, 8, SLIME_COLORS.bodyDarker], [9, 8, SLIME_COLORS.bodyDark],
      [2, 9, SLIME_COLORS.bodyDark], [3, 9, SLIME_COLORS.bodyDarker], [4, 9, SLIME_COLORS.bodyDarker], [5, 9, SLIME_COLORS.bodyDarker], [6, 9, SLIME_COLORS.bodyDarker], [7, 9, SLIME_COLORS.bodyDarker], [8, 9, SLIME_COLORS.bodyDarker],
      [3, 10, SLIME_COLORS.bodyDarker], [4, 10, SLIME_COLORS.bodyDarker], [5, 10, SLIME_COLORS.bodyDarker], [6, 10, SLIME_COLORS.bodyDarker],
    ],
    eyes: [
      [3, 4, SLIME_COLORS.eye], [4, 4, SLIME_COLORS.eye], [6, 4, SLIME_COLORS.eye], [7, 4, SLIME_COLORS.eye],
      [3, 5, SLIME_COLORS.eye], [4, 5, SLIME_COLORS.pupil], [6, 5, SLIME_COLORS.pupil], [7, 5, SLIME_COLORS.eye],
      [3, 6, SLIME_COLORS.eye], [4, 6, SLIME_COLORS.eye], [6, 6, SLIME_COLORS.eye], [7, 6, SLIME_COLORS.eye],
    ],
    highlight: [
      [4, 2, SLIME_COLORS.highlight], [5, 2, SLIME_COLORS.highlight],
      [5, 3, SLIME_COLORS.highlight],
    ]
  },
  {
    body: [
      [2, 3, SLIME_COLORS.bodyLight], [3, 3, SLIME_COLORS.bodyLight], [4, 3, SLIME_COLORS.bodyLight], [5, 3, SLIME_COLORS.bodyLight], [6, 3, SLIME_COLORS.bodyLight], [7, 3, SLIME_COLORS.bodyLight], [8, 3, SLIME_COLORS.bodyLight],
      [1, 4, SLIME_COLORS.bodyLight], [2, 4, SLIME_COLORS.body], [3, 4, SLIME_COLORS.body], [4, 4, SLIME_COLORS.body], [5, 4, SLIME_COLORS.body], [6, 4, SLIME_COLORS.body], [7, 4, SLIME_COLORS.body], [8, 4, SLIME_COLORS.body], [9, 4, SLIME_COLORS.body],
      [1, 5, SLIME_COLORS.body], [2, 5, SLIME_COLORS.body], [3, 5, SLIME_COLORS.bodyLight], [4, 5, SLIME_COLORS.bodyLight], [5, 5, SLIME_COLORS.bodyLight], [6, 5, SLIME_COLORS.bodyLight], [7, 5, SLIME_COLORS.body], [8, 5, SLIME_COLORS.body], [9, 5, SLIME_COLORS.body], [10, 5, SLIME_COLORS.body],
      [0, 6, SLIME_COLORS.body], [1, 6, SLIME_COLORS.body], [2, 6, SLIME_COLORS.body], [3, 6, SLIME_COLORS.body], [4, 6, SLIME_COLORS.body], [5, 6, SLIME_COLORS.body], [6, 6, SLIME_COLORS.body], [7, 6, SLIME_COLORS.body], [8, 6, SLIME_COLORS.body], [9, 6, SLIME_COLORS.body], [10, 6, SLIME_COLORS.body], [11, 6, SLIME_COLORS.body],
      [0, 7, SLIME_COLORS.body], [1, 7, SLIME_COLORS.body], [2, 7, SLIME_COLORS.body], [3, 7, SLIME_COLORS.body], [4, 7, SLIME_COLORS.body], [5, 7, SLIME_COLORS.body], [6, 7, SLIME_COLORS.body], [7, 7, SLIME_COLORS.body], [8, 7, SLIME_COLORS.body], [9, 7, SLIME_COLORS.body], [10, 7, SLIME_COLORS.body], [11, 7, SLIME_COLORS.body],
      [0, 8, SLIME_COLORS.body], [1, 8, SLIME_COLORS.body], [2, 8, SLIME_COLORS.bodyDark], [3, 8, SLIME_COLORS.bodyDark], [4, 8, SLIME_COLORS.bodyDark], [5, 8, SLIME_COLORS.bodyDark], [6, 8, SLIME_COLORS.bodyDark], [7, 8, SLIME_COLORS.bodyDark], [8, 8, SLIME_COLORS.bodyDark], [9, 8, SLIME_COLORS.bodyDark], [10, 8, SLIME_COLORS.bodyDark], [11, 8, SLIME_COLORS.body],
      [0, 9, SLIME_COLORS.body], [1, 9, SLIME_COLORS.bodyDark], [2, 9, SLIME_COLORS.bodyDarker], [3, 9, SLIME_COLORS.bodyDarker], [4, 9, SLIME_COLORS.bodyDarker], [5, 9, SLIME_COLORS.bodyDarker], [6, 9, SLIME_COLORS.bodyDarker], [7, 9, SLIME_COLORS.bodyDarker], [8, 9, SLIME_COLORS.bodyDarker], [9, 9, SLIME_COLORS.bodyDarker], [10, 9, SLIME_COLORS.bodyDarker], [11, 9, SLIME_COLORS.bodyDark],
      [1, 10, SLIME_COLORS.bodyDark], [2, 10, SLIME_COLORS.bodyDarker], [3, 10, SLIME_COLORS.bodyDarker], [4, 10, SLIME_COLORS.bodyDarker], [5, 10, SLIME_COLORS.bodyDarker], [6, 10, SLIME_COLORS.bodyDarker], [7, 10, SLIME_COLORS.bodyDarker], [8, 10, SLIME_COLORS.bodyDarker], [9, 10, SLIME_COLORS.bodyDarker],
      [2, 11, SLIME_COLORS.bodyDarker], [3, 11, SLIME_COLORS.bodyDarker], [4, 11, SLIME_COLORS.bodyDarker], [5, 11, SLIME_COLORS.bodyDarker], [6, 11, SLIME_COLORS.bodyDarker], [7, 11, SLIME_COLORS.bodyDarker], [8, 11, SLIME_COLORS.bodyDarker],
    ],
    eyes: [
      [2, 6, SLIME_COLORS.eye], [3, 6, SLIME_COLORS.eye], [5, 6, SLIME_COLORS.eye], [6, 6, SLIME_COLORS.eye],
      [2, 7, SLIME_COLORS.eye], [3, 7, SLIME_COLORS.pupil], [5, 7, SLIME_COLORS.pupil], [6, 7, SLIME_COLORS.eye],
      [2, 8, SLIME_COLORS.eye], [3, 8, SLIME_COLORS.eye], [5, 8, SLIME_COLORS.eye], [6, 8, SLIME_COLORS.eye],
    ],
    highlight: [
      [3, 4, SLIME_COLORS.highlight], [4, 4, SLIME_COLORS.highlight], [5, 4, SLIME_COLORS.highlight],
      [4, 5, SLIME_COLORS.highlight], [5, 5, SLIME_COLORS.highlight],
    ]
  },
  {
    body: [
      [4, 0, SLIME_COLORS.bodyLight], [5, 0, SLIME_COLORS.bodyLight], [6, 0, SLIME_COLORS.bodyLight],
      [3, 1, SLIME_COLORS.bodyLight], [4, 1, SLIME_COLORS.bodyLight], [5, 1, SLIME_COLORS.bodyLight], [6, 1, SLIME_COLORS.bodyLight], [7, 1, SLIME_COLORS.bodyLight],
      [3, 2, SLIME_COLORS.bodyLight], [4, 2, SLIME_COLORS.body], [5, 2, SLIME_COLORS.body], [6, 2, SLIME_COLORS.body], [7, 2, SLIME_COLORS.body],
      [2, 3, SLIME_COLORS.body], [3, 3, SLIME_COLORS.body], [4, 3, SLIME_COLORS.bodyLight], [5, 3, SLIME_COLORS.bodyLight], [6, 3, SLIME_COLORS.bodyLight], [7, 3, SLIME_COLORS.body], [8, 3, SLIME_COLORS.body],
      [2, 4, SLIME_COLORS.body], [3, 4, SLIME_COLORS.body], [4, 4, SLIME_COLORS.body], [5, 4, SLIME_COLORS.body], [6, 4, SLIME_COLORS.body], [7, 4, SLIME_COLORS.body], [8, 4, SLIME_COLORS.body],
      [2, 5, SLIME_COLORS.body], [3, 5, SLIME_COLORS.body], [4, 5, SLIME_COLORS.body], [5, 5, SLIME_COLORS.body], [6, 5, SLIME_COLORS.body], [7, 5, SLIME_COLORS.body], [8, 5, SLIME_COLORS.body],
      [2, 6, SLIME_COLORS.body], [3, 6, SLIME_COLORS.bodyDark], [4, 6, SLIME_COLORS.bodyDark], [5, 6, SLIME_COLORS.bodyDark], [6, 6, SLIME_COLORS.bodyDark], [7, 6, SLIME_COLORS.bodyDark], [8, 6, SLIME_COLORS.bodyDark],
      [2, 7, SLIME_COLORS.body], [3, 7, SLIME_COLORS.bodyDark], [4, 7, SLIME_COLORS.bodyDarker], [5, 7, SLIME_COLORS.bodyDarker], [6, 7, SLIME_COLORS.bodyDarker], [7, 7, SLIME_COLORS.bodyDarker], [8, 7, SLIME_COLORS.bodyDark],
      [3, 8, SLIME_COLORS.bodyDark], [4, 8, SLIME_COLORS.bodyDarker], [5, 8, SLIME_COLORS.bodyDarker], [6, 8, SLIME_COLORS.bodyDarker], [7, 8, SLIME_COLORS.bodyDarker],
      [3, 9, SLIME_COLORS.bodyDarker], [4, 9, SLIME_COLORS.bodyDarker], [5, 9, SLIME_COLORS.bodyDarker], [6, 9, SLIME_COLORS.bodyDarker], [7, 9, SLIME_COLORS.bodyDarker],
    ],
    eyes: [
      [3, 4, SLIME_COLORS.eye], [4, 4, SLIME_COLORS.eye], [6, 4, SLIME_COLORS.eye], [7, 4, SLIME_COLORS.eye],
      [3, 5, SLIME_COLORS.eye], [4, 5, SLIME_COLORS.pupil], [6, 5, SLIME_COLORS.pupil], [7, 5, SLIME_COLORS.eye],
      [3, 6, SLIME_COLORS.eye], [4, 6, SLIME_COLORS.eye], [6, 6, SLIME_COLORS.eye], [7, 6, SLIME_COLORS.eye],
    ],
    highlight: [
      [4, 2, SLIME_COLORS.highlight], [5, 2, SLIME_COLORS.highlight],
      [5, 3, SLIME_COLORS.highlight],
    ]
  }
];

export const drawSlime = (ctx, currentUnit) => {
  const x = currentUnit.x;
  const y = currentUnit.y;
  const unit = currentUnit.size / 12;
  const frame = currentUnit.frame || 0;

  ctx.imageSmoothingEnabled = false;

  const drawPixel = (px, py, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + px * unit, y + py * unit, unit, unit);
  };

  const frameIndex = Math.floor(frame) % SLIME_FRAMES.length;
  const currentFrame = SLIME_FRAMES[frameIndex];

  for (const pixel of currentFrame.body) {
    drawPixel(pixel[0], pixel[1], pixel[2]);
  }

  for (const pixel of currentFrame.eyes) {
    drawPixel(pixel[0], pixel[1], pixel[2]);
  }

  for (const pixel of currentFrame.highlight) {
    drawPixel(pixel[0], pixel[1], pixel[2]);
  }
};


export const drawSlimeAvatar = (ctx, currentUnit, avatarPos) => {
  const x = avatarPos.x;
  const y = avatarPos.y;
  const unit = currentUnit.size / 12;

  ctx.imageSmoothingEnabled = false;

  const drawPixel = (px, py, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + px * unit, y + py * unit, unit, unit);
  };

  const avatarFrame = SLIME_FRAMES[0];

  for (const pixel of avatarFrame.body) {
    drawPixel(pixel[0], pixel[1], pixel[2]);
  }

  for (const pixel of avatarFrame.eyes) {
    drawPixel(pixel[0], pixel[1], pixel[2]);
  }

  for (const pixel of avatarFrame.highlight) {
    drawPixel(pixel[0], pixel[1], pixel[2]);
  }
};
