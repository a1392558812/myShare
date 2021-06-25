const mongoose = require('mongoose')
const md5 = require('blueimp-md5')
const Schema = mongoose.Schema

const adminSchema = Schema({ // 定义文档约束
  username: {type: String,required: true}, // 用户名-必须
  password: {type: String, required: true}, // 密码-必须
  type:{type:Number,default: '1'}, // 类型
  modify_time: {type:Number,default:0}, // 修改日期
  create_time:{type:Number,default: Date.now}, // 创建时间
  mg_state:{type:Boolean,default:true},
  role_id: {type: String,required: true,default: '5eb95560ff566e3fc483d35f'},
  mobile: {type: String}, // 手机号
  email: {type: String}, // 邮件名称
  is_delete: {type: Boolean,default:false}, // 是否被删除
  is_active: {type: Boolean,default:false}, // 是否活跃
  token: {type: String,default:'奥利给'}, // 密匙🐴
})
const AdminModel = mongoose.model('admins', adminSchema) //定义Model（与集合一一对应）
const checkAdminModel = async () => {
  const admin = await AdminModel.findOne({
    username: 'admin001'
  })
  if (!admin) {
    const adminArr = []
    for(let i =1;i<31;i++){
      let admin = {}
      admin.username = 'admin00'+i
      admin.password = md5('Admin00'+i+'*')
      if(i>=10){
        admin.email= `13925588${i}@qq.com`
      }else{
        admin.email= `139255881${i}@qq.com`
      }
      admin.mobile= '18846155172'
      admin.type=1
      adminArr.push(admin)
    }
    await AdminModel.create(adminArr)
    console.log('初始化顾客用户: 用户名: admin001 密码为: Admin001*')
  }
}
checkAdminModel()
exports.AdminModel = AdminModel

const parentMenuSchema = Schema({ // 父级权限列表
  root_id: {type: String},
  authName: {type: String},
  level: {type: String},
  pid: {type: String},
  path: {type: String}
})
const ParentMenuModel = mongoose.model('pmenus', parentMenuSchema) //定义Model（与集合一一对应）
const checkParentMenuModel = async () => {
  const menus = await ParentMenuModel.findOne()
  if (!menus) {
    await ParentMenuModel.create([{
      root_id: '100',
      authName: '用户管理',
      level: '0',
      pid: '0',
    }, {
      root_id: '200',
      authName: '权限管理',
      level: '0',
      pid: '0',
    }, {
      root_id: '300',
      authName: '商品管理',
      level: '0',
      pid: '0',
    }, {
      root_id: '400',
      authName: '订单管理',
      level: '0',
      pid: '0',
    }, {
      root_id: '500',
      authName: '数据管理',
      level: '0',
      pid: '0',
    }])
    console.log('初始化数据完成')
  }
}
checkParentMenuModel()
exports.ParentMenuModel = ParentMenuModel


const childMenuSchema = Schema({
  root_id: {type: String,required: true},
  level: {type: String},
  parentId: {type: String,required: true},// 父级分类id
  authName: { type: String,required: true},// 权限名称
  path: {type: String}
})
const ChildMenuModel = mongoose.model('cmenus', childMenuSchema) //定义Model（与集合一一对应）
const checkChildMenuModel = async () => {
  const childMenus = await ChildMenuModel.findOne()
  if (!childMenus) {
    await ChildMenuModel.create([
      {root_id: 110,parentId: 100,level: '1',path:'/user',authName: '用户列表'},
      {root_id: 210,parentId: 200,level: '1',path:'/roles',authName: '角色列表'},
      {root_id: 220,parentId: 200,level: '1',path:'/root',authName: '权限列表'},
      {root_id: 310,parentId: 300,level: '1',path:'/productslist',authName: '商品列表'},
      {root_id: 320,parentId: 300,level: '1',path:'/categorylist',authName: '分类列表'},
      {root_id: 330,parentId: 300,level: '1',path:'/productscategory',authName: '商品分类'},
      {root_id: 410,parentId: 400,level: '1',path:'/orderlist',authName: '订单列表'},
      {root_id: 510,parentId: 500,level: '1',path:'/datelist',authName: '数据报表'},
    ])
    console.log('二级分类初始化')
  }
}
checkChildMenuModel()
exports.ChildMenuModel = ChildMenuModel

