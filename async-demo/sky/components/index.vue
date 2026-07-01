<template>
  <div v-if="status === 'loading'">Loading...</div>
  <div v-else-if="status === 'error'">组件加载出错了</div>
  <canvas v-else-if="status === 'success'" ref="canvasRef" class="kawaii-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, nextTick, onBeforeUnmount } from "vue";

const status = ref('loading')
const loadRough = ({ targetUrl }) => {
  return new Promise((resolve, reject) => {
    const proxyCode = `
      import * as rough from '${targetUrl}';
      window.__rough_loaded = rough;
    `

    const blob = new Blob([proxyCode], { type: 'application/javascript' })
    const blobUrl = URL.createObjectURL(blob)

    const script = document.createElement('script')
    script.type = 'module'
    script.src = blobUrl

    script.onload = () => {
      const exports = window.__rough_loaded
      if (exports) {
        resolve(exports)
      } else {
        reject(new Error('代理脚本执行成功但未导出任何内容'))
      }
      delete window.__rough_loaded
      URL.revokeObjectURL(blobUrl)
      script.remove()
    }

    script.onerror = () => {
      const error = new Error(`加载 Rough 失败: ${targetUrl}`)
      reject(error)
      URL.revokeObjectURL(blobUrl)
      script.remove()
    }

    document.head.appendChild(script)
  })
}

status.value = 'loading'

const loadRoughPromise = loadRough({
  targetUrl: 'https://cdn.jsdelivr.net/npm/roughjs/bundled/rough.esm.js',
})

const canvasRef = ref(null);
const FRAME_COUNT = 12;
const FRAME_INTERVAL = 250;
const frames = ref([]);
let frameIndex = 0;
let lastDrawTime = 0;
let rafId = null;
let rough = null;


const drawSky = (ctx, rc, W, H) => {
  rc.rectangle(0, 0, W, H * 0.7, {
    fill: '#b3d9ff',
    stroke: 'transparent',
    roughness: 0.3,
  })
  rc.rectangle(0, H * 0.4, W, H * 0.6, {
    fill: '#ffd6e0',
    stroke: 'transparent',
    roughness: 0.3,
  })
}

const drawGrass = (ctx, rc, W, H) => {
  rc.rectangle(0, H * 0.75, W, H * 0.25, {
    fill: '#a8e6a3',
    stroke: 'transparent',
    roughness: 0.5,
  })
}

const drawRainbow = (ctx, rc, W, H) => {
  const rainbowColors = ['#ff6b6b', '#feca57', '#54a0ff', '#5f27cd']
  rainbowColors.forEach((color, i) => {
    const radius = 60 - i * 8
    const x = 320,
      y = 200
    rc.path(
      `M ${x - radius} ${y} A ${radius} ${radius} 0 0 1 ${x + radius} ${y}`,
      {
        stroke: color,
        strokeWidth: 6,
        roughness: 0.6,
        fill: 'transparent',
      }
    )
  })
}

const drawSun = (ctx, rc, frameIdx) => {
  const sunX = 100,
    sunY = 80,
    sunR = 40
  rc.circle(sunX, sunY, sunR, {
    fill: '#ffd93d',
    stroke: '#f6b93b',
    strokeWidth: 2,
    roughness: 0.4,
    hachureAngle: 60,
  })
  const eyeOffset = 12
  const isBlink = frameIdx % 4 === 0
  if (isBlink) {
    rc.path(
      `M ${sunX - eyeOffset - 6} ${sunY - 5} L ${sunX - eyeOffset + 6} ${sunY - 5}`,
      { stroke: '#333', strokeWidth: 2, roughness: 0.2 }
    )
    rc.path(
      `M ${sunX + eyeOffset - 6} ${sunY - 5} L ${sunX + eyeOffset + 6} ${sunY - 5}`,
      { stroke: '#333', strokeWidth: 2, roughness: 0.2 }
    )
  } else {
    rc.circle(sunX - eyeOffset, sunY - 4, 5, {
      fill: '#333',
      stroke: 'transparent',
      roughness: 0.2,
    })
    rc.circle(sunX + eyeOffset, sunY - 4, 5, {
      fill: '#333',
      stroke: 'transparent',
      roughness: 0.2,
    })
  }
  rc.path(
    `M ${sunX - 16} ${sunY + 8} Q ${sunX} ${sunY + 22} ${sunX + 16} ${sunY + 8}`,
    {
      stroke: '#333',
      strokeWidth: 2.5,
      roughness: 0.3,
      fill: 'transparent',
    }
  )
}

