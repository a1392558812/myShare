<template>
  <div>
    <el-form-item :key="index" label-width="10"  v-for="(item,index) in addForm.goodParameter">
        <span style="margin-bottom: 5px">{{item.attrName}}</span>
        <el-checkbox-group
          :disabled="false"
          style="margin: 10px 0"
          v-model="item.checkboxGroup"
          :key="item._id">
          <el-checkbox
            style="margin: 10px 10px"
            v-for="(child,childIndex) in item.attrValues"
            :key="childIndex"
            :label="child"
            border/>
        </el-checkbox-group>
    </el-form-item>
  </div>
</template>
<script>
  import {mapState,mapGetters} from 'vuex'
  export default {
    data() { // 初始化数据
      return {

      }
    },
    created () { // 创建完毕状态

    },
    computed: { // 计算属性
      ...mapState(['addForm']),
    },
    methods: { // 定义函数

    },
    components: { // 解构映射到组件

    }
  }
</script>
<style scoped lang=''>

</style>