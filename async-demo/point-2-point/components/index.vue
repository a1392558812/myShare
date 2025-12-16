<template>
  <div class="path-drawing-component">
    <canvas ref="canvasRef" :width="width" :height="height" @mousedown="handleMouseDown" @mousemove="handleMouseMove"
      @mouseup="handleMouseUp" @mouseleave="handleMouseUp" @wheel="handleWheel" class="path-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
const props = defineProps({
  width: {
    type: Number,
    default: 800
  },
  height: {
    type: Number,
    default: 600
  },
  paths: {
    type: Array,
    default: () => []
  },
  showGrid: {
    type: Boolean,
    default: true
  },
  selectedPathIndex: {
    type: Number,
    default: 0
  }
})
const emit = defineEmits([
  'pathUpdate',
  'pathSelect',
  'controlPointUpdate',
  'canvasClick'
])
const canvasRef = ref()
const isDragging = ref(false)
const dragTarget = ref(null)
const canvasOffset = ref({ x: 0, y: 0 })
const canvasScale = ref(1)
const animationProgress = ref(0)
const animationFrameId = ref(null)
const catmullRomSpline = (t, p0, p1, p2, p3, tension = 0.5) => {
  const t2 = t * t
  const t3 = t2 * t
  const x = tension * (
    (2 * p1.x) +
    (-p0.x + p2.x) * t +
    (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
    (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
  )
  const y = tension * (
    (2 * p1.y) +
    (-p0.y + p2.y) * t +
    (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
    (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
  )
  return { x, y }
}
const drawGrid = (ctx) => {
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
  ctx.lineWidth = 1
  const gridSize = 20
  const width = props.width
  const height = props.height
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
  ctx.font = '14px Arial'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  const labelInterval = 2
  ctx.textBaseline = 'top'
  for (let x = gridSize * labelInterval; x <= width; x += gridSize * labelInterval) {
    const actualX = (x - canvasOffset.value.x) / canvasScale.value
    const label = `${Math.round(actualX)}`
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.fillRect(x - 15, 2, 30, 18)

    ctx.fillStyle = '#333'
    ctx.textAlign = 'center'
    ctx.fillText(label, x, 4)

    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, 6)
    ctx.stroke()
  }

  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  for (let y = gridSize * labelInterval; y <= height; y += gridSize * labelInterval) {
    const actualY = (y - canvasOffset.value.y) / canvasScale.value
    const label = `${Math.round(actualY)}`

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.fillRect(2, y - 9, 30, 18)

    ctx.fillStyle = '#333'
    ctx.fillText(label, 4, y)

    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(6, y)
    ctx.stroke()
  }

  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.restore()
}
const drawPath = (ctx, path, index) => {
  if (!path.start || !path.end) return
  ctx.strokeStyle = path.color || 'rgba(59, 130, 246, 0.5)'
  ctx.lineWidth = path.lineWidth || 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (index === props.selectedPathIndex) {
    ctx.shadowColor = path.color || 'rgba(59, 130, 246, 0.5)'
    ctx.shadowBlur = 10
  }
  ctx.beginPath()
  ctx.moveTo(path.start.x, path.start.y)
  switch (path.curveType) {
    case 'linear': {
      ctx.lineTo(path.end.x, path.end.y)
      break
    }
    case 'quadratic':
      if (path.controlPoints && path.controlPoints.length >= 1) {
        const cp = path.controlPoints[0]
        ctx.quadraticCurveTo(cp.x, cp.y, path.end.x, path.end.y)
      } else {
        ctx.lineTo(path.end.x, path.end.y)
      }
      break
    case 'cubic':
      if (path.controlPoints && path.controlPoints.length >= 2) {
        const cp1 = path.controlPoints[0]
        const cp2 = path.controlPoints[1]
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, path.end.x, path.end.y)
      } else {
        ctx.lineTo(path.end.x, path.end.y)
      }
      break
    case 'catmull-rom':
      if (path.controlPoints && path.controlPoints.length >= 1) {
        const points = [path.start, ...path.controlPoints, path.end]
        for (let i = 1; i < points.length - 2; i++) {
          const p0 = points[i - 1]
          const p1 = points[i]
          const p2 = points[i + 1]
          const p3 = points[i + 2]
          for (let t = 0; t < 1; t += 0.05) {
            const point = catmullRomSpline(t, p0, p1, p2, p3, path.tension)
            ctx.lineTo(point.x, point.y)
          }
        }
        if (points.length >= 3) {
          const p0 = points[points.length - 3]
          const p1 = points[points.length - 2]
          const p2 = points[points.length - 1]
          const p3 = points[points.length - 1]
          for (let t = 0; t <= 1; t += 0.05) {
            const point = catmullRomSpline(t, p0, p1, p2, p3, path.tension)
            ctx.lineTo(point.x, point.y)
          }
        }
      } else {
        ctx.lineTo(path.end.x, path.end.y)
      }
      break
    default:
      ctx.lineTo(path.end.x, path.end.y)
  }
  ctx.stroke()
  ctx.shadowBlur = 0
}
const getPointAtProgress = (path, progress) => {
  if (!path.start || !path.end) return { x: 0, y: 0 }
  const t = progress
  switch (path.curveType) {
    case 'linear': {
      return {
        x: path.start.x + (path.end.x - path.start.x) * t,
        y: path.start.y + (path.end.y - path.start.y) * t
      }
    }
    case 'quadratic':
      if (path.controlPoints && path.controlPoints.length >= 1) {
        const cp = path.controlPoints[0]
        return {
          x: (1 - t) * (1 - t) * path.start.x + 2 * (1 - t) * t * cp.x + t * t * path.end.x,
          y: (1 - t) * (1 - t) * path.start.y + 2 * (1 - t) * t * cp.y + t * t * path.end.y
        }
      }
      break
    case 'cubic':
      if (path.controlPoints && path.controlPoints.length >= 2) {
        const cp1 = path.controlPoints[0]
        const cp2 = path.controlPoints[1]
        return {
          x: (1 - t) * (1 - t) * (1 - t) * path.start.x + 3 * (1 - t) * (1 - t) * t * cp1.x + 3 * (1 - t) * t * t * cp2.x + t * t * t * path.end.x,
          y: (1 - t) * (1 - t) * (1 - t) * path.start.y + 3 * (1 - t) * (1 - t) * t * cp1.y + 3 * (1 - t) * t * t * cp2.y + t * t * t * path.end.y
        }
      }
      break
    case 'catmull-rom':
      if (path.controlPoints && path.controlPoints.length >= 1) {
        const points = [path.start, ...path.controlPoints, path.end]
        const totalSegments = points.length - 1
        const segmentIndex = Math.min(Math.floor(t * totalSegments), totalSegments - 1)
        const segmentProgress = Math.max(0, (t * totalSegments) % 1)

        if (points.length >= 4 && segmentIndex < points.length - 2) {
          const p0 = points[Math.max(0, segmentIndex - 1)]
          const p1 = points[segmentIndex]
          const p2 = points[segmentIndex + 1]
          const p3 = points[Math.min(points.length - 1, segmentIndex + 2)]
          return catmullRomSpline(segmentProgress, p0, p1, p2, p3, path.tension)
        } else if (segmentIndex === points.length - 2) {
          const p0 = points[points.length - 3]
          const p1 = points[points.length - 2]
          const p2 = points[points.length - 1]
          const p3 = points[points.length - 1]
          return catmullRomSpline(segmentProgress, p0, p1, p2, p3, path.tension)
        }
      }
      break
  }
  return {
    x: path.start.x + (path.end.x - path.start.x) * t,
    y: path.start.y + (path.end.y - path.start.y) * t
  }
}
const drawAnimatedBall = (ctx, path) => {
  if (!path.showAnimation || !path.start || !path.end) return
  const ballPosition = getPointAtProgress(path, animationProgress.value)
  ctx.beginPath()
  ctx.arc(ballPosition.x, ballPosition.y, 6, 0, Math.PI * 2)
  ctx.fillStyle = '#ff6b6b'
  ctx.shadowColor = '#ff6b6b'
  ctx.shadowBlur = 10
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.beginPath()
  ctx.arc(ballPosition.x, ballPosition.y, 8, 0, Math.PI * 2)
  ctx.strokeStyle = '#fff'
  ctx.shadowBlur = 10
  ctx.lineWidth = 2
  ctx.stroke()
}
const animate = () => {
  const selectedPath = props.paths[props.selectedPathIndex]
  const pathAnimationSpeed = selectedPath?.animationSpeed ?? 1
  const speedFactor = 0.005 * pathAnimationSpeed
  animationProgress.value += speedFactor
  if (animationProgress.value >= 1) {
    animationProgress.value = 0
  }
  render()
  animationFrameId.value = requestAnimationFrame(animate)
}
const startAnimation = () => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
  animate()
}
const stopAnimation = () => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
    animationFrameId.value = null
  }
}
const drawControlPoints = (ctx, path, index) => {
  if (!path.showControlPoints || index !== props.selectedPathIndex) return
  if (!path.controlPoints) return
  if (path.showControlLines) {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(path.start.x, path.start.y)
    path.controlPoints.forEach(cp => {
      ctx.lineTo(cp.x, cp.y)
    })
    ctx.lineTo(path.end.x, path.end.y)
    ctx.stroke()
    ctx.setLineDash([])
  }
  const drawPoint = (point, label, isHovered = false) => {
    ctx.beginPath()
    ctx.arc(point.x, point.y, isHovered ? 12 : 10, 0, Math.PI * 2)
    ctx.fillStyle = isHovered ? '#ff6b6b' : '#333'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#fff'
    ctx.font = '12px Arial'
    ctx.lineHeight = `${isHovered ? 12 : 10}px`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, point.x, point.y)
  }
  drawPoint(path.start, 'S')
  path.controlPoints.forEach((cp, index) => {
    drawPoint(cp, `C${index + 1}`)
  })
  drawPoint(path.end, 'E')
}
const render = () => {
  if (!canvasRef.value) return
  const ctx = canvasRef.value.getContext('2d')
  ctx.clearRect(0, 0, props.width, props.height)
  ctx.save()
  ctx.translate(canvasOffset.value.x, canvasOffset.value.y)
  ctx.scale(canvasScale.value, canvasScale.value)
  if (props.showGrid) {
    drawGrid(ctx)
  }
  props.paths.forEach((path, index) => {
    if (path.visible !== false) {
      drawPath(ctx, path, index)
      drawControlPoints(ctx, path, index)
    }
  })
  if (props.selectedPathIndex >= 0 && props.selectedPathIndex < props.paths.length) {
    const selectedPath = props.paths[props.selectedPathIndex]
    if (selectedPath.visible !== false) {
      drawAnimatedBall(ctx, selectedPath)
    }
  }
  ctx.restore()
}
const getMousePos = (e) => {
  const rect = canvasRef.value.getBoundingClientRect()
  return {
    x: (e.clientX - rect.left - canvasOffset.value.x) / canvasScale.value,
    y: (e.clientY - rect.top - canvasOffset.value.y) / canvasScale.value
  }
}
const getNearestPoint = (pos, path) => {
  if (!path.controlPoints) return -1
  const allPoints = [path.start, ...path.controlPoints, path.end]
  let minDistance = Infinity
  let nearestIndex = -1
  allPoints.forEach((point, index) => {
    const distance = Math.sqrt(
      Math.pow(point.x - pos.x, 2) + Math.pow(point.y - pos.y, 2)
    )
    if (distance < minDistance && distance < 15) {
      minDistance = distance
      nearestIndex = index
    }
  })
  return nearestIndex
}

