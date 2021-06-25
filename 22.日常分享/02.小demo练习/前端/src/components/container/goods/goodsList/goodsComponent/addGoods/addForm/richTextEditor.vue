<template>
  <div>
    <quill-editor
      v-model="addForm.richTextContent"
      ref="myQuillEditor"
      :options="editorOption"
      @blur="onEditorBlur($event)"
      @focus="onEditorFocus($event)"
      @ready="onEditorReady($event)"
      @change="onEditorChange($event)"/>
    <el-button style="margin-top: 15px" type="primary" @click="addGoodClick">添加商品</el-button>
  </div>
</template>
<script>
  import {requestAddGood} from '../../../../../../../ajax/index'
  import {mapState} from 'vuex'
  /*import 'quill/dist/quill.snow.css'*/
  import { quillEditor } from 'vue-quill-editor';
  export default {
    props:{
      addFormRef:{type:Object}
    },
    data(){
      return{
        content: ``,
        editorOption: {
          placeholder: 'hello world',
          theme: 'snow',
        }
      }
    },
    created () { // 创建完毕状态

    },
    computed: {
      ...mapState(['addForm']),
      editor() {
        return this.$refs.myQuillEditor.quill;
      },
    },
    methods: {
      getRequestAddGood(addForm){
        return new Promise(async (resolve,reject) =>{
          const result = await requestAddGood(addForm)
          console.log(result)
          if(result.code === 0){
            resolve(result.data)
          }else{
            reject(result.data)
          }
        })
      },
      // 添加商品
      addGoodClick(){
        this.addFormRef.validate((valid) =>{
          if(valid){
            this.$message.success('通过验证')
            const addForm = this.prepareFun()
            console.log(addForm)
            this.getRequestAddGood(addForm)
              .then(
                (data) =>{
                  this.$message.success('添加成功')
                  this.$router.push('/productslist')
                  console.log('添加成功',data)
                },
                (data) =>{
                  this.$message.error(data.message)
                  console.log('失败',data)
                }
              )
          }else{
            this.$message.error('验证失败')
          }
        })
        console.log(this.addForm,this.addFormRef)
      },
      prepareFun(){
        const categoryId = this.addForm.goodSelect[2]
        const goodsName = this.addForm.goodName
        const goodsPrice = this.addForm.goodPrice*1
        const goodsWeight = this.addForm.goodWeight*1
        const goodsIntroduce = this.addForm.richTextContent
        const goodsNumber =this.addForm.goodNum*1
        let attrs = [[],[]]
        let staticData
        let dynamicData
        let imgObj
        let goodsImages =[]
        for(let i=0;i<this.addForm.goodAttr.length;i++){
          staticData = {}
          staticData.staticId = this.addForm.goodAttr[i]._id
          staticData.staticValue = this.addForm.goodAttr[i].attrValues
          attrs[0].push(staticData)
        }
        for(let i=0;i<this.addForm.goodParameter.length;i++){
          dynamicData = {}
          dynamicData.dynamicId = this.addForm.goodParameter[i]._id
          dynamicData.dynamicValue = this.addForm.goodParameter[i].checkboxGroup
          attrs[1].push(dynamicData)
        }
        for (let i=0;i<this.addForm.fileList.length;i++){
          imgObj = {}
          imgObj.name = this.addForm.fileList[i].name
          imgObj.url =  this.addForm.fileList[i].url
          goodsImages.push(imgObj)
          imgObj = null
        }
        return {
          goodsName,
          goodsPrice,
          goodsWeight,
          goodsNumber,
          categoryId,
          goodsIntroduce,
          goodsImages,
          attrs
        }
      },
      onEditorReady(editor) { // 准备编辑器
        console.log(editor)
      },
      // 失去焦点事件
      onEditorBlur(e){
        console.log(e)
      },
      // 获得焦点事件
      onEditorFocus(e){
        console.log(e)
      },
      // 内容改变事件
      onEditorChange(e){
        console.log(e)
      },
      saveHtml:function(event){
        alert(this.content);
      }
    },
    components: {
      quillEditor
    },
  }
</script>
<style scoped lang='less'>

</style>