<template>
  <div>
    <el-form label-position="left" status-icon :rules="AddFormRules" ref="addFormRef" style="height: 450px" :model="addForm" label-width="80px">
      <el-tabs
        :before-leave="beforeLeave"
        v-model="tabIndex"
        tab-position="left"
        style="margin-top: 60px">
        <el-tab-pane name="0" label="基本信息">
          <BasicInformation :changedFun="changedFun"/>
        </el-tab-pane>
        <el-tab-pane name="1" label="商品参数">
          <GoodParameter/>
        </el-tab-pane>
        <el-tab-pane name="2" label="商品属性">
          <GoodAttribute/>
        </el-tab-pane>
        <el-tab-pane name="3" label="商品图片">
          <uploadImage/>
        </el-tab-pane>
        <el-tab-pane name="4" label="商品内容">
          <RichTextEditor :addFormRef="$refs.addFormRef"/>
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </div>
</template>
<script>
  import {checkNameFun} from '../../../../../../tools/Regex'
  import uploadImage from './addForm/uploadImage'
  import GoodAttribute from './addForm/goodAttribute'
  import  BasicInformation from './addForm/BasicInformation'
  import GoodParameter from './addForm/goodParameter'
  import RichTextEditor from './addForm/richTextEditor'
  import {mapState} from 'vuex'
  import {requestCategoryList} from '../../../../../../ajax/index'
  export default {
    props:{
      activeIndex:{type:String},
      changeActiveIndex:{type:Function}
    },
    data() { // 初始化数据
      return {
        ifChanged:false, // 级联选择器是否已经发生改变
        AddFormRules:{
          goodName:[ { validator: this.checkName, trigger: 'blur' }],
          goodPrice:[ { validator: this.checkPrice, trigger: 'blur' }],
          goodWeight:[ { validator: this.checkWeight, trigger: 'blur' }],
          goodNum:[ { validator: this.checkNum, trigger: 'blur' }],
          goodSelect:[ { validator: this.checkSelect, trigger: 'change' }],
        }
      }
    },
    computed: { // 计算属性
      ...mapState(['addForm','goodsSelectOptions']),
      tabIndex:{
        get () {
          return this.activeIndex
        },
        set (value) {
          return this.changeActiveIndex(value)
        }
      },

    },
    created () { // 创建完毕状态
      this.addForm.goodName = ''
      this.addForm.goodPrice = null
      this.addForm.goodWeight = null
      this.addForm.goodNum = null
      this.addForm.goodSelect = []
      this.addForm.goodParameter = []
      this.addForm.goodAttr = []
      this.addForm.fileList = []
      this.addForm.richTextContent = ''
    },
    methods: { // 定义函数
      changedFun(){
        this.ifChanged = true
      },
      getRequestCategoryList({categoryId,attrSel}){
        return new Promise(async (resolve, reject) =>{
          const result = await requestCategoryList({categoryId,attrSel})
          if(result.code === 0){
            resolve(result.data)
          }else{
            reject(result)
          }
        })
      },
      commonCheck(value,callback,message1,message2){
        if(value){
          if(value<=0){
            return callback(new Error(message2))
          }else{
            callback()
          }
        }else{
          return callback(new Error(message1))
        }
      },
      checkNum(rule, value, callback){
        this.commonCheck(value,callback,'数量必须填写','数量不能低于0个')
      },
      checkPrice(rule, value, callback){
        this.commonCheck(value,callback,'价格必须填写','价格不能低于0元')
      },
      checkWeight(rule, value, callback){
        this.commonCheck(value,callback,'重量必须填写','重量不能低于0')
      },
      checkName(rule, value, callback){
        const result = checkNameFun(value)
        if(result.valid){
          callback()
        }else{
          callback(new Error(result.message))
        }
      },
      checkSelect(rule, value, callback){
        if(value.length === 0){
          callback(new Error('还未选择分类项'))
        }else if(value.length>0&&value.length<3){
          callback(new Error('只允许选择三级分类'))
        }else if (value.length === 3){
          callback()
        } else{
          callback(new Error('参数出错了'))
        }
      },
      addFormRefValidateField(){
        let funStr = ['goodName','goodPrice','goodWeight','goodNum','goodSelect']
        let boolean = true
        for(let i =0;i<5;i++){
          if(!boolean) return false
          this.$refs.addFormRef.validateField(funStr[i],(errorMessage) =>{if(errorMessage)boolean = false})
          if(i === 4&&boolean)return true
        }
        return boolean
      },
      beforeLeave(activeName, oldActiveName){
        if(activeName*1 === 1||activeName*1 === 2){ // 判断用户是否要去第二个或者第三个tabs
          const result = this.addFormRefValidateField()
          if(result){
            if(this.ifChanged){
              this.getRequestCategoryList({categoryId:this.addForm.goodSelect[2],attrSel:'all'})
                .then((data) =>{
                  console.log(data)
                  const {staticData,dynamicData} = data
                  for(let i =0;i<dynamicData.length;i++){dynamicData[i].checkboxGroup = []}
                  this.addForm.goodParameter = dynamicData
                  this.addForm.goodAttr = staticData
                  this.ifChanged = false
                },(e) =>{this.$message.error('获取属性失败')})
            }
          }else{
            this.changeActiveIndex('0')
            this.$message.error('您还有未通过验证的字段')
            return result
          }
        }
      },
    },
    components: { // 解构映射到组件
      BasicInformation,
      GoodParameter,
      GoodAttribute,
      uploadImage,
      RichTextEditor
    }
  }
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
</script>
<style scoped lang=''>

</style>