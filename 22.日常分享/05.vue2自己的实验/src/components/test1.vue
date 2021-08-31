<template>
  <div class="test1" >test1</div>
</template>

<script>
export default {
  name: 'test1',
  mounted () {
    this.getClass()
  },
  methods: {
    getClass () {
      console.log(window.getComputedStyle(this.$el).width)
    }
  }
}
</script>

<style scoped lang="scss">
.test1{
  width: 100px;
  height: 100px;
  border: 1px solid #000;
}
</style>
