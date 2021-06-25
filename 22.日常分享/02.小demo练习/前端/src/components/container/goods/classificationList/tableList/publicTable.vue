<template>
  <div>
    <el-table ref="table" stripe border height="360" style="width: 100%" :data="TableData">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-tag
            v-for="(tag,index) in props.row.attrValues"
            :key="index"
            closable
            :disable-transitions="false"
            @close="handleClose(props.$index,index,props.row._id)">{{tag}}
          </el-tag>
          <el-input
            class="input-new-tag"
            v-if="ifVisible(props.$index)"
            maxlength=25
            v-model="tagInputValue[props.$index]"
            ref="saveTagInput" size="small"
            @keyup.enter.native="handleInputConfirm(props.$index,props.row._id)"
            @blur="handleInputConfirm(props.$index,props.row._id)" />
          <el-button
            v-else
            class="button-new-tag"
            size="small"
            @click="showInput(props.$index)">+ New Tag</el-button>
        </template>
      </el-table-column>
      <el-table-column label="#" type="index"/>
      <el-table-column label="参数名称" prop="attrName"/>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <UpdateParameter v-on:openUpdateParDialog="openUpdateParDialog"/>
  </div>
</template>
<script>
  import {requestUpdateParameter} from '../../../../../ajax/index'
  import UpdateParameter from './updateParameter'
  import {deleteFun} from './commenFun'
  import {mapGetters,mapActions,mapState} from 'vuex'
  import {checkInputValue} from '../../../../../tools/Regex'
  export default {
    props:{
      activeName:{type:String}
    },
    // 初始化数据
    data() {
      return {
        // tag输入的值
       /* update:true,*/
        tagInputValue:[],
      }
    },
    // 计算属性
    computed: {
      ifVisible(){
        return (index) =>this.TagInputVisible(this.activeName,index)
      },
      ...mapState(['value','dynamicData','staticData']),
      ...mapGetters(['DynamicData','TagInputVisible','StaticData']),
      TableData(){
        if(this.activeName === 'dynamic'){
          return this.DynamicData
        }else if(this.activeName === 'static'){
          return this.StaticData
        }
      }
    },
    /*watch:{
      activeName(){
        this.update = false
        this.$nextTick(() => {
          this.update = true
        })
      }
    },*/
    // 定义函数
    methods: {
      ...mapActions(['getRequestParameter','changeAttrValues','addAttrValues','toggleTagInputVisible']),
      reRender(){

      },
      getRequestUpdateParameterValue({_id,attrSel,attrName,attrValues}){
        return new Promise(async (resolve, reject) =>{
          const result  = await requestUpdateParameter({_id,attrSel,attrName,attrValues})
          if(result.code === 0){
            resolve(true)
          }else{
            reject(false)
          }
        })
      },
      // 将添加按钮显示为输入框
      showInput(index){
        this.toggleTagInputVisible({attrSel:this.activeName,index,bool:true})
        console.log(this.$refs.saveTagInput)
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      // 添加标签的函数
      handleInputConfirm(index,_id){
        let tagInputValue = this.tagInputValue[index];
        const {valid,message} = checkInputValue(tagInputValue)
        console.log(tagInputValue,{valid,message})
        if (valid){
          if(!message){
            let attrValues
            if(this.activeName === 'dynamic'){
              attrValues = [...this.DynamicData[index].attrValues]
            }else{
              attrValues = [...this.StaticData[index].attrValues]
            }
            attrValues.push(tagInputValue)
            this.getRequestUpdateParameterValue({_id,attrSel:this.activeName,attrValues})
              .then(() =>{
                this.$message.success('添加成功')
                this.addAttrValues({attrSel:this.activeName,index,tag:tagInputValue})
              },() =>{
                this.$message.error('网络有点故障，添加不上')
              })
          }
          this.toggleTagInputVisible({attrSel:this.activeName,index,bool:false})
          this.tagInputValue[index] = '';
        }else {
          this.$refs.saveTagInput.$refs.input.focus();
          this.$message.error(message)
        }
      },
      // 移出tag函数
      handleClose(index,tagIndex,_id){
        console.log(index,tagIndex)
        let attrValues
        if(this.activeName === 'dynamic'){
          attrValues = [...this.DynamicData[index].attrValues]
        }else{
          attrValues = [...this.StaticData[index].attrValues]
        }
        console.log('删除前',attrValues)
        attrValues.splice(tagIndex,1)
        console.log('删除后',attrValues)
        this.getRequestUpdateParameterValue({_id,attrSel:this.activeName,attrValues})
          .then(() =>{
            this.$message.success('删除成功')
            this.changeAttrValues({attrSel:this.activeName,index,tagIndex})
          },() =>{
            this.$message.success('删除失败')
          })
      },
      openUpdateParDialog(fun){
        this.updateFun = fun
      },
      handleEdit(index,value){
        this.updateFun({nowParameter:this.activeName,inputValue:value.attrName,_id:value._id})
      },
      async handleDelete(index,value){
        console.log(index,value)
        const result = await deleteFun({attrName:value.attrName,_id:value._id,attrSel:this.activeName})
        if(result){
          this.getRequestParameter({categoryId:this.value[2],attrSel:this.activeName})
          this.$message.success('删除成功')
        }else{
          this.$message.success('删除失败')
        }
      }
    },
    // 解构映射到组件
    components: {
      UpdateParameter
    }
  }
</script>
<style scoped lang='less'>
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin:10px 10px 10px 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>