const drawClouds = (ctx, rc, frameIdx) => {
  const cloudOffset = (frameIdx / FRAME_COUNT) * 80
  const clouds = [
    { x: 220 - cloudOffset, y: 50, size: 1.0 },
    { x: 340 - cloudOffset * 1.3, y: 100, size: 0.7 },
  ]
  clouds.forEach(({ x, y, size }) => {
    let cx = (((x % 420) + 420) % 420) - 20
    ctx.save()
    ctx.translate(cx, y)
    ctx.scale(size, size)
    rc.circle(0, 0, 25, { fill: '#ffffff', stroke: 'transparent', roughness: 0.3 })
    rc.circle(25, -6, 30, { fill: '#ffffff', stroke: 'transparent', roughness: 0.3 })
    rc.circle(50, 0, 25, { fill: '#ffffff', stroke: 'transparent', roughness: 0.3 })
    rc.circle(22, 12, 20, { fill: '#ffffff', stroke: 'transparent', roughness: 0.3 })
    ctx.restore()
  })
}

const drawStars = (ctx, rc, frameIdx) => {
  const stars = [
    { x: 50, y: 40, baseSize: 8 },
    { x: 280, y: 30, baseSize: 10 },
    { x: 370, y: 60, baseSize: 6 },
  ]
  stars.forEach((star, i) => {
    const flicker = 0.6 + 0.4 * Math.sin(frameIdx * 0.8 + i)
    const size = star.baseSize * flicker
    const cx = star.x,
      cy = star.y
    const outer = size,
      inner = size * 0.4
    const points = 5
    let path = ''
    for (let j = 0; j < points * 2; j++) {
      const radius = j % 2 === 0 ? outer : inner
      const angle = (j / (points * 2)) * Math.PI * 2 - Math.PI / 2
      const x = cx + radius * Math.cos(angle)
      const y = cy + radius * Math.sin(angle)
      path += (j === 0 ? 'M' : 'L') + `${x} ${y} `
    }
    path += 'Z'
    rc.path(path, {
      fill: '#f7dc6f',
      stroke: '#f1c40f',
      strokeWidth: 1.5,
      roughness: 0.4,
    })
  })
}

const drawFlowers = (ctx, rc) => {
  const flowers = [
    { x: 60, y: 260, color: '#ff6b81' },
    { x: 150, y: 275, color: '#f368e0' },
    { x: 330, y: 255, color: '#ff9f43' },
  ]
  flowers.forEach(({ x, y, color }) => {
    rc.path(`M ${x} ${y} L ${x} ${y + 15}`, {
      stroke: '#2ecc71',
      strokeWidth: 2,
      roughness: 0.5,
    })
    const petalOffsets = [
      [-6, -6],
      [6, -6],
      [0, 0],
      [-6, 6],
      [6, 6],
    ]
    petalOffsets.forEach(([dx, dy]) => {
      rc.circle(x + dx, y + dy, 5, {
        fill: color,
        stroke: 'transparent',
        roughness: 0.3,
      })
    })
    rc.circle(x, y, 4, {
      fill: '#ffeaa7',
      stroke: 'transparent',
      roughness: 0.2,
    })
  })
}

