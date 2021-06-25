export default {
  orderTableData:[], // 订单数组
  willUpdateGood:{}, // 将要更新的商品
  goodsSelectOptions:[], // 商品分类的级联选择器
  addForm:{
    goodName:'',
    goodPrice:null,
    goodWeight:null,
    goodNum:null,
    goodSelect:[],
    goodParameter:[], // 商品参数
    goodAttr:[], // 商品属性
    fileList:[], // 图片的数组
    richTextContent:'', // 富文本编辑器的内容
  }, // 添加的表单数据
  selectStr:'', // 查询字符串
  initGoodsData:[], // 初始化商品相关数据
  cascadeSelectorList:[], //初始的级联选择框
  staticData:[], // 静态数据
  dynamicData:[], // 动态数据
  total:0, // 总数
  value:[], // 级联选择器的值
  pagenum:1,
  sel:'only' // 初始的查询级联列表的方式
}