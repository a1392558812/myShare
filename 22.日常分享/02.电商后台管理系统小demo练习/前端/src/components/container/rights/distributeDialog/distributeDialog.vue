<template>
  <div>
    <el-dialog title="收货地址" :destroy-on-close="true" :visible.sync="dialogVisible" @close="dialogClose">
      <el-tree
        :data="allRoleList"
        show-checkbox
        default-expand-all
        current-node-key="defaultCheckedNodeKeys"
        :default-checked-keys="defaultCheckedNodeKeys"
        node-key="id"
        ref="tree"
        highlight-current
        :props="defaultProps">
      </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogClickCancel">取 消</el-button>
        <el-button type="primary" @click="dialogClickAssign">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import {requestAllRoleList,requestRoleUpdate} from '../../../../ajax/index'
  export default {
    props:{
      getRequestRights:{type:Function},
      roleList:{type:Array}
    },
    data() { // 初始化数据
      return {
        dialogVisible:false,
        defaultCheckedNodeKeys:[],
        allRoleList:[], // 所有的权限
        nowClick:{}, // {index,value}
        role_root:{}, // 权限对象
        defaultProps:{
          children:'children',
          label:'label'
        }
      }
    },
    created () { // 创建完毕状态
      this.getRequestAllRoleList()
      this.$emit("distributeDialogOpen", (index,value) =>{
        console.log('创建完毕状态',index,value.role_root,this.roleList)
        this.role_root = value.role_root
        let defaultCheckedNodeKeys = []
        for(let key in value.role_root){
          console.log(value.role_root[key])
          for(let k=0;k<value.role_root[key].length;k++){
            defaultCheckedNodeKeys.push(value.role_root[key][k])
          }
        }
        console.log(defaultCheckedNodeKeys)
        this.defaultCheckedNodeKeys = defaultCheckedNodeKeys
        this.nowClick.index = index
        this.nowClick.value = value
        this.dialogVisible = !this.dialogVisible
      })
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
     getRequestRoleUpdate({_id,role_root,role_name,role_desc}){
       return new Promise(async (resolve, reject) =>{
         const result = await requestRoleUpdate({_id,role_root,role_name,role_desc})
         if(result.code === 0){
           resolve()
         }else{
           reject()
         }
       })
      },
      async getRequestAllRoleList(){
        const result = await requestAllRoleList()
        if (result.code === 0){
          for(let i=0; i<result.data.length; i++){
            result.data[i].id = result.data[i].root_id
            result.data[i].label = result.data[i].authName+'('+result.data[i].root_id+')'
            if(result.data[i].children[0]){
              for(let k=0; k<result.data[i].children.length; k++){
                result.data[i].children[k].id = result.data[i].children[k].root_id
                result.data[i].children[k].label = result.data[i].children[k].authName
              }
            }
          }
          console.log('所有权限获取',result.data)
          this.allRoleList = result.data
        } else{
          console.log("权限获取失败了")
          this.$message.error("权限获取失败了")
        }
      },
      dialogClose(){
        this.defaultCheckedNodeKeys = []
      },
      dialogClickAssign(){
        const result = this.$refs.tree.getCheckedNodes(true,true)
        let changedRoleRoot = {}
        for(let key in this.nowClick.value.role_root){
          changedRoleRoot[key] = []
          for(let k=0;k<result.length;k++){
            if(result[k].parentId ===key){
              changedRoleRoot[key].push(result[k].root_id)
            }
          }
        }
        const _id = this.nowClick.value._id
        console.log(_id,changedRoleRoot)
        this.getRequestRoleUpdate({_id,role_root:changedRoleRoot})
          .then(
            () =>{
              this.$message.success('权限修改成功')
              this.getRequestRights()
              this.dialogVisible = false
            },
            () =>{
              this.$message.success('权限修改失败')
              console.log('跟新失败功')
            }
          )
      },
      dialogClickCancel(){
        this.dialogVisible = false
      }
    },
    components: { // 解构映射到组件
    }
  }
</script>
<style scoped lang=''>

</style>