<template>
  <div>
    <div class="memo-container">
      <div class="memo">
        <div class="mark"></div>
        <div class="memo-heading">
          <h5 class="title">{{memo.title}}</h5>
          <ul class="tools">
            <li class="edit"></li>
            <li class="delete"></li>
          </ul>
        </div>
        <h6 class="memo-info">
          <span class="timeStamp">{{memo.createTime}}</span>
          <span class="category">分类:{{aHelper.getCategoryName(memo.cateId)}}</span>
        </h6>
        <div class="content">
          <div class="text">{{memo.content}}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import {Component,Vue,Prop} from 'vue-property-decorator'
  import {State} from 'vuex-class'
  import ItemData from '../model/ItemData'
  @Component
  export default class MemoItem extends Vue{
      @State private aHelper:any;
      @Prop() memo!:ItemData
  }

  /*
    data() { // 初始化数据
      return {}
    },
    methods: { // 定义函数

    },
    components: { // 解构映射到组件

    }
    beforeCreate () { // 创建前状态
      
    },
    created () { // 创建完毕状态
      
    },
    beforeMount () { // 初始化完成前状态
      
    },
    mounted() { //初始化完成后的回调函数
      
    },
    beforeUpdate() { // 更新前状态
      
    },
    updated() { // 更新完成状态
      
    },
    beforeDestroy() { // 销毁前状态
      
    },
    destroyed() { // 销毁完成状态
      
    },
    computed: { // 计算属性
      
    },
    watch: { // 深度监视，数据一旦发生改变，立马更新保存数据
      
    },
    */
</script>
<style scoped lang=''>

</style>