const roleSchema = Schema({
  role_name: {type: String,default:'炒鸡管理员'}, // 权限名称
  role_desc:{type: String,default:'太顶了'}, // 权限描述
  role_root:{type:Object,default:{
    '100':[110],
    '200':[210,220,],
    '300':[310,320,330],
    '400':[410],
    '500':[510],
    }}
})
const RoleModel = mongoose.model('roles', roleSchema) //定义Model（与集合一一对应）
const checkRoleModel = async () => {
  const Roles= await RoleModel.findOne()
  if(!Roles){
    await RoleModel.create([
      {role_name:'项目经理',role_desc:'有1点捞',role_root:{
          '100':[110],
          '200':[210,220,],
          '300':[310,320,330],
          '400':[410],
          '500':[510]
        }},
      {role_name:'秘书',role_desc:'有2点捞',role_root:{
          '100':[],
          '200':[210,220,],
          '300':[310,320,330],
          '400':[],
          '500':[],
        }},
      {role_name:'后勤老哥',role_desc:'有3点捞',role_root:{
          '100':[110],
          '200':[],
          '300':[310,320,330],
          '400':[410],
          '500':[],
        }},
      {role_name:'大堂经理',role_desc:'有4点捞',role_root:{
          '100':[110],
          '200':[220,],
          '300':[310,320,330],
          '400':[],
          '500':[]
        }},
      {role_name:'孤独的美食家',role_desc:'有5点捞',role_root:{
          '100':[110],
          '200':[210],
          '300':[310,330],
          '400':[410],
          '500':[],
        }},
      {role_name:'test001',role_desc:'desc-test001',role_root:{
          '100':[110],
          '200':[210],
          '300':[310,330],
          '400':[410],
          '500':[],
        }},
      {role_name:'test002',role_desc:'desc-test002',role_root:{
          '100':[110],
          '200':[210],
          '300':[310,330],
          '400':[410],
          '500':[],
        }},
      {role_name:'test003',role_desc:'desc-test003',role_root:{
          '100':[110],
          '200':[210],
          '300':[310,330],
          '400':[410],
          '500':[],
        }},
    ])
  }
}
checkRoleModel()
exports.RoleModel = RoleModel

const firstLevelCategory = Schema({
  categoryName:{type:String},
  fatherCategoryId:{type:String,default:'0'},
  categoryDeleted:{type:Boolean,default:false},
  categoryLevel:{type:Number,delete: 0},
})
const secondLevelCategory = Schema({
  categoryName:{type:String},
  fatherCategoryId:{type:String,default:'0'},
  categoryDeleted:{type:Boolean,default:false},
  categoryLevel:{type:Number,delete: 1},
})
const thirdLevelCategory = Schema({
  categoryName:{type:String},
  categoryDeleted:{type:Boolean,default:false},
  fatherCategoryId:{type:String,default:'0'},
  categoryLevel:{type:Number,delete: 2},
})
const firstLevelCategoryModel = mongoose.model('1thCategorys', firstLevelCategory)
const secondLevelCategoryModel = mongoose.model('2thCategorys', secondLevelCategory)
const thirdLevelCategoryModel = mongoose.model('3thCategorys', thirdLevelCategory)
const allCategoryModel = async () =>{
  const result1 = await firstLevelCategoryModel.findOne()
  const result2 = await secondLevelCategoryModel.findOne()
  const result3 = await thirdLevelCategoryModel.findOne()
  if(!(result1 || result2 || result3)){
    const firstLevelCreateArr = []
    let initFirstLevelCreateObj = {}
    let index = 0
    for(let i=0;i<150;i++){
      index++
      initFirstLevelCreateObj = {}
      initFirstLevelCreateObj = {categoryName:'',fatherCategoryId:'0',categoryLevel:0,children:[]}
      initFirstLevelCreateObj.categoryName = `一级test分类--${index}`
      firstLevelCreateArr.push(initFirstLevelCreateObj)
    }
    try {
      const firstArr = await firstLevelCategoryModel.create(firstLevelCreateArr)
      let secondLevelCreateArr = []
      let initSecondLevelCreateObj = {}
      let index1 = 0
      for(let m=0;m<firstArr.length;m++){
        let fatherCategoryId = firstArr[m]._id
        for(let k=0;k<5;k++){
          index1++
          initSecondLevelCreateObj = {}
          initSecondLevelCreateObj = {categoryName:'',fatherCategoryId,categoryLevel:1,children:[]}
          initSecondLevelCreateObj.categoryName = `二级test分类--${index1}`
          secondLevelCreateArr.push(initSecondLevelCreateObj)
        }
      }
      const secondArr = await secondLevelCategoryModel.create(secondLevelCreateArr)
      let thirdLevelCreateArr = []
      let initThirdLevelCreateObj = {}
      let index2 = 0
      for(let j=0;j<secondArr.length;j++){
        let fatherCategoryId = secondArr[j]._id
        for(let a = 0;a<5;a++){
          index2++
          initThirdLevelCreateObj = {}
          initThirdLevelCreateObj = {categoryName:'',fatherCategoryId,categoryLevel:2,}
          initThirdLevelCreateObj.categoryName = `三级test分类--${index2}`
          thirdLevelCreateArr.push(initThirdLevelCreateObj)
        }
      }
      await thirdLevelCategoryModel.create(thirdLevelCreateArr)
      console.log("分类初始化完成")
    }catch (e) {
      return e
    }
  }else{
    console.log("分类已存在")
  }
}
allCategoryModel()

