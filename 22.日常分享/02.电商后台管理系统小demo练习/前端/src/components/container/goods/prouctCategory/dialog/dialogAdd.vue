<template>
  <div>
    <el-dialog :destroy-on-close="true" :visible.sync="dialogVisible" width="50%" @close="categoryAddClose">
      <span slot="title">当前于第{{pagenum}}页添加分类</span>
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="分类名称:" prop="categoryName">
          <el-input v-model="ruleForm.categoryName"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
            <el-cascader
              ref="cascadePanelRef"
              style="width: 100%"
              :clearable="true"
              size="medium "
              :options="this.categoryList"
              :props="props"><!--  label="data.categoryName" -->
              <template slot-scope="{node,data}">
                <span v-if="data.categoryLevel !== 2">{{testFun(data).categoryName}}</span>
              </template>
            </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogCancel">取 消</el-button>
        <el-button type="primary" @click="dialogClickOK">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import {requestAddCategory} from '../../../../../ajax/index'
  import {checkNameFun} from '../../../../../tools/Regex'
  export default {
    props:{
      getRequestProductsCategory:{type:Function},
      pagenum:{type: Number},
      pagesize:{type: Number},
      categoryList:{type:Array}
    },
    data() { // 初始化数据
      return {
        ruleForm:{
          categoryName:'',
        },
        rules:{
          categoryName:[
            { validator: this.checkName, trigger: 'blur' },
          ]
        },
        dialogVisible:false,
        props:{
          value:'_id',
          checkStrictly:'true',
          label:'categoryName',
        }
      }
    },
    created () { // 创建完毕状态
      this.$emit('openDialogAdd',() =>{
        this.dialogVisible = true
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
      checkName(rule, value, callback){
        const {valid,message} = checkNameFun(value)
        if(valid){
          callback()
        }else{
          callback(new Error(message))
        }
      },
      async getRequestAddCategory({categoryName,fatherCategoryId,categoryLevel}){
        const result = await requestAddCategory({categoryName,fatherCategoryId,categoryLevel})
        if(result.code === 0){
          this.getRequestProductsCategory({pagenum:this.pagenum,pagesize:this.pagesize})
          this.dialogVisible = false
          this.$message.success('添加成功')
        }else{
          this.$message.error('添加失败了')
        }
      },
      categoryAddClose(){
        this.$refs.ruleForm.resetFields()
      },
      testFun(data){
        if(data.categoryLevel === 1){
          data.children = null
        }
        return data
      },
      dialogCancel(){
        this.dialogVisible = false
      },
      dialogClickOK(){
        let fatherCategoryId
        let categoryLevel
        const categoryName = this.ruleForm.categoryName
        const {valid} = checkNameFun(categoryName)
        if(valid){
          console.log(this.$refs.cascadePanelRef.getCheckedNodes(true)[0])
          if(this.$refs.cascadePanelRef.getCheckedNodes(true)[0]){
            fatherCategoryId = this.$refs.cascadePanelRef.getCheckedNodes(true)[0].value
            categoryLevel = this.$refs.cascadePanelRef.getCheckedNodes(true)[0].level
          }else{
            fatherCategoryId = 0
            categoryLevel = 0
          }
          this.getRequestAddCategory({categoryName,fatherCategoryId,categoryLevel})
        }else{
          return this.$message.error("您还有未通过验证的字段")
        }
      },
    },
    components: { // 解构映射到组件

    }
  }
</script>
