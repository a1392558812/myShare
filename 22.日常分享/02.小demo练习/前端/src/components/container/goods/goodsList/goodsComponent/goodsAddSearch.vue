<template>
  <div>
    <el-input @clear="goodsInputCleared" clearable @change="goodsInputValue" style="width: 400px" placeholder="请输入内容" v-model="input" />
    <el-button @click="searchGoods" type="primary" icon="el-icon-search"/>
    <el-button type="primary" @click="addGood" style="margin-left: 20px">添加商品</el-button>
  </div>
</template>
<script>
  import {mapActions} from 'vuex'
  import {exchangeFun} from './commen.js'
  export default {
    data() { // 初始化数据
      return {
        input:'',
      }
    },
    methods: { // 定义函数
      ...mapActions(['getRequestGoodsList']),
      addGood(){
        this.$router.push('/productslist/add')
      },
      goodsInputCleared(){
        this.getRequestGoodsList({pagenum:1,pagesize:20})
      },
      goodsInputValue(){
        exchangeFun.$emit('goodsSearchValue',this.input)
      },
      searchGoods(){
        if(this.input.trim()){
          this.getRequestGoodsList({pagenum:1,pagesize:20,selectStr:this.input.trim()})
        }
      }
    },
    components: { // 解构映射到组件

    }
  }
</script>
