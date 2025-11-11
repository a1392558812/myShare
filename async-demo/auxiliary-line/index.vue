<template>
  <div class="app-container">
    <main class="main-content">
      <section class="control-panel">
        <div class="header-actions">
          <h2>辅助线设置</h2>
          <div class="add-layer-wrap">
            <button class="add-layer-btn" @click="openDialog({ overlayStyle: { zIndex: 1000 } })">查看源码</button>
          </div>
        </div>

        <div class="control-group">
          <div class="control-item">
            <div class="control-label">
              <span>纵向单位 (xUnit)</span>
              <span class="value-display">{{ xUnit }}px</span>
            </div>
            <input type="range" v-model.number="xUnit" min="5" max="100" step="5" class="range-control">
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>横向单位 ()</span>
              <span class="value-display">{{ yUnit }}px</span>
            </div>
            <input type="range" v-model.number="yUnit" min="5" max="100" step="5" class="range-control">
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>吸附距离</span>
              <span class="value-display">{{ adsorptionDistance }}px</span>
            </div>
            <input type="range" v-model.number="adsorptionDistance" min="1" max="100" step="1" class="range-control">
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>元素附近检测juli (nearbyThreshold)</span>
              <span class="value-display">{{ nearbyThreshold }}px</span>
            </div>
            <input type="number" v-model.number="nearbyThreshold" min="1" max="1000" step="1" class="number-control">
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>普通辅助线颜色</span>
              <span class="value-display">{{ hexToRgba(lineColor.color, lineColor.opacity) }}</span>
            </div>
            <div class="color-controls">
              <input type="color" v-model="lineColor.color" class="color-picker">
              <span style="flex-shrink: 0; width: 7em;">透明度：({{ lineColor.opacity }})</span>
              <input type="range" v-model.number="lineColor.opacity" :min="0" :max="1" step="0.01"
                class="range-control">
            </div>
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>普通辅助线寄货颜色</span>
              <span class="value-display">{{ hexToRgba(activeLineColor.color, activeLineColor.opacity) }}</span>
            </div>
            <div class="color-controls">
              <input type="color" v-model="activeLineColor.color" class="color-picker">
              <span style="flex-shrink: 0; width: 7em;">透明度：({{ activeLineColor.opacity }})</span>
              <input type="range" v-model.number="activeLineColor.opacity" :min="0" :max="1" step="0.01"
                class="range-control">
            </div>
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>特殊四边辅助线颜色</span>
              <span class="value-display">{{ hexToRgba(specialBorderLineColor.color, specialBorderLineColor.opacity)
              }}</span>
            </div>
            <div class="color-controls">
              <input type="color" v-model="specialBorderLineColor.color" class="color-picker">
              <span style="flex-shrink: 0; width: 7em;">透明度：({{ specialBorderLineColor.opacity }})</span>
              <input type="range" v-model.number="specialBorderLineColor.opacity" :min="0" :max="1" step="0.01"
                class="range-control">
            </div>
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>特殊中心辅助线颜色</span>
              <span class="value-display">{{ hexToRgba(specialCenterLineColor.color, specialCenterLineColor.opacity)
              }}</span>
            </div>
            <div class="color-controls">
              <input type="color" v-model="specialCenterLineColor.color" class="color-picker">
              <span style="flex-shrink: 0; width: 7em;">透明度：({{ specialCenterLineColor.opacity }})</span>
              <input type="range" v-model.number="specialCenterLineColor.opacity" :min="0" :max="1" step="0.01"
                class="range-control">
            </div>
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>是否启用普通辅助线功能</span>
              <span class="value-display">{{ showGuide }}</span>
            </div>
            <div class="button-group">
              <div class="button-item">
                <button type="button" class="add-button" @click="showGuide = !showGuide">切换showGuide-({{ showGuide
                }})</button>
              </div>
            </div>
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>是否启用特殊辅助线功能</span>
              <span class="value-display">{{ showSpecialGuide }}</span>
            </div>
            <div class="button-group">
              <div class="button-item">
                <button type="button" class="add-button"
                  @click="showSpecialGuide = !showSpecialGuide">切换showSpecialGuide-({{ showSpecialGuide
                  }})</button>
              </div>
            </div>
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>是否在发生覆盖时显示辅助线</span>
              <span class="value-display">{{ showOverlayGuide }}</span>
            </div>
            <div class="button-group">
              <div class="button-item">
                <button type="button" class="add-button"
                  @click="showOverlayGuide = !showOverlayGuide">切换showOverlayGuide-({{ showOverlayGuide
                  }})</button>
              </div>
            </div>
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>test拖拽组件</span>
            </div>
            <div class="control-label">
              <span>可拖拽添加，也可点击添加</span>
            </div>
            <div class="color-controls">
              <div class="button-group">
                <div class="button-item" v-for="(item, index) in componentList" :key="index">
                  <button type="button" :draggable="true" style="display: block; border: 1px solid #ccc;"
                    class="add-button" @click="addSlotItem({
                      name: item.name,
                      initialPosition: {
                        x: item.position.x,
                        y: item.position.y
                      }
                    })" @dragstart="handleButtonDragStart($event, item)">
                    <div>组件名：{{ item.name }}</div>
                    <div style="font-size: 12px;">点击添加时的初始位置（拖拽时按鼠标位置定位）：</div>
                    <div style="display: flex; align-items: center; justify-content: space-around; gap: 0.5em;">
                      <div>
                        <span style="margin: 0.5em;">x:</span>
                        <input style="width: auto;" class="number-control" :draggable="false" type="number" min="0"
                          max="9999" :value="item.position.x" @input="(e) => { computedInitialPosition(e, 'x', index) }"
                          @dragstart.stop.prevent="() => { }" @click.stop.prevent="() => { }" />
                      </div>
                      <div>
                        <span style="margin: 0.5em;">y:</span>
                        <input style="width: auto;" class="number-control" :draggable="false" type="number" min="0"
                          max="9999" :value="item.position.y" @input="(e) => { computedInitialPosition(e, 'y', index) }"
                          @dragstart.stop.prevent="() => { }" @click.stop.prevent="() => { }" />
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>辅助线宽度</span>
              <span class="value-display">{{ lineWidth }}px</span>
            </div>
            <input type="range" v-model.number="lineWidth" min="0.5" max="10" step="0.5" class="range-control">
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>slotList设置</span>
              <span class="value-display">当前组件个数：{{ slotList.length }}</span>
            </div>
            <div class="slot-controls">
              <div class="slot-item" v-for="(item, index) in slotList" :key="index">
                <div>
                  <span class="slot-id">id:</span>
                  <span class="slot-value">{{ item.id }}</span>
                </div>
                <div class="z-index-control">
                  <span>z-index:</span>
                  <input style="width: auto; flex: 1;" type="number" v-model.number="item.zIndex" min="1" max="9999"
                    step="1" class="number-control">
                  <span>/</span>
                  <button style="width: auto" type="button" class="add-button"
                    @click="removeSlotItem(index)">删除该组件</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="status-info">
          <h3>操作状态</h3>
          <div class="status-item">
            <span>最后移动位置：</span>
            <span class="status-value">({{ lastPosition.x }}, {{ lastPosition.y }})</span>
          </div>
          <div class="status-item">
            <span>吸附位置：</span>
            <span class="status-value">({{ lastAdsorption.x }}, {{ lastAdsorption.y }})</span>
          </div>
        </div>
      </section>

      <section class="preview-panel">
        <h3>预览区域</h3>
        <div class="preview-container">
          <AuxiliaryLine :x-unit="xUnit" :slotItems="slotList" :y-unit="yUnit" :showSpecialGuide="showSpecialGuide"
            :line-color="hexToRgba(lineColor.color, lineColor.opacity)"
            :activeLineColor="hexToRgba(activeLineColor.color, activeLineColor.opacity)"
            :specialBorderLineColor="hexToRgba(specialBorderLineColor.color, specialBorderLineColor.opacity)"
            :specialCenterLineColor="hexToRgba(specialCenterLineColor.color, specialCenterLineColor.opacity)"
            :showGuide="showGuide" :show-overlay-guide="showOverlayGuide" :line-width="lineWidth"
            :nearby-threshold="nearbyThreshold" :adsorption-distance="adsorptionDistance" @dragStart="dragStart"
            @dragMove="dragMove" @dragEnd="dragEnd" @add-slot-item="handleItemDropped"
            @nearby-slot-detected="handleNearbySlotDetected" @slot-overlapped="handleSlotOverlapped">
            <template v-for="(slotItem, index) in slotList" :key="index" #[`${slotItem.name}-${index}`]="{ elementId }">
              <component :is="slotItem.name" :elementId="elementId"></component>
            </template>
          </AuxiliaryLine>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="jsx">