exports.firstLevelCategoryModel = firstLevelCategoryModel
exports.secondLevelCategoryModel = secondLevelCategoryModel
exports.thirdLevelCategoryModel = thirdLevelCategoryModel

/* DynamicParameter and StaticParameter */
const dynamicParameterSchema = Schema({
  attrName: {type: String},
  categoryId:{type: String},
  attrSel:{type:String,default:'many'},
  attrWrite:{type:String,default:'list'},
  attrValues:{type:Array,default:['人工智能55时4K观影曲面','30核HDR55时4K超薄曲面', '人工智能65时4K超薄曲面','人工智能']}
})
const staticParameterSchema = Schema({
  attrName: {type: String},
  categoryId:{type: String},
  attrSel:{type:String,default:'only'},
  attrWrite:{type:String,default:"manual"},
  attrValues:{type:Array,default:['👿','😀','😁','😂','👌','🐷','👴','👨','💨']}
})
const StaticParameterModel = mongoose.model('staticParameters', staticParameterSchema)
const DynamicParameterModel = mongoose.model('dynamicParameters', dynamicParameterSchema)
const checkParameterModel = async () => {
  const result1 = await StaticParameterModel.findOne()
  const result2 = await DynamicParameterModel.findOne()
  if(!(result1&&result2)){
    const third = await thirdLevelCategoryModel.find()
    if(third[0]){
      let StaticArr = []
      let DynamicArr = []
      let StaticValueObj = {}
      let value2
      for(let i = 0;i< third.length;i++){
        for(let l = 1;l<10;l++){
          StaticValueObj['StaticValue'+l] = {}
        }
        value2 = {}
        const categoryId = third[i]._id
        StaticValueObj.StaticValue1 = {
          attrName: `${i}--|主体-商品名称`,
          categoryId,
          attrSel: "only",
          attrWrite: "manual",
          attrValues: [`${i}--|老八秘制小汉堡🍔`]
        }
        StaticValueObj.StaticValue2 = {
          attrName: `${i}--|显示-曲面`,
          categoryId,
          attrSel: "only",
          attrWrite: "manual",
          attrValues: [`${i}--|臭豆腐`]
        }
        StaticValueObj.StaticValue3 = {
          attrName: `${i}--|系统-智能电视`,
          categoryId,
          attrSel: "only",
          attrWrite: "manual",
          attrValues: [`${i}--|俘虏`]
        }
        StaticValueObj.StaticValue4 ={
          attrName: `${i}--|外观-壁挂安装`,
          categoryId,
          attrSel: "only",
          attrWrite: "manual",
          attrValues: [`${i}--|老干妈`]
        }
        StaticValueObj.StaticValue5 = {
          attrName: `${i}--|功耗-整体功率(W)`,
          categoryId,
          attrSel: "only",
          attrWrite: "manual",
          attrValues: [`${i}--|加柠檬🍋`]
        }
        StaticValueObj.StaticValue6 = {
          attrName: `${i}--|端口-模拟RF接口`,
          categoryId,
          attrSel: "only",
          attrWrite: "manual",
          attrValues: [`${i}--|嘎嘣脆的`]
        }
        StaticValueObj.StaticValue7 = {
          attrName: `${i}--|音频-扬声器数量`,
          categoryId,
          attrSel: "only",
          attrWrite: "manual",
          attrValues: [`${i}--|海带丝儿`]
        }
        StaticValueObj.StaticValue8 = {
          attrName: `${i}--|交互设备-无线键鼠`,
          categoryId,
          attrSel: "only",
          attrWrite: "manual",
          attrValues: [`${i}--|肉旧`]
        }
        StaticValueObj.StaticValue9 = {
          attrName: `${i}--|互联互通-多屏互动`,
          categoryId,
          attrSel: "only",
          attrWrite: "manual",
          attrValues: [`${i}--|韭菜花`]
        }
        for(let item in StaticValueObj){
          StaticArr.push(StaticValueObj[item])
        }

        value2 ={
          attrName: `${i}--|版式`,
          categoryId,
          attrSel: "many",
          attrWrite: "list",
          attrValues: [`${i}--|人工智能55时4K观影曲面`,`${i}--|30核HDR55时4K超薄曲面`, `${i}--|人工智能65时4K超薄曲面`,`${i}--|人工智能`]
        }
        DynamicArr.push(value2)
      }
      await StaticParameterModel.create(StaticArr)
      await DynamicParameterModel.create(DynamicArr)
      console.log('分类参数初始化完成')
    }else{
      throw '出错了ヾ(≧O≦)〃嗷~！！！！'
    }
  }
}
checkParameterModel()
exports.StaticParameterModel = StaticParameterModel
exports.DynamicParameterModel = DynamicParameterModel

