<template>
  <div class="productCategory">
    <el-card class="productCategory-card">
      <el-breadcrumb separator-class="el-icon-arrow-right" class="user-nav">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="add-category">
        <el-button type="primary" @click="openAddCategory">添加分类</el-button>
      </div>
      <div  v-loading="ifLoading">
        <zk-table
          class="zkTable"
          ref="table"
          index-text="#"
          :data="tableData"
          :columns="columns"
          :stripe="props.stripe"
          :border="props.border"
          :show-row-hover="props.showRowHover"
          :selection-type="props.selectionType"
          :show-index="props.showIndex"
          :tree-type="props.treeType"
          :is-fold="props.isFold"
          :expand-type="props.expandType">
          <template slot="ifUse" slot-scope="scope">
            <i style="font-size: 16px;color: #FF0000" v-if="scope.row.categoryDeleted" class="el-icon-error"></i>
            <i style="font-size: 16px;color: lightgreen" v-else class="el-icon-success"></i>
          </template>
          <template slot="sort" slot-scope="scope">
            <el-tag v-if=" scope.row.categoryLevel*1 === 0">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.categoryLevel*1 === 1">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
          <template slot="action" slot-scope="scope">
            <el-button @click="handleEdit(scope,scope.row)" style="margin:0 40px 0 20px" icon="el-icon-edit" size="small" type="primary">编辑</el-button>
            <el-button @click="handleDelete(scope,scope.row)" size="small" icon="el-icon-delete" type="danger">删除</el-button>
          </template>
        </zk-table>
      </div>
     <!-- <el-table
        v-loading="ifLoading"
        :data="tableData"
        style="width: 100%;margin: 20px 0;"
        height="560"
        max-height="560"
        row-key="_id"
        border
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column prop="categoryName" label="分类名称"/>
        <el-table-column label="是否有效">
          <template slot-scope="scope">
            <el-tag>{{scope.row.categoryDeleted}}</el-tag>
            <span style="margin-left: 10px">{{ scope.row.date }}</span>
          </template>
        </el-table-column>
        <el-table-column label="等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.categoryLevel===0">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.categoryLevel===1">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              icon="el-icon-edit"
              type="primary"
              size="mini"
              @click="handleEdit(scope.$index, scope.row)">
              编辑
            </el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="handleDelete(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>-->
      <div class="block">
        <el-pagination
          @current-change="handleCurrentChange"
          :page-size="5"
          layout="total,prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
    <DialogAdd
      :getRequestProductsCategory="getRequestProductsCategory"
      :pagenum="pagenum"
      :pagesize="pagesize"
      v-on:openDialogAdd = 'openDialogAdd'
      :categoryList="tableData"/>
    <DialogUpdate
      :getRequestProductsCategory="getRequestProductsCategory"
      :pagenum="pagenum"
      :pagesize="pagesize"
      :nowClick="nowClick"
      v-on:openDialogUpdate="openDialogUpdate"/>
  </div>
</template>
<script>
  import ZkTable from '_vue-table-with-tree-grid@0.2.4@vue-table-with-tree-grid'
  import { requestProductsCategory } from '../../../../ajax'
  import DialogAdd from './dialog/dialogAdd'
  import DialogUpdate from './dialog/dialogupdate'
  export default {
    data() { // 初始化数据
      return {
        nowClick:{}, // 当前点击的对象
        columns: [
          {
            label: '分类名称',
            prop: 'categoryName',
            width: '250px',
          },
          {
            label: '是否有效',
            minWidth: '200px',
            type: 'template',
            template: 'ifUse',
          },
          {
            label: '排序',
            minWidth: '200px',
            type: 'template',
            template: 'sort',
          },
          {
            label: '操作',
            minWidth: '260px',
            type: 'template',
            template: 'action',
          },
        ],
        props: {
          stripe: true,
          border: true,
          showRowHover: true,
          showIndex: true,
          treeType: true,
          isFold: true,
          expandType: false,
          selectionType: false,
        },
        ifLoading:false,
        tableData:[], // 商品分类的数据列表
        pagenum:1,
        pagesize:5,
        total:0 // 总数据条数
      }
    },
    created () { // 创建完毕状态
      this.getRequestProductsCategory({pagenum:this.pagenum,pagesize:this.pagesize})
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
      openDialogUpdate(fun){
        this.open = fun
      },
      openDialogAdd(fun){
        this.openAddDialog = fun
      },
      openAddCategory(){
        this.openAddDialog()
      },
      handleCurrentChange(val){
        this.pagenum = val
        this.getRequestProductsCategory({pagenum:val,pagesize:this.pagesize})
      },
      handleDelete(index,value){
        this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
        console.log(index,value)
      },
      handleEdit(index,value){
        this.nowClick = value // 当前点击的对象
        this.open()
        console.log(value,{categoryName:value.categoryName,_id:value._id,fatherCategoryId:value.fatherCategoryId,categoryLevel:value.categoryLevel})
      },
      async getRequestProductsCategory({pagenum,pagesize}){
        this.ifLoading = true
        const result = await requestProductsCategory({pagenum,pagesize})
        if(result.code === 0){
          console.log(result.data)
          this.tableData = result.data.data
          this.total = result.data.total
        }else{
          this.$message.error('分类获取失败了')
        }
        this.ifLoading = false
      }
    },
    components: { // 解构映射到组件
      ZkTable,
      DialogAdd,
      DialogUpdate
    }
  }
</script>
<style scoped lang='less'>
.productCategory{
  height: 100%;
  width: 100%;
  .productCategory-card{
    position: relative;
    box-sizing: border-box;
    padding: 0 20px;
    height: 100%;
    width: 100%;
    .add-category{
      margin: 40px 0 60px 0;
    }
    .zkTable{
      position: relative;
      max-height: 500px;
      overflow-y: auto;
    }
    .block{
      position: absolute;
      bottom: 30px;
    }
  }
}
</style>