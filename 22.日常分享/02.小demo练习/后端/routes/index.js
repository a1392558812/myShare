var express = require('express');
var router = express.Router();
const JwtUtil = require('../utils/jwt')
const md5 = require('blueimp-md5')
const {
  AdminModel,
  ParentMenuModel, // 父级菜单
  ChildMenuModel, // 子级菜单
  RoleModel,// 权限列表
  firstLevelCategoryModel, // 一级分类列表
  secondLevelCategoryModel,// 二级分类列表
  thirdLevelCategoryModel, // 三级分类列表
  StaticParameterModel,
  DynamicParameterModel,
  GoodsModel,
  OrderModel,
  KuaidiModel
} = require("../module/module")

const menus = () =>{
  return new Promise(async (resolve, reject)=>{
    let menus = await ParentMenuModel.find()
    if (menus) {
      for (let i = 0; i < menus.length; i++) {
        menus[i] = menus[i].toObject()
        let parentId = menus[i].root_id
        let result = await ChildMenuModel.find({parentId})
        if (result) {
          menus[i].children = result
        }else{
          menus[i].children = []
        }
      }
      const data = menus
      resolve(data)
    } else {
      reject()
    }
  })
}
router.post('/login', async (req, res) => {
  const {username,password} = req.body
  try {
    const result = await AdminModel.findOne({username,password: md5(password)})
    if (result) { // 登陆成功，添加token验证
      let secret = result._id + result.password
      let jwt = new JwtUtil(secret); // 将用户secret传入并生成token
      let token = jwt.generateToken();
      console.log(token)
      const admin = await AdminModel.findOneAndUpdate({username}, {token})
      if (admin) {
        const _id = admin._id// 将 token 返回给客户端
        res.send({ code: 0,data: { message: '登陆成功',token,_id}})
      } else {
        res.send({code: 1,data: {message: 'token设置失败',token}})
      }
    } else {
      res.send({code: 1,data: {message: '账号或密码错误'}})
    }
  } catch (e) {
    res.send({code: 1,data: {message: '网络故障了emmmm'}})
  }
});
router.get('/menus', async (req, res) => {
  try {
    menus().then(
      (data) =>{
        res.send({code:0,data})
      },
      () =>{
        res.send({code:1})
      }
      )
  } catch (e) {
    res.send({code: 1})
  }
})