const goodsSchema = Schema({
  goodsName:{type:String}, // 商品名称
  goodsPrice:{type:Number,default:100},// 商品价格
  categoryId:{type:String}, // 分类ID
  goodsNumber:{type:Number,default:500}, // 商品数量
  goodsWeight:{type:Number,default: 250}, // 商品重量
  goodsIntroduce:{type:String,default: '一日三餐没烦恼，就吃老八秘制小汉堡🍔，既实惠，还管饱'}, // 商品介绍
  goodsState:{type:Number,default: 2}, // 商品状态   0 未审核，1审核中，2已审核
  addTime:{type:Number,default: Date.now}, // 添加时间
  updateTime:{type:Number}, // 更新时间
  hotNumber:{type:Number,default: 1}, // 热销数量
  isPromote:{type:Boolean,default: true}, // 是否热销
  goodsImages:{type:Array,default:[]}, // 商品照片
  attrs:{type:Array,default:[[],[]]}, // 商品的参数（数组），包含 "动态参数" 和 "静态属性"
})
const GoodsModel = mongoose.model('goods', goodsSchema)
const checkGoods = async () =>{
  const result = await GoodsModel.findOne()
  if(!result){
    const thirdLevelArr = await thirdLevelCategoryModel.find()
    let createArr = []
    let createObj
    let categoryId
    for(let i=0;i<thirdLevelArr.length;i++){
      createObj = {}
      categoryId = thirdLevelArr[i]._id
      let StaticArr = []
      let StaticResult = await StaticParameterModel.find({categoryId})
      let StaticObj
      StaticResult.map((item) =>{
        StaticObj = {}
        StaticObj.staticValue = item.attrValues
        StaticObj.staticId = item._id
        StaticArr.push(StaticObj)
      })
      let DynamicArr = []
      let DynamicResult = await DynamicParameterModel.find({categoryId})
      let DynamicObj
      DynamicResult.map((item,index) =>{
        DynamicObj = {}
        DynamicObj.dynamicValue = item.attrValues
        DynamicObj.dynamicId = item._id
        DynamicArr.push(DynamicObj)
      })
      for(let k=0;k<6;k++){
        createObj = {
          goodsName:`${i}--|测试汉堡🍔|--${k}`,
          goodsPrice:100,// 商品价格
          categoryId, // 分类ID
          goodsNumber:500, // 商品数量
          addTime:Date.now(),
          goodsWeight:250, // 商品重量
          goodsIntroduce:`(${i},${k})--|一日三餐没烦恼，就吃老八秘制小汉堡🍔，既实惠，还管饱`, // 商品介绍
          goodsState:2, // 商品状态   0 未审核，1审核中，2已审核
          hotNumber:100, // 热销数量
          isPromote:true, // 是否热销
          goodsImages:[], // 商品照片
          attrs:[StaticArr,DynamicArr], // 商品的参数（数组），包含 "动态参数" 和 "静态属性"
        }
        createArr.push(createObj)
      }
    }
    const data = await GoodsModel.create(createArr)
    if(data){
      console.log('初始化商品成功',data.length)
    }else{
      console.log('初始化商品失败')
    }
  }
}
checkGoods()
exports.GoodsModel = GoodsModel

