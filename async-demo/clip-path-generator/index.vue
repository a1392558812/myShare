<template>
  <appContainer>
    <layoutCom style="width: 400px;" title="不规则图形生成器" type="panel"
      :addLayerBtnList="[{ label: '显示源码', callback: () => openDialog({ overlayStyle: { zIndex: 1000 } }) }]">
      <control-item label="操作说明">
        <div class="instructions">
          <p v-for="value in [
            '• 拖拽顶点改变图形形状',
            '• 点击边中间添加新顶点',
            '• 双击顶点删除顶点',
          ]" :key="value">{{ value }}</p>
        </div>
      </control-item>

      <control-item label="图形类型">
        <selectCom :options="shapeTypes" v-model="selectedShape" @update:modelValue="resetShape" />
      </control-item>

      <control-item label="填充颜色">
        <input type="color" v-model="fillColor" />
      </control-item>

      <control-item v-for="(point, index) in points" :key="`point-${index}`" :label="`顶点 ${index + 1}:`">
        <div style="display: flex; gap: 10px;">
          <div style="flex: 1; display: flex; gap: 5px; align-items: center; justify-content: center"
            v-for="(keyItem, keyIndex) in ['x', 'y']">
            <span>{{ keyItem }}:</span>
            <inputCom type="number" :modelValue="point[keyItem]"
              @update:modelValue="(value) => points[index][keyItem] = Number(value)" />
          </div>
        </div>
      </control-item>

      <custom-btn-com @click="resetShape">重置图形</custom-btn-com>
    </layoutCom>

    <layoutCom style="min-width: 800px;" title="预览" type="preview">
      <template #preview>
        <div class="preview-area">
          <div class="shape-container-wrap">
            <div class="shape-container" ref="shapeContainer">
              <div class="editable-shape" :style="shapeStyle"></div>

              <div v-for="(point, index) in points" :key="index" class="vertex" :style="getVertexStyle(point, index)"
                @mousedown="startDrag(index, $event)" @dblclick="removeVertex(index)">{{ index + 1 }}</div>
              <div v-for="(edge, index) in edges" :key="`edge-${index}`" class="edge" :style="getEdgeStyle(edge)"
                @click="addVertexOnEdge(index)"></div>
            </div>
          </div>
        </div>
      </template>

      <template #code>
        <codeCopyContent :code="clipPathCode" title="Clip Path 代码" />
      </template>
    </layoutCom>
  </appContainer>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

import {
  inputCom,
  selectCom,
  controlItem,
  customBtnCom,
  layoutCom,
  appContainer,
  codeCopyContent
} from '../components/form-control/index.vue';

import baseConfig from '../static/hooks/extends.js'
defineOptions({
  extends: baseConfig({
    customDialog: import('../components/dialog/index.vue'),
  }),
})

const shapeTypes = [
  { label: '三角形', value: 'triangle' },
  { label: '四边形', value: 'quadrilateral' },
  { label: '五边形', value: 'pentagon' },
  { label: '六边形', value: 'hexagon' },
  { label: '自定义', value: 'custom' }
];

const selectedShape = ref('triangle');
const points = ref([]);
const fillColor = ref('#3b82f6');
const isDragging = ref(false);
const currentVertexIndex = ref(null);
const shapeContainer = ref(null);

const initializeShape = (type) => {
  if (!shapeContainer.value) return;

  const width = shapeContainer.value.offsetWidth;
  const height = shapeContainer.value.offsetHeight;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;

  switch (type) {
    case 'triangle':
      points.value = [
        { x: centerX, y: centerY - radius },
        { x: centerX - radius * Math.cos(Math.PI / 6), y: centerY + radius * Math.sin(Math.PI / 6) },
        { x: centerX + radius * Math.cos(Math.PI / 6), y: centerY + radius * Math.sin(Math.PI / 6) }
      ];
      break;
    case 'quadrilateral':
      points.value = [
        { x: centerX - radius, y: centerY - radius },
        { x: centerX + radius, y: centerY - radius },
        { x: centerX + radius, y: centerY + radius },
        { x: centerX - radius, y: centerY + radius }
      ];
      break;
    case 'pentagon':
      points.value = Array.from({ length: 5 }, (_, i) => ({
        x: centerX + radius * Math.cos((i * 2 * Math.PI) / 5 - Math.PI / 2),
        y: centerY + radius * Math.sin((i * 2 * Math.PI) / 5 - Math.PI / 2)
      }));
      break;
    case 'hexagon':
      points.value = Array.from({ length: 6 }, (_, i) => ({
        x: centerX + radius * Math.cos((i * 2 * Math.PI) / 6 - Math.PI / 2),
        y: centerY + radius * Math.sin((i * 2 * Math.PI) / 6 - Math.PI / 2)
      }));
      break;
    default:
      points.value = [
        { x: centerX - radius, y: centerY - radius },
        { x: centerX + radius, y: centerY - radius },
        { x: centerX + radius, y: centerY + radius },
        { x: centerX - radius, y: centerY + radius }
      ];
  }
};