const handleMouseDown = (e) => {
  const pos = getMousePos(e)
  if (e.button === 0 && props.selectedPathIndex >= 0) {
    const path = props.paths[props.selectedPathIndex]
    if (!path.enableInteraction) return
    const nearestIndex = getNearestPoint(pos, path)
    if (nearestIndex !== -1) {
      isDragging.value = true
      dragTarget.value = {
        pathIndex: props.selectedPathIndex,
        pointIndex: nearestIndex
      }
      canvasRef.value.style.cursor = 'grabbing'
    }
  }
}

const handleMouseMove = (e) => {
  if (isDragging.value && dragTarget.value) {
    const pos = getMousePos(e)
    const path = props.paths[dragTarget.value.pathIndex]
    if (!path.enableInteraction) return
    let updatedPoint = null
    if (dragTarget.value.pointIndex === 0) {
      path.start = pos
      updatedPoint = { type: 'start', point: pos }
    } else if (dragTarget.value.pointIndex === path.controlPoints.length + 1) {
      path.end = pos
      updatedPoint = { type: 'end', point: pos }
    } else {
      path.controlPoints[dragTarget.value.pointIndex - 1] = pos
      updatedPoint = {
        type: 'control',
        index: dragTarget.value.pointIndex - 1,
        point: pos
      }
    }
    emit('controlPointUpdate', {
      pathIndex: dragTarget.value.pathIndex,
      updatedPoint
    })
    render()
  } else if (props.selectedPathIndex >= 0) {
    const pos = getMousePos(e)
    const path = props.paths[props.selectedPathIndex]
    if (path.enableInteraction) {
      const nearestIndex = getNearestPoint(pos, path)
      canvasRef.value.style.cursor = nearestIndex !== -1 ? 'grab' : 'default'
    } else {
      canvasRef.value.style.cursor = 'default'
    }
  }
}

