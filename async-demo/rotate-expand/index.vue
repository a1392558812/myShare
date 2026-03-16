<template>
  <appContainer>
    <layoutCom type="preview">
      <template #preview>
        <rotateExpand />
      </template>

      <template #code>
        <codeContent />
      </template>
    </layoutCom>
  </appContainer>
</template>

<script setup>
import rotateExpand from './components/index.vue';
import baseConfig from '../static/hooks/extends.js'
import {
  layoutCom,
  appContainer,
} from '../components/form-control/index.vue';

defineOptions({
  extends: baseConfig({})
})
</script>

<style scoped lang="scss">
.preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>