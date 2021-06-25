<template>
  <div>
    <el-upload
      class="upload-demo"
      action="/api/goodimgupload"
      :headers="headers"
      name = "image"
      accept="image/*"
      :on-preview="onPreview"
      :before-upload = 'beforeUpload'
      :on-success="onSuccessHandle"
      :file-list="addForm.fileList"
      :before-remove="beforeRemove"
      :on-remove="handleRemove"
      list-type="picture">
      <el-button size="small" type="primary">Giao一下</el-button>
      <div slot="tip" class="el-upload__tip">奥利给，只能上传后缀为jpeg/png/jpg/gif的文件嗷，</div>
    </el-upload>
    <BigImage :url="url" v-on:openBigImageDialog="openBigImageDialog"/>
  </div>
</template>
<script>
  import {requestImageDelete} from '../../../../../../../ajax/index'
  import BigImage from './bigImage'
  import {mapState} from 'vuex'
  export default {
    data() { // 初始化数据
      return {
        url:'',
        headers:{} // Authorization
      }
    },
    created () { // 创建完毕状态
      const Authorization = window.sessionStorage.getItem('token')
      this.headers.Authorization = Authorization
    },
    computed: { // 计算属性
      ...mapState(['addForm'])
    },
    methods: { // 定义函数
      openBigImageDialog(fun){
        this.fun = fun
      },
      // 点击文件列表中已上传的文件时的钩子
      onPreview(file){
        console.log(this.addForm.fileList)
        this.url = file.name
        this.fun()
      },
      // 删除图片的请求函数
      getRequestImageDelete({name}){
        return new Promise(async (resolve, reject) =>{
          const result = await requestImageDelete({name})
          console.log(result)
          if(result.code === 0){
            resolve(true)
          }else{
            resolve(false)
          }
        })
      },
      // 上传文件之前的钩子，
      beforeUpload(file){
        let fileName = file.name.substring(file.name.lastIndexOf('.')+1)
        let testArr = ['jpeg','png','jpg','gif']
        if(!testArr.includes(fileName)){
          this.$message.error('只支持\'jpeg\',\'png\',\'jpg\',\'gif\'四种格式的图片')
            return false
        }
      },
      // 上传成功的处理函数
      onSuccessHandle(response, file, fileList){ // 文件上传成功时的钩子
        const {code,data} = response
        console.log(response)
        if(code === 0){
          file.name = data.name
          file.url = data.url
          console.log(file)
          this.$message.success('图片上传成功')
        }else {
          if(code === 1){ this.$message.error('文件上传存储错误')}
          else if(code === 2){this.$message.error('文件上传格式错误')}
          else{this.$message.error('未知错误')}
          fileList.splice(fileList.length-1,1)
        }
        this.addForm.fileList = fileList
      },
      // 文件移出前的钩子
      async beforeRemove(file,fileList){
        return new Promise(async (resolve, reject) =>{
          const result = await this.$confirm(`此操作将永久删除${file.name}文件, 是否继续?`, '删除提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).catch(e =>{})
          if(result){ // 用户点击了删除
            console.log(file.name)
            const result = await this.getRequestImageDelete({name:file.name})
            console.log(result)
            if(result){
              this.$message.success(`删除文件${file.name}成功`)
              resolve(true)
            }else{
              this.$message.error(`删除文件${file.name}失败`)
              reject(false)
            }
          }else{
            this.$message.info('点击了取消')
            reject(false)
          }
        })
      },
      // 文件列表移除文件时的钩子
      handleRemove(file,fileList){
        this.addForm.fileList = fileList
        console.log('// 文件列表移除文件时的钩子',file,fileList,this.addForm.fileList);
      },
    },
    components: { // 解构映射到组件
      BigImage
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
