<template>
  <div class="rights">
    <el-card class="box-card rights-box-card">
      <el-breadcrumb separator-class="el-icon-arrow-right" class="user-nav">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
      <el-card style="margin-top: 20px">
        <el-table :data="rightList" style="width: 100%" border height="600" stripe>
          <el-table-column label="#" type="index">
          </el-table-column>
          <el-table-column label="权限名称">
            <template slot-scope="scope">
              <span style="margin-left: 10px">{{ scope.row.authName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="路径" >
            <template slot-scope="scope">
              <span style="margin-left: 10px">{{ scope.row.path?scope.row.path:'父级路径' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="权限等级" >
            <template slot-scope="scope">
              <span style="margin-left: 10px">
                <el-tag type="success" v-if="scope.row.level==='0'">一级</el-tag>
                <el-tag type="warning" v-if="scope.row.level !=='0'">二级</el-tag>
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-card>
  </div>
</template>
<script>
  import {requestRightsList} from '../../../ajax/index'
  export default {
    data() { // 初始化数据
      return {
        rightList:[]
      }
    },
    created () { // 创建完毕状态
      this.getRequestRightsList()
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
      async getRequestRightsList(){
        const result = await requestRightsList()
        console.log(result)
        if(result.code ===0){
          this.rightList = result.data
        }else{
          this.$message.error('权限获取失败了')
        }
      }
    },
    components: { // 解构映射到组件

    }
  }
</script>
<style scoped lang='less'>
.rights{
  height: 100%;
  width: 100%;
  .rights-box-card{
    height: 100%;
    width: 100%;
  }
}
</style>