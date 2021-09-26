<template>
  <div v-if="ifShow" class="dialog-wrap" @click="dialogOutClose">
    <div class="dialog" @click.stop="return">
      <div v-if="showHeader" class="header">{{title}}</div>
      <slot name="content">
        <div class="content">{{content}}</div>
      </slot>
      <div v-if="showFooter" class="footer">
        <div @click="dialogConfirm">确定</div>
        <div @click="dialogClose">关闭</div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
export default defineComponent({
  name: 'dialog',
  props: {
    showHeader: { // 是否显示头部
      type: Boolean,
      default: true
    },
    showFooter: { // 是否显示底部
      type: Boolean,
      default: true
    },
    dialogABool: { // 是否默认打开
      type: Boolean,
      default: false
    },
    maskClose: { // 点击遮罩是否可以关闭
      type: Boolean,
      default: true
    },
    open: { // 自定义打开事件
      type: Function
    },
    confirm: { // 自定义确认事件
      type: Function
    },
    close: { // 自定义关闭事件
      type: Function
    },
    title: { // 标题
      type: String,
      default: '这是一个标题'
    },
    content: { // 内容
      type: String,
      default: '这是一个内容'
    }
  },
  setup (props, context) {
    const ifShow = ref(props.dialogABool)
    const dialogOpen = () => {
      // 接收传入的open函数，重写默认的dialog打开逻辑,比如发送请求时需要等一段时间
      // 暴露closeCallback函数，是一个关闭dialog方法，自行动态判断何时需要关闭
      if (props.open) {
        props.open(closeCallback)
      } else {
        console.log('默认的打开逻辑')
        openCallback()
      }
      context.emit('open')
    }
    const dialogConfirm = () => {
      if (props.confirm) {
        props.confirm(closeCallback)
      } else {
        console.log('默认的确认逻辑')
        closeCallback()
      }
    }
    const dialogClose = () => {
      if (props.close) {
        props.close(closeCallback)
      } else {
        defaultClose()
      }
      context.emit('close')
    }
    const dialogOutClose = () => {
      if (props.maskClose) {
        defaultClose()
      }
    }

    const defaultClose = () => {
      console.log('默认的关闭逻辑')
      closeCallback()
    }
    const openCallback = () => {
      ifShow.value = true
    }
    const closeCallback = () => {
      ifShow.value = false
    }
    return {
      ifShow,
      dialogConfirm,
      dialogOpen,
      dialogClose,
      dialogOutClose
    }
  }
})
</script>

<style scoped lang="scss">
  .dialog-wrap{
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0,0,0.6);
    z-index: 1000;
    .dialog{
      padding: 10px;
      border-radius: 10px;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 800px;
      height: 500px;
      background: #fff;
      z-index: 1100;
      .header{

      }
      .content{

      }
      .footer{

      }
    }
  }
</style>
