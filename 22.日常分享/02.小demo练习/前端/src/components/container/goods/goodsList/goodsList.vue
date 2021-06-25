<template>
  <div class="goodsList">
    <el-card class="goodsList-card">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="goodsList-search-and-add">
        <GoodsAddSearch />
      </div>
      <GoodsTable />
      <GoodsPagination  class="goodsList-pagination" />
    </el-card>
  </div>
</template>
<script>
  import GoodsPagination from './goodsComponent/goodsPagination'
  import GoodsTable from './goodsComponent/goodsTable'
  import GoodsAddSearch from './goodsComponent/goodsAddSearch'
  export default {
    components: { // 解构映射到组件
      GoodsTable,
      GoodsAddSearch,
      GoodsPagination
    }
  }
</script>
<style scoped lang='less'>
.goodsList{
  height: 100%;
  width: 100%;
  .goodsList-card{
    position: relative;
    height: 100%;
    width: 100%;
    .goodsList-search-and-add{
      height: 40px;
      margin: 40px 0 20px 20px;
    }
    .goodsList-pagination{
      position: absolute;
      left: 20px;
      bottom: 20px;
    }
  }
}
</style>