const drawCat = (ctx, rc, frameIdx) => {
  const catX = 300,
    catY = 240
  const faceR = 40

  rc.path(
    `M ${catX - faceR + 5} ${catY - faceR + 10} L ${catX - faceR - 8} ${catY - faceR - 15} L ${catX - faceR + 22} ${catY - faceR + 2}`,
    {
      stroke: '#d35400',
      strokeWidth: 2,
      fill: '#f39c12',
      roughness: 0.5,
    }
  )
  rc.path(
    `M ${catX + faceR - 5} ${catY - faceR + 10} L ${catX + faceR + 8} ${catY - faceR - 15} L ${catX + faceR - 22} ${catY - faceR + 2}`,
    {
      stroke: '#d35400',
      strokeWidth: 2,
      fill: '#f39c12',
      roughness: 0.5,
    }
  )
  rc.path(
    `M ${catX - faceR + 8} ${catY - faceR + 12} L ${catX - faceR} ${catY - faceR - 6} L ${catX - faceR + 16} ${catY - faceR + 6}`,
    { stroke: 'transparent', fill: '#ffb6c1', roughness: 0.4 }
  )
  rc.path(
    `M ${catX + faceR - 8} ${catY - faceR + 12} L ${catX + faceR} ${catY - faceR - 6} L ${catX + faceR - 16} ${catY - faceR + 6}`,
    { stroke: 'transparent', fill: '#ffb6c1', roughness: 0.4 }
  )

  rc.circle(catX, catY, faceR, {
    fill: '#f5cba7',
    stroke: '#d35400',
    strokeWidth: 2,
    roughness: 0.6,
  })

  const eyeSpacing = 18,
    eyeRadius = 8
  const isBlinkCat = frameIdx % 3 === 0
  if (isBlinkCat) {
    rc.path(
      `M ${catX - eyeSpacing - 8} ${catY - 4} Q ${catX - eyeSpacing} ${catY - 10} ${catX - eyeSpacing + 8} ${catY - 4}`,
      { stroke: '#333', strokeWidth: 2, roughness: 0.3, fill: 'transparent' }
    )
    rc.path(
      `M ${catX + eyeSpacing - 8} ${catY - 4} Q ${catX + eyeSpacing} ${catY - 10} ${catX + eyeSpacing + 8} ${catY - 4}`,
      { stroke: '#333', strokeWidth: 2, roughness: 0.3, fill: 'transparent' }
    )
  } else {
    rc.circle(catX - eyeSpacing, catY - 4, eyeRadius, {
      fill: 'white',
      stroke: '#333',
      strokeWidth: 1.5,
      roughness: 0.3,
    })
    rc.circle(catX + eyeSpacing, catY - 4, eyeRadius, {
      fill: 'white',
      stroke: '#333',
      strokeWidth: 1.5,
      roughness: 0.3,
    })
    rc.circle(catX - eyeSpacing + 2, catY - 6, 4, {
      fill: '#222',
      stroke: 'transparent',
      roughness: 0.2,
    })
    rc.circle(catX + eyeSpacing + 2, catY - 6, 4, {
      fill: '#222',
      stroke: 'transparent',
      roughness: 0.2,
    })
    rc.circle(catX - eyeSpacing + 4, catY - 9, 1.8, {
      fill: 'white',
      stroke: 'transparent',
      roughness: 0.1,
    })
    rc.circle(catX + eyeSpacing + 4, catY - 9, 1.8, {
      fill: 'white',
      stroke: 'transparent',
      roughness: 0.1,
    })
  }

  rc.circle(catX, catY + 6, 5, {
    fill: '#ff6b81',
    stroke: 'transparent',
    roughness: 0.3,
  })

  rc.path(
    `M ${catX - 10} ${catY + 10} Q ${catX - 6} ${catY + 16} ${catX} ${catY + 12} Q ${catX + 6} ${catY + 16} ${catX + 10} ${catY + 10}`,
    {
      stroke: '#333',
      strokeWidth: 2,
      roughness: 0.3,
      fill: 'transparent',
    }
  )

  const whiskerLen = 22,
    whiskerYOff = 4
  const shiftL = 2 * Math.sin(frameIdx * 0.5)
  rc.path(
    `M ${catX - faceR + 4} ${catY - 4} L ${catX - faceR - whiskerLen + shiftL} ${catY - 6 + whiskerYOff * 0.5}`,
    { stroke: '#555', strokeWidth: 1.5, roughness: 0.4 }
  )
  rc.path(
    `M ${catX - faceR + 4} ${catY + 2} L ${catX - faceR - whiskerLen + shiftL * 0.7} ${catY + 4 + whiskerYOff}`,
    { stroke: '#555', strokeWidth: 1.5, roughness: 0.4 }
  )
  rc.path(
    `M ${catX - faceR + 4} ${catY + 8} L ${catX - faceR - whiskerLen + shiftL * 1.2} ${catY + 12 + whiskerYOff * 0.8}`,
    { stroke: '#555', strokeWidth: 1.5, roughness: 0.4 }
  )
  const shiftR = 2 * Math.sin(frameIdx * 0.5 + 0.8)
  rc.path(
    `M ${catX + faceR - 4} ${catY - 4} L ${catX + faceR + whiskerLen + shiftR} ${catY - 6 + whiskerYOff * 0.5}`,
    { stroke: '#555', strokeWidth: 1.5, roughness: 0.4 }
  )
  rc.path(
    `M ${catX + faceR - 4} ${catY + 2} L ${catX + faceR + whiskerLen + shiftR * 0.7} ${catY + 4 + whiskerYOff}`,
    { stroke: '#555', strokeWidth: 1.5, roughness: 0.4 }
  )
  rc.path(
    `M ${catX + faceR - 4} ${catY + 8} L ${catX + faceR + whiskerLen + shiftR * 1.2} ${catY + 12 + whiskerYOff * 0.8}`,
    { stroke: '#555', strokeWidth: 1.5, roughness: 0.4 }
  )

  rc.circle(catX - faceR + 6, catY + 12, 7, {
    fill: '#ffb6c1',
    stroke: 'transparent',
    roughness: 0.3,
    fillWeight: 1.5,
  })
  rc.circle(catX + faceR - 6, catY + 12, 7, {
    fill: '#ffb6c1',
    stroke: 'transparent',
    roughness: 0.3,
    fillWeight: 1.5,
  })

  const bowX = catX + faceR + 18,
    bowY = catY - faceR - 4
  rc.path(`M ${bowX} ${bowY} L ${bowX - 10} ${bowY - 10} L ${bowX - 6} ${bowY} Z`, {
    fill: '#e74c3c',
    stroke: 'transparent',
    roughness: 0.3,
  })
  rc.path(`M ${bowX} ${bowY} L ${bowX + 10} ${bowY - 10} L ${bowX + 6} ${bowY} Z`, {
    fill: '#e74c3c',
    stroke: 'transparent',
    roughness: 0.3,
  })
  rc.circle(bowX, bowY, 4, {
    fill: '#c0392b',
    stroke: 'transparent',
    roughness: 0.2,
  })
  rc.path(
    `M ${bowX - 4} ${bowY + 2} Q ${bowX - 8} ${bowY + 12} ${bowX - 12} ${bowY + 18}`,
    { stroke: '#e74c3c', strokeWidth: 2, roughness: 0.4, fill: 'transparent' }
  )
  rc.path(
    `M ${bowX + 4} ${bowY + 2} Q ${bowX + 8} ${bowY + 12} ${bowX + 12} ${bowY + 18}`,
    { stroke: '#e74c3c', strokeWidth: 2, roughness: 0.4, fill: 'transparent' }
  )
}

