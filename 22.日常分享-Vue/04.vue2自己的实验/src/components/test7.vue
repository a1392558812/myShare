<template>
  <div class="wrap">
    <div
      class="box center"
      :ref="`div${item}`"
      :id="`div-${item}`"
      v-for="item in 10"
      @click="handelClick(item)"
      :key="item">
      {{item}}
    </div>
    <test6></test6>
  </div>
</template>

<script>
  import test6 from "./test6";
  export default {
    name: "test7",
    components:{
      test6
    },
    methods:{
      handelClick(index) {
        clearInterval(this.timer)
        this.$loading.show({
          target: this.$refs[`div${index}`][0]
        })
        this.timer = setTimeout(() => {
          this.$loading.close()
        }, 5000)
      }
    }
  }
</script>

<style scoped lang="scss">
.wrap{
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.center{
  display: flex;
  align-items: center;
  justify-content: center;
}
.box{
  position: relative;
  width: 200px;
  height: 200px;
  background-color: #87ec28;
  margin: 10px;
}
</style>
