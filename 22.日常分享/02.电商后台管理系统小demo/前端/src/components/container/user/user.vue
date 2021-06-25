<template>
  <div class="user">
    <!-- 🍞面包屑导航 -->
    <el-card class="box-card user-box-card">
      <el-breadcrumb separator-class="el-icon-arrow-right" class="user-nav">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card class="user-main">
        <div class="user-main-search-add">
          <el-input style="width: 250px" placeholder="请输入内容" v-model="input" class="input-with-select"></el-input>
          <el-button type="primary" style="margin-right: 15px" slot="suffix" icon="el-icon-search" @click="searchUser"></el-button>
          <el-button type="primary" style="margin-right: 15px"  @click="searchAllUser">查询所有admin</el-button>
          <el-button type="primary" @click="addUser">添加用户</el-button>
        </div>
        <!-- 用户列表表格 -->
        <el-table
          :data="userList"
          border
          stripe
          style="width: 100%">
          <el-table-column label="#" type="index"></el-table-column>
          <el-table-column label="姓名">
            <template slot-scope="scope">
              <el-popover trigger="hover" placement="top">
                <p>姓名: {{ scope.row.username }}</p>
                <p>创建日期: {{ scope.row.create_time }}</p>
                <div slot="reference" class="name-wrapper">
                  <el-tag size="medium">
                    <i class="el-icon-user-solid"></i>
                    {{ scope.row.username }}
                  </el-tag>
                </div>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="📪邮箱">
            <template slot-scope="scope">
              <i class="el-icon-message"></i>
              <span style="margin-left: 10px">{{ scope.row.email }}</span>
            </template>
          </el-table-column>
          <el-table-column label="电话☎">
            <template slot-scope="scope">
              <i class="el-icon-phone-outline"></i>
              <span style="margin-left: 10px">{{ scope.row.mobile }}</span>
            </template>
          </el-table-column>
          <el-table-column label="角色">
            <template slot-scope="scope">
              <i class="el-icon-user"></i>
              <span style="margin-left: 10px">{{ scope.row.role_name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态">
            <template slot-scope="scope" class="el-table-column-switch">
              <el-switch
                v-model="scope.row.mg_state"
                active-color="#409EFF"
                @change = 'changeUserState(scope.row)'
                inactive-color="#eee">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200px" class="actionBtn">
            <template slot-scope="scope">
              <!-- 修改按钮 -->
              <el-tooltip content="修改按钮" placement="top" :enterable="false">
                <el-button
                  style="margin-left: 15px"
                  type="primary" icon="el-icon-edit" circle
                  @click="handleUpdate(scope.$index, scope.row)"></el-button>
              </el-tooltip>
              <!-- 删除按钮 -->
              <el-tooltip content="删除按钮" placement="top" :enterable="false">
                <el-button
                  style="margin-left: 15px"
                  type="danger" icon="el-icon-delete" circle
                  @click="handleDelete(scope.$index, scope.row)"></el-button>
              </el-tooltip>
              <!-- 分配角色按钮 -->
              <el-tooltip content="分配角色按钮" placement="top" :enterable="false">
                <el-button
                  style="margin-left: 15px"
                  type="warning" icon="el-icon-setting" circle
                  @click="handleRole(scope.$index, scope.row)"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <div class="block">
          <el-pagination
            @current-change="handleCurrentChange"
            :current-page.sync="pagenum"
            :page-size="7"
            layout="total, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </div>
      </el-card>
    </el-card>
    <DialogAdd
      v-on:handelDialogAdd="handelDialogAdd"
      :callbackList="callbackList"/>
   <DialogUpdate
     :pagenum="pagenum"
     v-on:handelDialogUpdate="handelDialogUpdate"
     :callbackUpdate="callbackUpdate"
     :nowClick="nowClick"
     :callbackList="callbackList"/>
    <DialogDistribute
      :selectOptions="selectOptions"
      v-on:distributeDialog="distributeDialog"
      :pagenum="pagenum"
      :getRequestUserList = 'getRequestUserList'
      :getRequestUpdateUser="getRequestUpdateUser"
      :nowClick="nowClick"/>
  </div>
</template>
<script>
import {
  requestUserList,
  requestUpdateUser,
  requestAllRootList,
  requestDeleteUser} from '../../../ajax/index'
import DialogAdd from './dialog/dialog-add'
import DialogUpdate from './dialog/dialog-update'
import DialogDistribute from './dialog/dialog-distribute'
export default {
  data() { // 初始化数据
    const the = this
    return {
      selectOptions:[], // 下拉框的选项
      nowClick:{}, // 当前点击修改的对象
      input: '',// 输入框输入的内容
      pagenum:1,
      queryInfo:{query:'',pagenum:1,pagesize:7},
      userList:[], // 用户列表
      total:0, // 总用户条数
      /*callbackList*/
      callbackList:function ({query,pagenum,pagesize}) {
        the.getRequestUserList({query,pagenum,pagesize})
      },
      callbackUpdate:function ({_id,mg_state,email,mobile,role_id}) {
        return the.getRequestUpdateUser({_id,mg_state,email,mobile,role_id})
      }
    }
  },
  created() {
    // 创建完毕状态
    const {pagenum,pagesize} = this.queryInfo
    this.getRequestUserList({pagenum,pagesize})
    this.getRequestAllRootList()
  },
  /*beforeMount() {
    // 初始化完成前状态
  },
  beforeCreate() {
    // 创建前状态
  },
  mounted() {
    //初始化完成后的回调函数
  },
  beforeUpdate: function() {
    // 更新前状态
  },
  updated: function() {
    // 更新完成状态
  },
  beforeDestroy: function() {
    // 销毁前状态
  },
  destroyed: function() {
    // 销毁完成状态
  },
  computed: {
    // 计算属性
  },
  watch: {
    // 深度监视，数据一旦发生改变，立马更新保存数据
  },*/
  methods: {  // 定义函数
    async getRequestAllRootList(){
      const result = await requestAllRootList()
      console.log(result)
      if (result.code === 0) {
        console.log(result.data)
        this.selectOptions = result.data
      }else{
        this.$message.error('网络出错了，请刷新')
      }
    },
    distributeDialog(fun){
      this.openDistribute = fun
    },
    getRequestDeleteUser ({_id}){
      return new Promise(async (resolve,reject) =>{
        const result = await requestDeleteUser({_id})
        if(result.code===0){
          resolve()
        }else{
          reject()
        }
      })
    },
    handelDialogAdd (fun){
       this.ChildDialogAdd = fun
    },
    handelDialogUpdate (fun){
      this.ChildDialogUpdate = fun
    },
    addUser () {
      this.ChildDialogAdd()
    },
    searchAllUser(){/* queryInfo:{query:'',pagenum:1,pagesize:7} */
      const pagenum = 1
      const query = ''
      const pagesize = 7
      this.input=''
      this.queryInfo.pagenum = pagenum
      this.queryInfo.query = query
      this.queryInfo.pagesize = pagesize
      this.getRequestUserList({query,pagenum,pagesize})
    },
    searchUser(){
      let query = this.input
      if(query){
        query = query.trim()
        this.queryInfo.query = query
        const {pagenum,pagesize} = this.queryInfo
        console.log(query)
        this.getRequestUserList({query,pagenum,pagesize})
      }
    },
    getRequestUpdateUser ({_id,mg_state,email,mobile,role_id}){
      return new Promise(async (resolve,reject) =>{
        const result = await requestUpdateUser({_id,mg_state,email,mobile,role_id})
        console.log(result)
        if (result.code ===0){
          this.$message.success('修改成功')
          resolve(result.data)
        }else{
          this.$message.error('修改失败')
          reject(result)
        }
      })
    },
    changeUserState (value){ // 监听用户状态的改变
      console.log(value)
      const {_id,mg_state} = value
      this.getRequestUpdateUser({_id,mg_state})
        .then(
          data => {},
          error =>{
            value.mg_state = !mg_state
          }
        )
    },
    handleRole(index, scopeRow){
      this.nowClick = scopeRow
      this.openDistribute()
      console.log(index, scopeRow)
    },
    handleCurrentChange(val) {
      this.pagenum = val
      const pagenum = val
      const {query,pagesize} = this.queryInfo
      this.getRequestUserList({query,pagenum,pagesize})
      console.log(`当前页: ${val}`);
    },
    handleDelete(index, scopeRow){
      console.log(index, scopeRow)
      this.$confirm(`此操作将永久删除该用户, 是否继续?`, `提示：正在删除${scopeRow.username}`, {
        type: 'warning',
        roundButton:true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(() => {
        const _id = scopeRow._id
        this.getRequestDeleteUser({_id})
          .then(
            () =>{
              this.$message({type: 'success',message: '删除成功!'});
              const pagenum = this.pagenum
              const pagesize = 7
              this.getRequestUserList({pagenum,pagesize})
            },
            () =>{
              this.$message({type: 'info',message: '删除失败了emmmm'})
            }
          )
      }).catch(() => {
        this.$message({type: 'info',message: '已取消删除'})
      })
    },
    handleUpdate(index, scopeRow){
      console.log(scopeRow)
      this.nowClick = scopeRow
      this.ChildDialogUpdate()
    },
    async getRequestUserList({query,pagenum,pagesize}){
      const result = await requestUserList({query,pagenum,pagesize})
      console.log(result)
      if (result.code ===0){
          this.userList = result.data.users
          this.total = result.data.total
          this.pagenum = result.data.pagenum*1
      } else{
        this.$message.error('数据获取失败了')
        console.log('数据获取失败了',result)
      }
    }
  },
  components: { // 解构映射到组件
    DialogAdd,
    DialogUpdate,
    DialogDistribute
  }
}
</script>
<style scoped lang='less'>
.user {
  height: 100%;
  width: 100%;
  .user-box-card {
    height: 100%;
    width: 100%;
    .user-nav {
      margin-bottom: 20px;
    }
    .user-main {
      height: 100%;
      .user-main-search-add{
        height: 80px;
        display: flex;
        flex-direction: row;
        align-items:center;//富裕空间在两边s
      }

    }
    .el-table{
      margin-top: 20px;
    }
  }
}
</style>