const handleMouseUp = () => {
  if (isDragging.value) {
    emit('pathUpdate', {
      pathIndex: dragTarget.value.pathIndex,
      path: props.paths[dragTarget.value.pathIndex]
    })
  }
  isDragging.value = false
  dragTarget.value = null
  canvasRef.value.style.cursor = 'default'
}

const handleWheel = (e) => {
  e.preventDefault()
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  const newScale = canvasScale.value * delta
  if (newScale >= 0.1 && newScale <= 5) {
    canvasScale.value = newScale
    render()
  }
}

const setScale = (scale) => {
  if (scale >= 0.1 && scale <= 5) {
    canvasScale.value = scale
    render()
  }
}

const setOffset = (offset) => {
  canvasOffset.value = { ...offset }
  render()
}

const resetView = () => {
  canvasOffset.value = { x: 0, y: 0 }
  canvasScale.value = 1
  render()
}

watch(() => [
  props.paths,
  props.selectedPathIndex,
  props.showGrid
], () => {
  render()
}, { deep: true })

watch(() => props.paths, () => {
  const hasActiveAnimation = props.paths.some(path => path.showAnimation)
  if (hasActiveAnimation && !animationFrameId.value) {
    startAnimation()
  } else if (!hasActiveAnimation && animationFrameId.value) {
    stopAnimation()
    animationProgress.value = 0
    render()
  }
}, { deep: true })

onMounted(() => {
  render()
  const hasActiveAnimation = props.paths.some(path => path.showAnimation)
  if (hasActiveAnimation) {
    startAnimation()
  }
})
onUnmounted(() => {
  stopAnimation()
})

defineExpose({
  render,
  setScale,
  setOffset,
  resetView
})
</script>

<style scoped lang="scss">
.path-drawing-component {
  display: inline-block;

  .path-canvas {
    display: block;
    cursor: grab;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;

    &:active {
      cursor: grabbing;
    }

    &:focus {
      outline: 2px solid #007bff;
      outline-offset: 2px;
    }
  }
}
</style>