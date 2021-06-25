<template>
  <div class="roles">
    <el-card class="roles-main">
      <el-breadcrumb separator-class="el-icon-arrow-right" class="user-nav">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 添加角色 -->
      <el-button type="primary" style="margin-top: 20px">添加角色</el-button>
      <el-table
        @cell-dblclick="handleEditFun"
        :data="roleList"
        style="width: 100%;margin-top: 20px"
        border stripe height="590px"
        v-loading="ifLoading">
        <el-table-column type="expand"  width="80px">
          <template slot-scope="scope">
            <el-row class="role-grid">
              <el-col :span="3" class="el-col-span-3">
                <el-tag style="margin-top: 20px">
                  {{scope.row.role_name}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染一级权限 -->
              <el-col :span="21">
                <el-row
                  v-for="(item,fatherIndex) in scope.row.children"
                  :key="item._id" class="role-grid-bottomBorder"
                  v-if="item.children[0]"
                  :class="fatherIndex===0&&item.children[0]?'role-grid-topBorder':''">
                  <el-col :span="8">
                    <el-tag
                      :closable="true"
                      :disable-transitions="true"
                      @close="fatherTagClose(scope.$index,fatherIndex)"
                      type="success"
                      :hit="true"
                      v-if="item.children[0]"
                      style="margin-top: 20px">
                      {{item.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right" v-if="item.children[0]"></i>
                  </el-col>
                  <el-col :span="16">
                    <el-tag
                      :closable="true"
                      :disable-transitions="true"
                      type="warning"
                      :hit="true"
                      v-for="(child,childIndex) in item.children"
                      @close="childTagClose(scope.$index,fatherIndex,childIndex)"
                      :key="child._id"
                      style="margin: 20px 20px 0 0">
                      {{child.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
              <!-- 渲染二级权限 -->
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="索引" type="index"></el-table-column>
        <el-table-column label="角色名称(双击修改)" >
          <template slot-scope="scope">
            <el-tag type="success" size="medium">
              {{ scope.row.role_name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="角色描述(双击修改)">
          <template slot-scope="scope">
            <el-button type="info" size="mini" plain>{{ scope.row.role_desc }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button style="margin-left: 20px" size="mini" type="danger" icon="el-icon-delete" @click.stop="handleDelete(scope.$index, scope.row)">删除</el-button>
            <el-button style="margin-left: 20px" size="mini" icon='el-icon-setting' type="warning" @click="handleEdit(scope.$index, scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <DistributeDialog :getRequestRights="getRequestRights" v-on:distributeDialogOpen="distributeDialogOpen" :roleList="roleList"/>
  </div>
</template>
<script>
  import { requestRights, requestRoleUpdate } from '../../../ajax/index'
  import DistributeDialog from './distributeDialog/distributeDialog'
  export default {
    data() { // 初始化数据
      return {
        ifLoading:false,
        roleList:[]
      }
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
    created () { // 创建完毕状态
      this.getRequestRights()
    },
    methods: { // 定义函数
      distributeDialogOpen(fun){
        this.fun = fun
      },
      getRequestRoleUpdate ({_id,role_root,role_name,role_desc}) {
        return new Promise(async (resolve, reject) =>{
          this.ifLoading = true
          const result = await requestRoleUpdate({_id,role_root,role_name,role_desc})
          console.log(result)
          this.ifLoading = false
          if(result.code === 0){
            console.log('权限更新成功')
            resolve()
          }else{
            console.log('权限更新失败')
            reject()
          }

        })
      },
      fatherTagClose(nowIndex,fatherIndex){
        const _id = this.roleList[nowIndex]._id
        const root_id = this.roleList[nowIndex].children[fatherIndex].root_id
        console.log()
        this.$confirm(`此操作将永久删除"${this.roleList[nowIndex].children[fatherIndex].authName}", 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.roleList[nowIndex].role_root[root_id] = []
          const role_root = this.roleList[nowIndex].role_root
          this.roleList[nowIndex].children[fatherIndex].children = []
          this.getRequestRoleUpdate({_id,role_root}).then(
            () =>{
              this.$message({
                type: 'success',
                message: '删除成功!'
              });
            }
          )
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      childTagClose(nowIndex,fatherIndex,childIndex){
        const _id = this.roleList[nowIndex]._id
        const root_id = this.roleList[nowIndex].children[fatherIndex].root_id
        console.log()
        this.$confirm(`此操作将永久删除"${this.roleList[nowIndex].children[fatherIndex].children[childIndex].authName}", 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const role_root = this.roleList[nowIndex].role_root
          role_root[root_id].splice(childIndex,1)
          this.roleList[nowIndex].children[fatherIndex].children.splice(childIndex,1)
          this.getRequestRoleUpdate({_id,role_root}).then(
            () =>{
              this.$message({
                type: 'success',
                message: '删除成功!'
              });
            }
          )
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      handleDelete(index,value){
         console.log(value)
        this.$confirm(`此操作将永久删除"${value.role_name}", 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$message({
            type: 'success',
            message: '假装删除成功!'
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      handleEditFun(row, column, cell, event){
        let label = column.label
        if(label === '角色名称(双击修改)'){
          label = '名称'
        }else if(label === '角色描述(双击修改)'){
          label = '描述'
        }else{
          return
        }
        console.log(row, column, cell, event)
        this.$prompt(`请输入新角色${label}`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^[^\s]*$/,
          inputErrorMessage: `${label}格式不正确`
        }).then(({value}) => {
          const _id = row._id
          if(label === '描述'){
            this.getRequestRoleUpdate({_id,role_desc: value}).then(() =>{this.getRequestRights()})
          }else {
            this.getRequestRoleUpdate({_id,role_name: value}).then(() =>{this.getRequestRights()})
          }
          this.$message({
            type: 'success',
            message:`更新角色${label}成功`
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消输入'
          });
        });
      },
      handleEdit(index,value){
        this.fun(index,value)
      },
      async getRequestRights(){
        const result = await requestRights()
        console.log(result)
        if(result.code === 0){
          this.roleList = result.data
        }else{
          console.log('请求失败')
        }
      }
    },
    components: { // 解构映射到组件
      DistributeDialog
    }
  }
</script>
<style scoped lang='less'>
.roles{
  height: 100%;
  width: 100%;
  .roles-main{
    height: 100%;
    width: 100%;
    .role-grid{
      display: flex;
      align-items:center;//富裕空间在两边
      .role-grid-bottomBorder{
        padding:0 0 18px 80px;
        border-bottom: 1px solid #eee;
      }
      .role-grid-topBorder{
        border-top: 1px solid #eee;
      }
    }

  }
}
</style>