const user = () => {
  router.get('/users', async (req, res) => {
    const {pagenum,pagesize} = req.query // query查询参数,pagenum当前页码,pagesize每页显示条数
    console.log(req.query)
    const usernameStr = req.query.query
    let condition = {}
    if (usernameStr){
       condition = {username:{
         '$ne': 'admin001',
         '$regex':new RegExp(`^.*${usernameStr}.*$`)
       },is_delete:false}
    } else{
      condition = {username: {'$ne': 'admin001'},is_delete:false}
    }
    const sort = {"_id": 1} // 排序
    const skip = (pagenum - 1) * pagesize // 跳过数
    try {
      const total = await AdminModel.countDocuments(condition)-1
      const userArr = await AdminModel.find(condition, {password: 0,token: 0}, {skip,limit: pagesize * 1,sort})
      if(userArr){
        let users = []
        for(let i=0;i<userArr.length;i++){
          let userObj = {}
          let rootObj = {}
          let _id = userArr[i].role_id
          let root = await RoleModel.findOne({_id},{_id:0})
          if(root){
            userObj = userArr[i].toObject()
            rootObj = root.toObject()
            users.push(Object.assign(userObj, rootObj))
          }
        }
        const data = {total,pagenum,users}
        res.send({code: 0,data})
      }else{
        res.send({code: 1,data: {message: '请求失败了'}})
      }
    } catch (e) {
      res.send({code: 1,data: {message: '网络出错了'}})
    }
  })
  router.post('/updateusers', async (req, res) => {
    const {_id,mg_state,email,mobile,role_id} = req.body
    console.log(_id,mg_state,email,mobile)
    let condition
    const modify_time = Date.now()
    if(email){
      condition = {email,mobile,modify_time}
    }else if(role_id){
      condition = {role_id,modify_time}
    }else{
      condition = {mg_state,modify_time}
    }
    try {
      let data = await AdminModel.findOneAndUpdate({_id}, condition)
      console.log(data)
      if (data) {
        data = data.toObject()
        delete data.password
        delete data.token
        data.mg_state = mg_state
        res.send({code: 0,data})
      } else {
        res.send({code: 1,data: {message: '修改出错了，👿'}})
      }
    } catch (e) {
      res.send({
        code: 1,
        data: {message: '网络出错了，👿'}
      })
    }
  })
  router.post('/adduser',async (req, res) =>{
    const {username,password,email,mobile} = req.body
    try{
      const user = await AdminModel.findOne({username})
      if(user){
        res.send({code:2,data:{message:'该账号已被人使用了'}})
      }else{
        const result = await AdminModel.create({username,password,email,mobile})
        if(result){
          res.send({code:0,data:result})
        }else{
          res.send({code:1,data:{message:'添加失败了'}})
        }
      }
    }catch (e) {
      res.send({code:1})
    }
  })
  router.post('/deleteuser',async (req, res) =>{
    const {_id} = req.body
    try{
      const result = await AdminModel.findOneAndUpdate({_id},{is_delete:true})
      if(result){
        res.send({code:0})
      }else{
        res.send({code:1,data:{message:'该用户不存在'}})
      }
    }catch (e) {
      res.send({code:1,data:{message:'网络故障👏了'+e}})
    }
  })
  router.get('/rootlist',async (req,res) =>{
    try{
      const data = await RoleModel.find()
      if(data){
        res.send({code:0,data})
      }else{
        res.send({code:1,data:{message:"请求失败了"}})
      }
    }catch (e) {
      res.send({code:1,data:{message:"网络失败了"}})
    }
  })
}
const root = () =>{
  router.get('/rightslist',async (req,res) =>{
    try {
      const result1 = await ParentMenuModel.find()
      const result2 = await ChildMenuModel.find()
      if(result1 && result2){
        const data = [...result1,...result2]
        res.send({code:0,data})
      }else{
        res.send({code:1,data:{message:'查询失败了'}})
      }
    }catch (e) {
      res.send({code:1,data:{message:'请求出错了'}})
    }
  })
  router.get('/roles',async (req,res) =>{
    try{
      let data = []
      const result = await RoleModel.find()
      if(result){
        for(let i=0;i<result.length;i++){
          let roleRootObj = result[i].role_root // 父级id
          let role = result[i].toObject() // 转换文档对象
          role.children = []
          for(let key in roleRootObj){
            let fatherObj = {}
            let fatherRoot = await ParentMenuModel.findOne({root_id:key})
            fatherObj = fatherRoot.toObject()
            fatherObj.children = []
            for(let m = 0;m <roleRootObj[key].length;m ++){
              const value = await ChildMenuModel.findOne({root_id:roleRootObj[key][m]})
              fatherObj.children.push(value)
            }
            role.children.push(fatherObj)
          }
          data.push(role)
        }
        res.send({code:0,data})
      }else{
        res.send({code:1,data:{message:'查询出错了'}})
      }
    }catch (e) {
      res.send({code:1,data:{message:'网络出错了emmmm'}})
    }
  })
  router.post('/updateroles',async (req,res) =>{
    const {_id,role_root,role_name,role_desc} = req.body
    let condition
    if(role_root){
      condition = {role_root}
    }else if(role_name){
      condition = {role_name}
    }else{
      condition = {role_desc}
    }
    try{
      const result = await RoleModel.findOneAndUpdate({_id},condition)
      if(result){
        res.send({code:0})
      }else{
        res.send({code:1,data:{message:'修改出错了'}})
      }
    }catch (e) {
      res.send({code:1,data:{message:'修改权限的网络出错了'}})
    }
  })
  router.get('/allrolelist',async (req,res) =>{
    try {
      menus().then(
        (data) =>{
          res.send({code:0,data})
        },
        () =>{
          res.send({code:1})
        })
    }catch (e) {
      res.send({code:1,data:{message:'网络出错了，嘤嘤嘤'}})
    }
  })
}
const category = () =>{
  const first = (condition,options,orders) =>{
    return new Promise(async (resolve, reject) =>{
      const result = await firstLevelCategoryModel.find(condition,options,orders)
      const total = await firstLevelCategoryModel.countDocuments()
      if(result){
        let data = []
        let obj = {}
        for(let i=0;i<result.length;i++){
          obj = result[i].toObject()
          obj.children = await second(obj)
          data.push(obj)
        }
        resolve({data,total})
      }else{
        reject('一级列表获取失败')
      }
    })
  }
  const second = (firstObj) =>{
    return new Promise(async (resolve, reject) =>{
      let fatherCategoryId = firstObj._id
      const result = await secondLevelCategoryModel.find({fatherCategoryId},{},{"_id": -1})
      if(result){
        let data = []
        let obj = {}
        for(let i=0;i<result.length;i++){
          obj = result[i].toObject()
          obj.children = await third(obj)
          data.push(obj)
        }
        resolve(data)
      }else{
        reject('二级列表获取失败')
      }
    })
  }
  const third = (secondObj) =>{
    return new Promise( async (resolve, reject) =>{
      let fatherCategoryId = secondObj._id
      const result = await thirdLevelCategoryModel.find({fatherCategoryId},{},{"_id": -1})
      if(result){
        resolve(result)
      }else{
        reject('三级列表查询失败')
      }
    })

  }
  router.get('/categorylist',(req,res) =>{
    const {pagenum,pagesize} = req.query
    const sort = {"_id": -1} // 排序
    const skip = (pagenum - 1) * pagesize // 跳过数
    first({},{},{skip,limit: pagesize * 1,sort})
      .then(
        (data) =>{
        res.send({code:0,data})
      },
      (err) =>{
        res.send({code:1,data:{message:err}})
       })
  })
  router.post('/addcategory',async (req,res) =>{
    const {categoryName,fatherCategoryId,categoryLevel} = req.body
    let result
    if(categoryLevel*1===0){
      result = await firstLevelCategoryModel.create({categoryName,fatherCategoryId,categoryLevel})
    }else if(categoryLevel*1 === 1){
      result = await secondLevelCategoryModel.create({categoryName,fatherCategoryId,categoryLevel})
    }else{
      result = await thirdLevelCategoryModel.create({categoryName,fatherCategoryId,categoryLevel:2})
    }
    if(result){
      res.send({code:0})
    }else{
      res.send({code:0,data:{message:'创建失败了'}})
    }
  })
  const updateFun = async (Model,findObj,updateObj,res) =>{
    const result = await Model.findOneAndUpdate(findObj,updateObj)
    if(result){
      res.send({code:0})
    }else{
      res.send({code:1,data:{message:'更新失败了'}})
    }
  }
  router.post('/updatecategory',(req,res) =>{
    const {_id,categoryLevel,categoryName,categoryDeleted} = req.body
    console.log({_id,categoryLevel,categoryName,categoryDeleted})
    try{
      let callBack
      if(categoryLevel*1 === 0){
        callBack = firstLevelCategoryModel
      }else if(categoryLevel*1 === 1){
        callBack = secondLevelCategoryModel
      }else if(categoryLevel*1 === 2){
        callBack = thirdLevelCategoryModel
      }else{
        return res.send({code:1,data:{message:'更新分类等级出错了'}})
      }
      updateFun(callBack,{_id},{categoryName,categoryDeleted},res)
    }catch (e) {
      res.send({code:1,data:{message:'网络出错了'}})
    }
  })
  router.get("/getcategorynumber", async (req,res) =>{
    const {level,pagenum,pagesize,fatherCategoryId} = req.query
    console.log(level,pagenum,pagesize,fatherCategoryId)
    try {
      if(level*1 === 0){ // 获取一级分类
        const sort = {"_id": -1} // 排序
        const skip = (pagenum - 1) * pagesize // 跳过数
        const result = await firstLevelCategoryModel.find({},{},{skip,limit: pagesize * 1,sort})
        const total = await firstLevelCategoryModel.countDocuments()
        if(result&&total){
          res.send({code:0,data:{result,total}})
        }else{
          res.send({code:1,data:{message:'一级列表查询失败'}})
        }
      }else if(level*1 === 1&&fatherCategoryId){ // 获取二级分类
        const result =  await secondLevelCategoryModel.find({fatherCategoryId},{},{"_id": -1})
        if(result){
          res.send({code:0,data:result})
        }else{
          res.send({code:1,data:{message:'2级列表查询失败'}})
        }
      }else if(level*1 === 2&&fatherCategoryId){ // 获取三级分类
        const result =  await thirdLevelCategoryModel.find({fatherCategoryId},{},{"_id": -1})
        if(result){
          res.send({code:0,data:result})
        }else{
          res.send({code:1,data:{message:'3级列表查询失败'}})
        }
      }else{
        res.send({code:1,data:{message:'请求参数不正确'}})
      }
    }catch (e) {
      res.send('服务器出错了')
    }
  })
}
const parameters = () =>{
  const parameter = async (Model,categoryId,res) =>{
    const data = await Model.find(categoryId)
    if(data){
      res.send({code:0,data})
    }else{
      res.send({code:1,data:{message:'查询失败了'}})
    }
  }
  router.get('/parameterslist',async (req,res) =>{
    const {categoryId,attrSel} = req.query
    if(attrSel === 'static'){
      parameter(StaticParameterModel,{categoryId},res)
    }else if(attrSel === 'dynamic'){
      parameter(DynamicParameterModel,{categoryId},res)
    }else if(attrSel === 'all'){
      try {
        const staticData = await StaticParameterModel.find({categoryId})
        const dynamicData = await DynamicParameterModel.find({categoryId})
        if(staticData||dynamicData){
          res.send({code:0,data:{staticData,dynamicData}})
        }else{
          res.send({code:1,data:{message:'查询失败了'}})
        }
      }catch (e) {
        res.send({code:1,data:{message:'服务器出错了'}})
      }
    }else{
      res.send({code:1,data:{message:'请求参数出错了'}})
    }
  })
  const addParameter = async (Model,options,res) =>{
    const data = await Model.create(options)
    if(data){
      res.send({code:0})
    }else{
      res.send({code:1,data:{message:'添加失败了'}})
    }
  }
  router.post('/addparameter',(req,res) =>{
    const {categoryId,attrSel,attrName} = req.body
    const options = {categoryId,attrName}
    if(attrSel === 'static'){
      addParameter(StaticParameterModel,options,res)
    }else if(attrSel === 'dynamic'){
      addParameter(DynamicParameterModel,options,res)
    }else{
      res.send({code:1,data:{message:'请求参数不正确'}})
    }
  })
  const updateParameter = async (Model,findOptions,updateOptions,res) =>{
    const data = await Model.findOneAndUpdate(findOptions,updateOptions)
    if(data){
      res.send({code:0})
    }else{
      res.send({code:1,data:{message:'跟新失败了'}})
    }
  }
  router.post('/updateparameter',(req,res) =>{
    const {_id,attrSel,attrName,attrValues} = req.body
    let updateOptions
    if(attrName&&attrValues){
      return res.send({code:1,data:{message:'请求参数不正确'}})
    }
    if(attrName){
      updateOptions = {attrName}
    }else{
      updateOptions = {attrValues}
    }
    console.log(updateOptions)
    const findOptions = {_id}
    if(attrSel === 'static'){
      updateParameter(StaticParameterModel,findOptions,updateOptions,res)
    }else if(attrSel === 'dynamic'){
      updateParameter(DynamicParameterModel,findOptions,updateOptions,res)
    }else{
      res.send({code:1,data:{message:'请求参数不正确'}})
    }
  })
  const deleteParameter = async (Model,Options,res) =>{
    const result = await Model.deleteOne(Options)
    console.log('deleteParameter',result)
    if(result){
      res.send({code:0})
    }else{
      res.send({code:1,data:{message:'删除失败了'}})
    }
  }
  router.post('/deleteparameter',(req,res) =>{
    const {_id,attrSel} = req.body
    console.log({_id,attrSel})
    if(attrSel === 'static'){
      deleteParameter(StaticParameterModel,{_id},res)
    }else if(attrSel === 'dynamic'){
      deleteParameter(DynamicParameterModel,{_id},res)
    }else{
      res.send({code:1,data:{message:'请求参数不正确'}})
    }
  })
}
const goods = () =>{
  router.get('/goodslist',async (req,res) =>{
    const {pagenum,pagesize,selectStr} = req.query
    console.log(pagenum,selectStr,pagesize,)
    if(!(pagenum && pagesize)){
      return res.send({code:1,data:{message:'请求参数出错了'}})
    }else{
      try{
        let option
        if(selectStr){
          option = {goodsName:new RegExp(`^.*${selectStr}.*$`)}
        }else{
          option = {}
        }
        console.log(option)
        const sort = {"_id": -1} // 排序
        const skip = (pagenum - 1) * pagesize // 跳过数
        const goods = await GoodsModel.find(option,{},{skip,limit: pagesize * 1,sort})
        const total = await GoodsModel.countDocuments(option)
        console.log(goods)
        res.send({code:0,data:{total,pagenum,goods}})
      }catch (e) {
        return res.send({code:1,data:{message:'服务器出错了'}})
      }
    }
  })
  router.post('/deletegood',async (req,res) =>{
    const _id = req.body._id
    if(_id){
      try {
        const result = await GoodsModel.deleteOne({_id})
        if(result){
          res.send({code:0})
        }else{
          res.send({code:1,data:{message:'删除失败'}})
        }
      }catch (e) {
        res.send({code:1,data:{message:'服务器运行失败'}})
      }
    }else{
      res.send({code:1,data:{message:'参数传递失败'}})
    }
  })
  router.post('/addgood',async (req,res) =>{
    const addForm = req.body
    try {
      const result = await GoodsModel.findOne({goodsName:addForm.goodsName})
      if(result){
        res.send({code:2,data:{message:'该商品名称已存在'}})
      }else{
        const data = await GoodsModel.create(addForm)
        if(data){
          res.send({code:0,data})
        }else{
          res.send({code:3,data:{message:'添加失败了'}})
        }
      }
    }catch (e) {
      res.send({code:1,data:{message:'服务器出错了'}})
    }
  })
  router.post('/updategoodimage',async (req,res) =>{
    const {goodsImages,_id} = req.body
    if(goodsImages&&_id){
      try {
        const result = await GoodsModel.findOneAndUpdate({_id},{goodsImages})
        if(result){
          res.send({code:0,data:result})
        }else{
          res.send({code:1,data:{message:'更新出错了'}})
        }
      }catch (e) {
        res.send({code:1,data:{message:'服务器出错了'}})
      }
    }else{
      res.send({code:1,data:{message:'参数不正确'}})
    }
  })
}
const fileUpload = () =>{
  const multer = require('multer')
  const path = require('path')
  const fs = require('fs')
  const absolutePath = path.join(__dirname, '..', 'public/upload')
  const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      const ifExists = fs.existsSync(absolutePath)
      if (!ifExists) {
        await fs.mkdir(absolutePath, (error) => {
          if (!error) {
            cb(null, absolutePath)
          } else {
            console.log('异步的方式创建文件目录失败')
          }
        })
      } else {
        cb(null, absolutePath)
      }
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
  })
  const imageFilter = function(req, file, cb){ // 文件过滤器
    const acceptableMime = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif']
    if(acceptableMime.indexOf(file.mimetype) !== -1){
      cb(null, true)
    }else{
      cb(null, false)
    }
  }
  const imageLimit = {
    fieldSize: '2MB'
  }
  const upload = multer({
    storage,
    fileFilter: imageFilter,
    limits: imageLimit
  })
  const uploadHandel = upload.single('image')
  router.post('/goodimgupload', (req, res) => {
      uploadHandel(req, res, (error) => {  //错误处理
        if (error) {
          res.send({code: 1,data:{message:error}})
        }else{
          try {
            const name = req.file.filename
            const url = `http://localhost:5000/upload/${name}`
            return res.send({code: 0,data:{name,url}})
          }catch (e) {
            return res.send({code: 2,data:{message:'上传格式出错了'}})
          }
        }
      })
  })
  router.post('/goodimgdelete', (req, res) => {
    const Path = path.join(absolutePath, req.body.name)
    fs.unlink(Path, (error) => {
      if (error) {
        res.send({code: 1,msg: '删除文件失败'})
      }else {
        res.send({code: 0})
      }
    })
  })
}