const drawKid = (ctx, rc, frameIdx) => {
  const kidX = 200,
    kidY = 240
  const headR = 18
  const bodyH = 22,
    bodyW = 20

  const floatOffset = 3 * Math.sin(frameIdx * 0.4)
  const kidYFinal = kidY + floatOffset

  rc.ellipse(kidX, kidYFinal + 12, bodyW, bodyH, {
    fill: '#ffd700',
    stroke: '#b8860b',
    roughness: 0.6,
  })

  rc.circle(kidX, kidYFinal - 6, headR, {
    fill: '#fdebd0',
    stroke: '#d35400',
    roughness: 0.5,
  })

  rc.circle(kidX - 10, kidYFinal - 18, 6, {
    fill: '#5d4037',
    stroke: 'transparent',
    roughness: 0.5,
  })
  rc.circle(kidX + 10, kidYFinal - 18, 6, {
    fill: '#5d4037',
    stroke: 'transparent',
    roughness: 0.5,
  })
  rc.circle(kidX, kidYFinal - 22, 5, {
    fill: '#5d4037',
    stroke: 'transparent',
    roughness: 0.5,
  })

  rc.path(`M ${kidX - 6} ${kidYFinal - 8} L ${kidX - 2} ${kidYFinal - 8}`, {
    stroke: '#333',
    strokeWidth: 2,
    roughness: 0.3,
  })
  rc.path(`M ${kidX + 2} ${kidYFinal - 8} L ${kidX + 6} ${kidYFinal - 8}`, {
    stroke: '#333',
    strokeWidth: 2,
    roughness: 0.3,
  })

  rc.path(
    `M ${kidX - 5} ${kidYFinal - 1} Q ${kidX} ${kidYFinal + 4} ${kidX + 5} ${kidYFinal - 1}`,
    {
      stroke: '#333',
      strokeWidth: 1.5,
      roughness: 0.3,
      fill: 'transparent',
    }
  )

  rc.circle(kidX - 12, kidYFinal - 2, 4, {
    fill: '#ffb6c1',
    stroke: 'transparent',
    roughness: 0.3,
  })
  rc.circle(kidX + 12, kidYFinal - 2, 4, {
    fill: '#ffb6c1',
    stroke: 'transparent',
    roughness: 0.3,
  })

  const armLen = 16
  rc.path(
    `M ${kidX - 12} ${kidYFinal + 6} L ${kidX - 18 + 2 * Math.sin(frameIdx * 0.2)} ${kidYFinal + 18}`,
    {
      stroke: '#fdebd0',
      strokeWidth: 3,
      roughness: 0.4,
    }
  )
  const waveAngle = Math.PI / 4 + 0.3 * Math.sin(frameIdx * 0.5)
  const endX = kidX + 12 + armLen * Math.cos(waveAngle)
  const endY = kidYFinal + 6 - armLen * Math.sin(waveAngle)
  rc.path(`M ${kidX + 12} ${kidYFinal + 6} L ${endX} ${endY}`, {
    stroke: '#fdebd0',
    strokeWidth: 3,
    roughness: 0.4,
  })

  rc.path(`M ${kidX - 6} ${kidYFinal + 18} L ${kidX - 8} ${kidYFinal + 28}`, {
    stroke: '#fdebd0',
    strokeWidth: 3,
    roughness: 0.4,
  })
  rc.path(`M ${kidX + 6} ${kidYFinal + 18} L ${kidX + 8} ${kidYFinal + 28}`, {
    stroke: '#fdebd0',
    strokeWidth: 3,
    roughness: 0.4,
  })

  rc.circle(kidX - 8, kidYFinal + 28, 3, {
    fill: '#e74c3c',
    stroke: 'transparent',
    roughness: 0.3,
  })
  rc.circle(kidX + 8, kidYFinal + 28, 3, {
    fill: '#e74c3c',
    stroke: 'transparent',
    roughness: 0.3,
  })
}

