<template>
  <div class="Form">
    <el-form-item prop="goodName" label="商品名称">
      <el-input v-model="addForm.goodName"></el-input>
    </el-form-item>
    <el-form-item prop="goodPrice" label="商品价格">
      <el-input type="number" v-model="addForm.goodPrice"></el-input>
    </el-form-item>
    <el-form-item prop="goodWeight" label="商品重量">
      <el-input type="number" v-model="addForm.goodWeight"></el-input>
    </el-form-item>
    <el-form-item prop="goodNum" label="商品数量">
      <el-input type="number" v-model="addForm.goodNum"></el-input>
    </el-form-item>
    <el-form-item prop="goodSelect" label="商品分类" >
      <el-cascader
        :key="rendered"
        :options="goodsSelectOptions"
        @change = 'goodsSelectOptionsChange'
        v-model="addForm.goodSelect"
        :props="props">
      </el-cascader>
    </el-form-item>
    <el-pagination
      class="pagination"
      background
      @current-change="handleCurrentChange"
      :current-page="GoodCurrentPage"
      layout="total,prev,next,jumper"
      :total="categoryTotal" />
  </div>
</template>
<script>
  import {mapState,mapActions} from 'vuex'
  export default {
    props:{
      changedFun:{type:Function}
    },
    data() { // 初始化数据
      let _self = this
      return {
        rendered:true,
        categoryTotal:0,
        GoodCurrentPage:0,
        props:{
          label:'categoryName',
          value: '_id',
          lazy: true,
          async lazyLoad (node, resolve) {
            if(node){
              const { level } = node;
              if(level!==0){
                const fatherCategoryId = node.value
                const result =await _self.getGoodCategory({level:level,fatherCategoryId})
                resolve(result)
              }
            }
          }
        }
      }
    },
    created () { // 创建完毕状态
      this.getGoodCategory({level:0,pagenum:1,pagesize:20,callFun:(categoryTotal) =>{
        this.categoryTotal = categoryTotal
      }})
    },
    computed: { // 计算属性
      ...mapState(['addForm','goodsSelectOptions'])
    },
    /*
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
    methods: { // 定义函数
      ...mapActions(['getGoodCategory']),
      goodsSelectOptionsChange(val){
        if(val.length<3){
          this.$message.error('只允许选择三级分类')
          this.addForm.goodSelect = []
        }else{
          this.changedFun()
          console.log(this.addForm.goodSelect)
        }
      },
      handleCurrentChange(val){
        this.addForm.goodSelect = []
        this.GoodCurrentPage = val
        this.rendered = !this.rendered
        this.getGoodCategory({level:0,pagenum:val,pagesize:20})
      }
    },
    components: { // 解构映射到组件

    }
  }
</script>
<style scoped lang='less'>
.Form{
  position: relative;
  .pagination{
    position: absolute;
    bottom: 2px;
    left: 300px;
  }
}
</style>