import { ref, nextTick } from 'vue';
import AuxiliaryLine from './components/index.vue';
import baseConfig, { toastFun } from '../static/hooks/extends.js';
import { slotCom1, slotCom2, slotCom3, slotCom4 } from './components/test.js';

defineOptions({
  name: 'AuxiliaryLineDemo',
  extends: baseConfig({
    toast: import('../components/toast/index.vue'),
    customDialog: import('../components/dialog/index.vue')
  }),
  components: {
    slotCom1,
    slotCom2,
    slotCom3,
    slotCom4,
  }
})

const toastContentStyle = {
  overflow: 'auto',
  whiteSpace: 'normal',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  wordBreak: 'break-all',
}

const hexToRgba = (hexColor, alpha = 1) => {
  const hexRegex = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  const match = hexColor.match(hexRegex);
  if (!match) {
    throw new Error('无效的 hex 颜色格式，请使用 3位或6位十六进制');
  }
  let hex = match[1].toLowerCase();
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  let r = parseInt(hex.substring(0, 2), 16);
  r = r > 255 ? 255 : r;
  r = r < 0 ? 0 : r;

  let g = parseInt(hex.substring(2, 4), 16);
  g = g > 255 ? 255 : g;
  g = g < 0 ? 0 : g;

  let b = parseInt(hex.substring(4, 6), 16);
  b = b > 255 ? 255 : b;
  b = b < 0 ? 0 : b;

  alpha = alpha > 1 ? 1 : alpha;
  alpha = alpha < 0 ? 0 : alpha;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const xUnit = ref(20);
const yUnit = ref(20);

const lineColor = ref({
  color: '#c8c8c8',
  opacity: 0.8
});
const activeLineColor = ref({
  color: '#4F46E5',
  opacity: 0.8
});
const specialBorderLineColor = ref({
  color: '#f4a3b0',
  opacity: 0.8
});
const specialCenterLineColor = ref({
  color: '#a3f4b0',
  opacity: 0.8
});
const lineWidth = ref(1);
const showOverlayGuide = ref(true);
const showGuide = ref(true);
const showSpecialGuide = ref(true);
const nearbyThreshold = ref(10);
const adsorptionDistance = ref(5);
const lastPosition = ref({ x: 0, y: 0 });
const lastAdsorption = ref({ x: 0, y: 0 });

const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
const componentList = ref([
  { name: 'slotCom1', position: { x: 0, y: 0 } },
  { name: 'slotCom2', position: { x: 0, y: 0 } },
  { name: 'slotCom3', position: { x: 0, y: 0 } },
  { name: 'slotCom4', position: { x: 0, y: 0 } },
])
const slotList = ref([
  { name: 'slotCom1', id: uuid(), initialPosition: { x: 0, y: 0 }, zIndex: 1 },
]);


const computedInitialPosition = (e, key, index) => {
  let val = Number(e.target.value)
  console.log('e', e, e.target.value, val);
  if (val <= 0) {
    val = 0
  } else if (x > 9999) {
    val = 9999
  }
  nextTick(() => {
    e.target.value = val;
    componentList.value[index].position[key] = val;
  })
}
const addSlotItem = (row) => {
  const newItem = {
    name: row.name,
    id: uuid(),
    initialPosition: row.initialPosition,
    zIndex: row.zIndex || 1
  }
  slotList.value.push(newItem);
  toastFun.open({
    message: `新项已添加到画布:${JSON.stringify(newItem)}`,
    contentStyle: toastContentStyle
  });
}
const removeSlotItem = (index) => {
  slotList.value.splice(index, 1);
  toastFun.open({
    message: `已删除索引为 ${index} 的插槽项`,
    contentStyle: toastContentStyle
  });
}
const handleButtonDragStart = (event, row) => {
  event.dataTransfer.setData('text/plain', JSON.stringify({
    name: row.name,
    type: 'slotItem'
  }));
  event.dataTransfer.effectAllowed = 'copy';
}
const handleItemDropped = (droppedData) => {
  console.log('droppedData', droppedData);
  if (droppedData.type === 'slotItem') {
    addSlotItem({
      name: droppedData.name,
      initialPosition: droppedData.dropPosition || { x: 40, y: 40 }
    });
  }
}
const dragStart = (event) => {
  toastFun.open({
    message: `鼠标按下:${JSON.stringify(event)}`,
    contentStyle: toastContentStyle
  });
}
const dragMove = (event) => {
  lastPosition.value = { x: event.x, y: event.y };
  lastAdsorption.value = { x: event.adsorptionX || 0, y: event.adsorptionY || 0 };
  toastFun.open({
    message: `鼠标移动:${JSON.stringify(event)}`,
    contentStyle: toastContentStyle
  });
}
const dragEnd = (event) => {
  lastPosition.value = { x: event.x, y: event.y };
  lastAdsorption.value = { x: event.adsorptionX || 0, y: event.adsorptionY || 0 };
  toastFun.open({
    message: `鼠标移动松开，最终位置:${JSON.stringify(event)}`,
    contentStyle: toastContentStyle
  });
}
const handleNearbySlotDetected = (event) => {
  toastFun.open({
    message: `检测到附近插槽:${JSON.stringify(event)}`,
    contentStyle: toastContentStyle
  });
}
const handleSlotOverlapped = (event) => {
  toastFun.open({
    message: `插槽重叠力:${JSON.stringify(event)}`,
    contentStyle: toastContentStyle
  });
}
</script>

<style lang="scss" scoped>
@use './async-demo/static/scss/theme.scss';

.app-container {
  padding: $spacing-md;
  background-color: $light-gray;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;

  .main-content {
    width: calc(100vw - $spacing-md * 2);
    height: calc(100vh - $spacing-md * 2);
    display: flex;
    gap: $spacing-lg;

    .control-panel {
      @include control-shared;
      width: 320px;
      flex-shrink: 0;
      overflow: auto;
      padding: $spacing-md;
      box-shadow: $shadow-light;
      background-color: white;
      border-radius: $border-radius;
      height: calc(100% - $spacing-md * 2);

      .header-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: $spacing-md;

        h2 {
          color: $dark-gray;
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }

        .add-layer-wrap {
          display: flex;
          gap: $spacing-md;
          align-items: center;
          justify-content: center;

          .add-layer-btn {
            @include button-shared;
            background-color: $primary-color;
            color: white;
            gap: $spacing-xs;

            &:hover {
              background-color: darken($primary-color, 10%);
            }
          }
        }
      }

      .control-group {
        display: flex;
        flex-direction: column;
        gap: $spacing-md;
        margin-bottom: $spacing-lg;

        .control-item {
          .control-label {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: $spacing-xs;
            font-size: 14px;
            color: $secondary-color;

            .value-display {
              flex-shrink: 0;
              color: $primary-color;
              font-family: monospace;
              font-size: 12px;
            }
          }

          .number-control {
            width: calc(100% - $spacing-sm * 2);
            padding: $spacing-xs $spacing-sm;
            border: 1px solid $medium-gray;
            border-radius: $border-radius;
            font-size: 14px;

            &:focus {
              outline: none;
              border-color: $primary-color;
            }
          }

          .range-control {
            width: 100%;
            height: 6px;
            border-radius: 3px;
            background: $medium-gray;
            outline: none;
            appearance: none;

            &::-webkit-slider-thumb {
              appearance: none;
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: $primary-color;
              cursor: pointer;
              box-shadow: $shadow-light;
            }

            &::-moz-range-thumb {
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: $primary-color;
              cursor: pointer;
              border: none;
              box-shadow: $shadow-light;
            }
          }

          .color-controls {
            display: flex;
            gap: $spacing-sm;
            align-items: center;

            .color-picker {
              flex-shrink: 0;
              width: 40px;
              height: 40px;
              border: 1px solid $medium-gray;
              border-radius: $border-radius;
              cursor: pointer;
            }

            .color-input {
              flex: 1;
              padding: $spacing-xs $spacing-sm;
              border: 1px solid $medium-gray;
              border-radius: $border-radius;
              font-size: 14px;
            }
          }

          .button-group {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            flex-direction: column;
            gap: $spacing-sm;

            .button-item {
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: flex-start;
              gap: $spacing-sm;
            }
          }

          .add-button {
            width: 100%;
            @include button-shared;
            position: relative;
            background-color: $light-gray;
            color: $dark-gray;

            &:hover {
              background-color: $medium-gray;
            }
          }

          .slot-controls {
            display: flex;
            flex-direction: column;
            gap: $spacing-sm;

            .slot-item {
              display: flex;
              flex-direction: column;
              gap: $spacing-xs;

              .z-index-control {
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: $spacing-sm;
              }

              .slot-id {
                font-size: 14px;
                font-weight: 500;
                margin-right: $spacing-sm;
              }

              .slot-value {
                font-size: 12px;
                font-weight: 400;
              }
            }
          }
        }
      }

      .status-info {
        margin-top: $spacing-lg;
        padding-top: $spacing-lg;
        border-top: 1px solid $light-gray;

        h3 {
          margin: 0 0 $spacing-md 0;
          font-size: 16px;
          color: $dark-gray;
        }

        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: $spacing-xs 0;
          font-size: 14px;
          color: $secondary-color;

          .status-value {
            color: $primary-color;
            font-weight: 600;
          }
        }
      }
    }

    .preview-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: $spacing-md;

      h3 {
        margin: 0;
        color: $dark-gray;
        font-size: 20px;
        font-weight: 600;
      }

      .preview-container {
        flex: 1;
        padding: $spacing-lg;
        background-color: white;
        border-radius: $border-radius;
        box-shadow: $shadow-light;

        :deep(.demo-content) {
          .demo-box {
            user-select: none;
            width: calc(100% - $spacing-lg * 2 - 2px * 2);
            height: calc(100% - $spacing-lg * 2 - 2px * 2);
            background-color: white;
            border: 2px solid rgba(19, 80, 129, 0.8);
            border-radius: $border-radius;
            padding: $spacing-lg;
            text-align: center;
            box-shadow: $shadow-medium;
            overflow: auto;

            p {
              margin: $spacing-xs 0;
              color: $secondary-color;
              font-size: 13px;
            }
          }
        }
      }
    }
  }
}

@mixin control-shared {
  & {
    background-color: white;
    border-radius: $border-radius;
  }
}
</style>