const resetShape = () => {
  initializeShape(selectedShape.value);
};

const edges = computed(() => {
  const result = [];
  for (let i = 0; i < points.value.length; i++) {
    const nextIndex = (i + 1) % points.value.length;
    result.push({
      start: points.value[i],
      end: points.value[nextIndex]
    });
  }
  return result;
});

const clipPathCode = computed(() => {
  const path = points.value.map(point => `${point.x}px ${point.y}px`).join(', ');
  return `width: ${shapeContainer.value ? shapeContainer.value.offsetWidth + 'px' : '100%'};
height: 600px;
clip-path: polygon(${path});`;
});

const shapeStyle = computed(() => ({
  width: '100%',
  height: '100%',
  backgroundColor: fillColor.value,
  clipPath: `polygon(${points.value.map(point => `${point.x}px ${point.y}px`).join(', ')})`,
  transform: 'translateZ(0)',
  willChange: isDragging.value ? 'clip-path' : 'auto',
  position: 'relative',
  margin: '0 auto'
}));

const getVertexStyle = (point, index) => ({
  position: 'absolute',
  width: '10px',
  height: '10px',
  backgroundColor: '#ffffff',
  border: '2px solid #333333',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '8px',
  cursor: 'move',
  willChange: (isDragging.value && currentVertexIndex.value === index) ? 'transform' : 'auto',
  transform: `translate3d(${point.x - 5}px, ${point.y - 5}px, 0)`,
  left: 0,
  top: 0,
  zIndex: 10
});

const getEdgeStyle = (edge) => {
  const dx = edge.end.x - edge.start.x;
  const dy = edge.end.y - edge.start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  return {
    position: 'absolute',
    width: `${length}px`,
    height: '10px',
    left: `0`,
    top: `0`,
    transformOrigin: '0 5px',
    transform: `translate3d(${edge.start.x}px, ${edge.start.y - 5}px, 0) rotate(${angle}deg)`,
    willChange: isDragging.value ? 'width transform' : 'auto',
    cursor: 'crosshair',
    zIndex: 5,
    opacity: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0)'
  };
};

const startDrag = (index, event) => {
  isDragging.value = true;
  currentVertexIndex.value = index;
  event.preventDefault();
};

const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

const handleMouseMove = throttle((event) => {
  if (!isDragging.value || currentVertexIndex.value === null) return;
  if (shapeContainer.value) {
    const rect = shapeContainer.value.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    points.value[currentVertexIndex.value].x = x
    points.value[currentVertexIndex.value].y = y
  }
}, 16);

const handleMouseUp = () => {
  isDragging.value = false;
  currentVertexIndex.value = null;
};

const addVertexOnEdge = (edgeIndex) => {
  const edge = edges.value[edgeIndex];
  const newPoint = {
    x: (edge.start.x + edge.end.x) / 2,
    y: (edge.start.y + edge.end.y) / 2
  };

  points.value.splice(edgeIndex + 1, 0, newPoint);
};

const removeVertex = (index) => {
  if (points.value.length > 3) {
    points.value.splice(index, 1);
  }
};


onMounted(() => {
  initializeShape(selectedShape.value);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  window.removeEventListener('resize', handleResize);
});

const handleResize = () => {
  initializeShape(selectedShape.value);
};
</script>

<style scoped lang="scss">
.preview-area {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  overflow: hidden;

  .shape-container-wrap {
    position: relative;
    width: 100%;
    height: 600px;
    background-color: #e5e7eb;
    overflow: hidden;

    .shape-container {
      width: 100%;
      height: 100%;
      transform: translateZ(0);

      .editable-shape {
        transition: all 0.2s ease;
      }

      .vertex {
        transition: all 0.2s ease;

        &:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
        }
      }

      .edge {
        transition: all 0.2s ease;

        &:hover {
          background-color: rgba(59, 130, 246, 0.5);
          opacity: 0.8;
        }
      }
    }
  }
}

.instructions {
  font-size: 14px;
  line-height: 1.5;
  color: #666;
}

input[type="color"] {
  width: 100%;
  height: 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>