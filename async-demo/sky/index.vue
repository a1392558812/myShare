<template>
  <div class="kawaii-container">
    <button class="kawaii-btn" @click="isDocumentMode = !isDocumentMode">切换文档模式</button>
    <div v-if="!isDocumentMode" class="kawaii-canvas-wrap">
      <skyCanvas />
    </div>

    <div v-else style="background-color: #fff; padding-top: 50px;">
      <div v-for="item in fileList" :key="item.path">
        <template v-if="!item.path.includes('https://')">
          <div style="padding: 0 80px; font-size: 20px;">{{ item.path }}</div>
          <markdownFn :text="'```html\n' + item.content + '```'" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="jsx">
import { ref, nextTick, onBeforeUnmount, onErrorCaptured, defineAsyncComponent } from 'vue'
import skyCanvas from './components/index.vue'

const props = defineProps({
  markdownComponent: {
    type: Function,
    default: () => { },
  },
  fileList: {
    type: Array,
    default: () => [],
  }
});

const markdownFn = props.markdownComponent();

const isDocumentMode = ref(false)

onErrorCaptured((e) => {
  console.log('errorCaptured', e)
})
</script>

<style scoped lang="scss">
.kawaii-container {
  min-height: 100vh;
  background: #f0f0f0;
  font-family: 'Comic Sans MS', 'Chalkboard SE', cursive;
  position: relative;

  .kawaii-btn {
    position: absolute;
    top: 20px;
    left: 20px;
    cursor: pointer;
  }

  .kawaii-canvas-wrap {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    height: 300px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    border: 2px solid #fff;
    background: #fffcf7;
    transition: transform 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>