const orderSchema = Schema({
  user_id:{type:String}, // 用户ID
  order_number:{type:String,default:'订单-'+md5(Date.now)},
  order_price:{type:Number,default:20},
  order_pay: {type:String,default:'0'},// 订单支付	支付方式 0 未支付 1 支付宝 2 微信 3 银行卡
  is_send: {type:String,default:'1'}, // 1:已经发货，0:未发货
  trade_no: {type:String,default:''},
  order_fapiao_title: {type:String,default:'个人'},
  order_fapiao_content: {type:String,default:'办公用品'},
  order_fapiao_company: {type:String,default:''},
  consignee_addr: {type:String,default:''},
  pay_status: {type:String,default:'0'},// 支付状态	订单状态： 0 未付款、1 已付款
  create_time: {type:Number,default:Date.now},
  update_time: {type:Number},
  goods:{type:Array,default:[]}
})
const OrderModel = mongoose.model('orders', orderSchema)
const checkOrder = async () =>{
  const result = await OrderModel.findOne()
  if(!result){
    console.log('正在初始化订单')
    let createArr = []
    let obj
    for(let i=1;i<2000;i++){
      obj = {}
      obj.order_number = `${i}-订单--${md5(`${i}-${i}`)}`
      obj.user_id = i
      createArr.push(obj)
      obj = null
    }
    const result = await OrderModel.create(createArr)
    if(result){
      console.log('初始化订单完成')
    }else{
      console.log('初始化订单失败')
    }
  }else{
    console.log('存在订单')
  }
}
checkOrder()
exports.OrderModel = OrderModel

const kuaidiSchema = Schema({
  orderId:{type:String},
  time: {type:Number,default:Date.now},
  ftime: {type:Number,default:0},
  context: {type:String,default:"已签收,感谢使用顺丰,期待再次为您服务",},
  location: {type:String,default:""},
})
const KuaidiModel = mongoose.model('kuaidis', kuaidiSchema)
const checkKuaidi = async () =>{
  const result = await KuaidiModel.findOne()
  if(!result){
    try {
      let obj = {}
      let createArr = []
      const data = await OrderModel.find({},{id:1})
      for (let i=0;i<data.length;i++){
        for(let k = 0;k<10;k++){
          obj.time = Date.now()-100000
          obj.ftime = Date.now()-10000
          obj.orderId = data[i]._id
          obj.context =`${i}--${k}已签收,感谢使用顺丰,期待再次为您服务`
          createArr.push(obj)
          obj = {}
        }
      }
      await KuaidiModel.create(createArr)
      console.log('物流初始化完成')
    }catch (e) {
      console.log('物流初始化失败',e)
    }
  }else{
    console.log('物流已经存在')
  }
}
checkKuaidi()
exports.KuaidiModel = KuaidiModel


