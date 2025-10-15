<template>
  <div class="dialog-overlay" :style="dialogData.overlayStyle" v-show="dialogData.show" @click="dialogData.close">
    <transition name="dialog-fade">
      <div class="dialog-container" :style="dialogData.containerStyle" v-if="dialogData.show" @click.stop="() => { }">
        <div class="dialog-header" :style="dialogData.containerHeaderStyle">
          <div>{{ dialogData.title }}</div>
          <button class="dialog-close-btn" @click="dialogData.close">
            ×
          </button>
        </div>
        <div class="dialog-content" :style="dialogData.containerContentStyle">
          <slot></slot>
        </div>
        <div class="dialog-footer" :style="dialogData.containerFooterStyle">
          <button :style="[dialogData.containerFooterBtnStyle, dialogData.containerFooterCancelBtnStyle]"
            class="dialog-button dialog-cancel" @click="dialogData.close">取消</button>
          <button :style="[dialogData.containerFooterBtnStyle, dialogData.containerFooterConfirmBtnStyle]"
            class="dialog-button dialog-confirm" @click="dialogData.confirm">确认</button>
        </div>
      </div>
    </transition>
  </div>

</template>
<script setup>
import { reactive } from 'vue';
const dialogDataFun = () => ({
  show: false,
  title: '提示',
  overlayStyle: {},
  containerStyle: {},
  containerHeaderStyle: {},
  containerContentStyle: {},
  containerFooterStyle: {},
  containerFooterBtnStyle: {},
  containerFooterCancelBtnStyle: {},
  containerFooterConfirmBtnStyle: {},
  close: () => {
    dialogData.show = false
  },
  confirm: () => {
    dialogData.show = false
  },
})

const originDialogData = dialogDataFun()
const dialogData = reactive(originDialogData)

const handleEscKey = (event) => {
  if (event.key === 'Escape' && dialogData.show) {
    dialogData.close();
  }
}

const showDialog = (options = {}) => {
  Object.assign(dialogData, dialogDataFun(), options, { show: true })
  document.addEventListener('keydown', handleEscKey);
}
const hideDialog = (options = {}) => {
  Object.assign(dialogData, dialogDataFun(), options, { show: false })
  document.removeEventListener('keydown', handleEscKey);
}

defineExpose({
  showDialog,
  hideDialog,
})

</script>
<style lang="scss" scoped>
@use './async-demo/static/scss/theme.scss';

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-container {
  background: white;
  padding: $spacing-md;
  border-radius: $border-radius;
  box-shadow: $shadow-medium;
  max-width: 1200px;
  max-height: 80vh;
  width: 90%;
  height: 80%;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: $spacing-md;

  .dialog-close-btn {
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    border-radius: 999px;
    border: none;
    background: transparent;
  }
}

.dialog-content {
  flex: 1;
  margin-bottom: $spacing-md;
  overflow: auto;
}

.dialog-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
}

.dialog-button {
  padding: $spacing-sm $spacing-md;
  border: none;
  border-radius: $border-radius;
  cursor: pointer;
  transition: all $transition-speed;
}

.dialog-cancel {
  background: $medium-gray;
  color: $dark-gray;
  margin-right: $spacing-md;
}

.dialog-confirm {
  background: $primary-color;
  color: white;
}

.dialog-button:hover {
  opacity: 0.8;
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: all $transition-speed ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>