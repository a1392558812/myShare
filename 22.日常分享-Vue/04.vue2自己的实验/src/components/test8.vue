<template>
  <div class="wrap">
    <div
      class="box center"
      v-for="(item, index) in list"
      :ref="`div${index}`"
      :id="`div-${index}`"
      @click="handelClick(index)"
      v-loading="item.loading"
      :key="index">
      {{index}}--{{item.loading}}
    </div>
  </div>
</template>

<script>
  export default {
    name: "test8",
    data() {
      return {
        list: [
          {loading: false},
          {loading: false},
          {loading: false},
          {loading: false},
          {loading: false},
          {loading: false},
          {loading: false},
          {loading: false},
          {loading: false},
          {loading: false},
        ]
      }
    },
    methods:{
      handelClick(index) {
        this.list[index].loading = true
        setTimeout(() => {
          this.list[index].loading = false
        }, 3000)
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
