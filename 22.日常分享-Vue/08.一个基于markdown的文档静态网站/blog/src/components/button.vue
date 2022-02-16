<template>
  <div
    id="commonBtn"
    :class="type"
    class="common-btn"
    @click="handelClick">
    <div class="common-btn-inner">
      <slot></slot>
    </div>
    <div
      :class="[waveActive ? 'common-btn-wave-active' : '']"
      :style="{
        top: rippleTop + 'px',
        left: rippleLeft + 'px',
        width: fields.targetWidth + 'px',
        height: fields.targetWidth + 'px',
        backgroundColor: 'rgba(0,220,255,0.15)'
      }"
      class="common-btn-wave-ripple"></div>
  </div>
</template>

<script>
export default {
  name: 'common-btn',
  props: {
    btnText: {
      type: String,
      default: ''
    },
    type: {
      /*
        * common-btn-cancel
        * common-btn-common
        *  */
      type: String,
      default: 'common-btn-common'
    }
  },
  data () {
    return {
      rippleTop: 0,
      rippleLeft: 0,
      fields: {},
      waveActive: false
    }
  },
  methods: {
    handelClick (e) {
      this.waveActive = false
      this.$emit('btnClick')
      this.$nextTick(function () {
        this.getWaveQuery(e)
      })
    },
    getWaveQuery (e) {
      const data = document.querySelector('#commonBtn').getBoundingClientRect()
      if (!data.width || !data.width) return
      data.targetWidth = data.height > data.width ? data.height : data.width
      if (!data.targetWidth) return

      this.fields = data
      const touchesX = e.clientX
      const touchesY = e.clientY
      this.rippleTop = touchesY - data.top - data.targetWidth / 2
      this.rippleLeft = touchesX - data.left - data.targetWidth / 2
      this.$nextTick(() => {
        this.waveActive = true
      })
    }
  }
}
</script>

<style scoped lang="scss">
  .common-btn{
    position: relative;
    line-height: 1;
    padding: 8px 20px;
    border-radius: 5px;
    overflow: hidden;
    user-select: none;
    cursor: pointer;
    font-size: 14px;
    letter-spacing: 0.1em;
    &-wave-ripple{
      z-index: 0;
      position: absolute;
      border-radius: 100%;
      background-clip: padding-box;
      pointer-events: none;
      user-select: none;
      transform: scale(0);
      opacity: 1;
      transform-origin: center;
    }
    &-wave-active {
      opacity: 0;
      transform: scale(2);
      transition: opacity 1s linear, transform 0.4s linear;
    }
  }
  .common-btn-common{
    background-color: #00aa88;
    color: #fff;
    border-radius: 5px;
    .common-btn-inner{
      border-radius: 5px;
      margin: 0;
      width: 100%;
      height: 100%;
    }
  }
  .common-btn-cancel{
    background-color: #979797;
    padding: 1px;
    .common-btn-inner{
      background-color: #fff;
      border-radius: 5px;
      width: 100%;
      height: 100%;
    }
  }
  .flex-shrink-0{
    flex-shrink: 0;
  }
</style>