const orders = () =>{
  const provinces = require('./provinces')
  router.get('/orderlist',async (req,res) =>{
    const {pagenum,pagesize} = req.query
    if(pagenum&&pagesize){
      const sort = {"_id": -1} // 排序
      const skip = (pagenum - 1) * pagesize // 跳过数
      try {
        const result = await OrderModel.find({},{},{skip,limit: pagesize * 1,sort})
        const total = await OrderModel.countDocuments()
        if (result){
          res.send({code:0,data:{result,total}})
        } else{
          res.send({code:1,data:{message:'查询出错了'}})
        }
      }catch (e) {
        res.send({code:1,data:{message:'服务器出错了'}})
      }
    }else{
      res.send({code:1,data:{message:'参数出错了'}})
    }
  })
  router.get('/orderpro',(req,res) =>{
    try {
      res.send({code:0,data:provinces})
    }catch (e) {
      res.send({code:1,data:{message:'服务器繁忙'}})
    }
 })
  router.get('/kuaidi',async (req,res) =>{
    const {orderId} = req.query
    if(orderId){
      try {
        const data = await KuaidiModel.find({orderId})
        if(data){
          res.send({code:0,data})
        }else {
          res.send({code:1,data:{message:'查询失败'+data}})
        }
      }catch (e) {
        res.send({code:1,data:{message:'服务器出错了'}})
      }
    }else{
      res.send({code:1,data:{message:'参数错误'}})
    }
  })
}
orders()
fileUpload()
goods()
parameters()
user()
root()
category()
module.exports = router;