const draw = (ctx, rc, frameIdx) => {
  const W = 400,
    H = 300

  drawSky(ctx, rc, W, H)
  drawGrass(ctx, rc, W, H)
  drawRainbow(ctx, rc, W, H)
  drawSun(ctx, rc, frameIdx)
  drawClouds(ctx, rc, frameIdx)
  drawStars(ctx, rc, frameIdx)
  drawFlowers(ctx, rc)
  drawKid(ctx, rc, frameIdx)
  drawCat(ctx, rc, frameIdx)
}

const preRenderFrames = (cw, ch, dpr) => {
  frames.value = Array.from({ length: FRAME_COUNT }, (_, i) => {
    const offscreen = new OffscreenCanvas(cw * dpr, ch * dpr);
    const offCtx = offscreen.getContext("2d");
    offCtx.scale(dpr, dpr);

    const rc = rough.canvas(offscreen);
    draw(offCtx, rc, i);
    return offscreen;
  });
};

onMounted(() => {
  loadRoughPromise.then((res) => {
    rough = res.default
    status.value = 'success'
    return nextTick()
  }).then(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const canvas = canvasRef.value;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const [cw, ch] = [canvas.width, canvas.height];
        ctx.scale(dpr, dpr);

        preRenderFrames(cw / dpr, ch / dpr, dpr);

        const loop = (t) => {
          rafId = requestAnimationFrame(loop);

          if (frames.value.length < FRAME_COUNT) return;
          if (t - lastDrawTime < FRAME_INTERVAL) return;

          lastDrawTime = t;
          ctx.clearRect(0, 0, cw, ch);
          ctx.drawImage(frames.value[frameIndex], 0, 0, cw, ch);
          frameIndex = (frameIndex + 1) % FRAME_COUNT;
        };

        rafId = requestAnimationFrame(loop);
        resolve()
      }, 0)
    })

  }).catch((err) => {
    status.value = 'error'
    alert(err.message)
  })
});

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<style scoped lang="scss">
.kawaii-canvas {
  width: 100%;
  height: 100%;
  background: #fffcf7;
}
</style>
