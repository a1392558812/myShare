<template>
  <div class="updateGood">
    <el-card class="updateGood-card">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>更新商品</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card style="margin-top: 20px;" class="box-card">
        <div slot="header" class="clearfix">
          <span>卡片名称</span>
          <el-button style="float: right; padding: 3px 0" type="text">更新</el-button>
        </div>
        <el-form
          label-position="left"
          label-width="100px"
          style="height: 600px;overflow-y: scroll;"
          ref="updateFormRef"
          :model="willUpdateGood" >
          <el-form-item label="商品名称">
            <el-input v-model="willUpdateGood.goodsName"></el-input>
          </el-form-item>
          <el-form-item label="商品数量">
            <el-input type="number" v-model="willUpdateGood.goodsNumber"></el-input>
          </el-form-item>
          <el-form-item label="商品价格">
            <el-input v-model="willUpdateGood.goodsPrice"></el-input>
          </el-form-item>
          <el-form-item label="商品重量">
            <el-input v-model="willUpdateGood.goodsWeight"></el-input>
          </el-form-item>
          <el-form-item label="热销数量">
            <el-input v-model="willUpdateGood.hotNumber"></el-input>
          </el-form-item>
          <el-form-item label="是否热销">
            <el-switch style="margin-left: 20px" v-model="willUpdateGood.isPromote" active-text="在热销" inactive-text="不在热销"/>
          </el-form-item>
          <el-form-item label="商品状态">
            <el-radio v-model="willUpdateGood.goodsState" label="0" border size="medium">未审核</el-radio>
            <el-radio v-model="willUpdateGood.goodsState" label="1" border size="medium">审核中</el-radio>
            <el-radio v-model="willUpdateGood.goodsState" label="2" border size="medium">已审核</el-radio>
          </el-form-item>
          <el-form-item label="修改动态参数">
            <div v-for="(item,index) in dynamicData">
              <el-tag>{{item.attrName}}</el-tag>
              <el-checkbox-group
                v-model="willUpdateGood.attrs[1][index].dynamicValue"
                :disabled="false"
                style="margin: 10px 0">
                <el-checkbox
                  v-for="(child,index) in item.attrValues"
                  :key="index"
                  :label="child"
                  style="margin: 10px 10px"
                  border/>
              </el-checkbox-group>
            </div>
          </el-form-item>
          <el-form-item label="修改图片">
            <el-upload
              class="upload-demo"
              :headers="headers"
              name = "image"
              accept="image/*"
              action="/api/goodimgupload"
              :on-remove="handleRemove"
              :before-upload = 'beforeUpload'
              :on-success="onSuccessHandle"
              :before-remove="beforeRemove"
              :file-list="fileList"
              list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-form-item>
          <el-form-item label="修改详情">
            <quill-editor
              v-model="willUpdateGood.goodsIntroduce"
              ref="Editor"
              :options="editorOption"/>
          </el-form-item>
        </el-form>
      </el-card>
    </el-card>
  </div>
</template>
<script>
  import { mapState } from 'vuex'
  /*import 'quill/dist/quill.snow.css'*/
  import { quillEditor } from 'vue-quill-editor';
  import {
    requestCategoryList,
    requestImageDelete,
    requestUpdateGoodImage } from '../../../../../ajax/index'
  export default {
    data() { // 初始化数据
      return {
        props:{
          fileList:[],
          value: '_id',
          label: 'categoryName',
        },
        editorOption: {
          placeholder: '修改一下奥利给！！！！',
          theme: 'snow',
        },
        headers:{}, // Authorization
        dynamicData:[], // 动态数据
        staticData:[], // 静态数据
      }
    },
    computed: { // 计算属性
      ...mapState(['willUpdateGood'])
    },
    created () { // 创建完毕状态
      if(!this.willUpdateGood.goodsName){
        this.$router.replace('/productslist')
      }else{
        this.headers.Authorization = window.sessionStorage.getItem('token')
        this.fileList = this.willUpdateGood.goodsImages
        this.getRequestCategoryList()
      }
    },
    methods: { // 定义函数
      // 更新图片的请求
      getRequestUpdateGoodImage(fileList,_id){
        let goodsImages = []
        let imgObj
        fileList.map((item) =>{
          imgObj = {}
          imgObj.name = item.name
          imgObj.url = item.url
          goodsImages.push(imgObj)
        })
        return new Promise(async (resolve,reject) =>{
          const result = await requestUpdateGoodImage({goodsImages,_id})
          console.log(result)
          if(result.code === 0){
            resolve(result.data)
          }else{
            reject(result.data)
          }
        })
      },
      // 删除图片的请求函数
      getRequestImageDelete({name}){
        return new Promise(async (resolve, reject) =>{
          const result = await requestImageDelete({name})
          console.log(result)
          if(result.code === 0){
            resolve(true)
          }else{
            reject(false)
          }
        })
      },
      // 上传图片前的钩子
      beforeUpload(file){
        let fileName = file.name.substring(file.name.lastIndexOf('.')+1)
        let testArr = ['jpeg','png','jpg','gif']
        if(!testArr.includes(fileName)){
          this.$message.error('只支持\'jpeg\',\'png\',\'jpg\',\'gif\'四种格式的图片')
          return false
        }
      },
      // 上传图片的钩子
      onSuccessHandle(response, file, fileList){
        const {code,data} = response
        console.log(response)
        if(code === 0){
          file.name = data.name
          file.url = data.url
          this.getRequestUpdateGoodImage(fileList,this.willUpdateGood._id)
            .then(() =>{
                this.$message.success('更新成功')
              },
              () =>{
                this.$message.error('更新失败')
                fileList.splice(fileList.length-1,1)
              })
        }else {
          if(code === 1){ this.$message.error('文件上传存储错误')}
          else if(code === 2){this.$message.error('文件上传格式错误')}
          else{this.$message.error('未知错误')}
          fileList.splice(fileList.length-1,1)
        }
        this.willUpdateGood.goodsImages = fileList
        this.fileList = fileList
        console.log(fileList)
      },
      // 删除图片前的钩子
      beforeRemove(file,fileList){
        return new Promise(async (resolve, reject) =>{
          const result = await this.$confirm(`此操作将永久删除${file.name}文件, 是否继续?`, '删除提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).catch(e =>{})
          if(result){ // 用户点击了删除
            resolve(true)
          }else{
            reject(false)
          }
        })
      },
      // 删除图片的钩子
      handleRemove(file,fileList){
        this.getRequestUpdateGoodImage(fileList,this.willUpdateGood._id)
          .then(() =>this.getRequestImageDelete({name:file.name}))
          .then(()=> this.$message.success('删除成功了'))
          .catch(e => {
            this.$message.error('删除失败')
            fileList.push(file)
          })
        this.fileList = fileList
        this.willUpdateGood.goodsImages = fileList
      },
      async getRequestCategoryList(){
        const result = await requestCategoryList({categoryId:this.willUpdateGood.categoryId,attrSel:'all'})
        if(result.code === 0){
          const {dynamicData,staticData} = result.data
          this.dynamicData = dynamicData
          this.staticData = staticData
        }
      }
    },
    components: { // 解构映射到组件
      quillEditor
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
<style scoped lang='less'>
.updateGood{
  height: 100%;
  width: 100%;
  .updateGood-card{
    height: 100%;
    width: 100%;
    .changeCategory{
      position: relative;
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
    }
  }
}
</style>