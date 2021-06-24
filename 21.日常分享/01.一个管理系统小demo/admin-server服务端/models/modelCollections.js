const mongoose = require('mongoose')
const md5 = require('blueimp-md5')
const Schema = mongoose.Schema

const categorySchema = new Schema({
    name: {type: String, required: true},
    grade : {type: String, required: true, default: '0'}
})
const CategoryModel = mongoose.model('categorys', categorySchema)
exports.CategoryModel = CategoryModel


const productSchema = new Schema({
    categoryId: {type: String, required: true}, // 所属分类的id
    pCategoryId: {type: String, required: true}, // 所属分类的父分类id
    name: {type: String, required: true}, // 名称
    price: {type: Number, required: true}, // 价格
    desc: {type: String},
    status: {type: Number, default: 1}, // 商品状态: 1:在售, 2: 下架了
    imgs: {type: Array, default: []}, // n个图片文件名的json字符串
    detail: {type: String}
})
const ProductModel = mongoose.model('products', productSchema)
exports.ProductModel = ProductModel



const roleSchema = new Schema({
    name: {type: String, required: true}, // 角色名称
    auth_name: {type:String}, // 授权人{type: }
    auth_time: {type: Number}, // 授权时间
    create_time: {type: Number, default: Date.now}, // 创建时间
    menus: {type: Array} // 所有有权限操作的菜单path的数组
})
const RoleModel = mongoose.model('roles', roleSchema)
exports.RoleModel = RoleModel




const customerSchema = Schema({ // 定义文档约束
    username: {type: String, required: true}, // 用户名-必须
    password: {type: String, required: true}, // 密码-必须
    idCard: {type: String, required: true}, // 身份证
    phone: {type: String, required: true},  // 手机号
    status: {type: Number}, // 是否被拉黑
    borrow: {type: Array}, // 所租借书的数组
    email: {type: String}, // 邮件名称
})
const CustomerModel = mongoose.model('customers',customerSchema) //定义Model（与集合一一对应）
const checkCustomerModel = async () =>{
    const customer = await CustomerModel.findOne({username: 'customer001'})
        if(!customer) {
            await CustomerModel.create({
                   username: 'customer001',
                   password: md5('Customer001*'),
                   status: 0,
                   email:'1392558812@qq.com',
                   phone: '18846155172',
                   idCard: '142402199705221558'})
                   console.log('初始化顾客用户: 用户名: customer001 密码为: Customer001*')
        }
}
checkCustomerModel()
exports.CustomerModel = CustomerModel



const userSchema = new Schema({
    username: {type: String, required: true}, // 用户名 {type: }
    password: {type: String, required: true}, // 密码
    phone: {type: String},
    salary:{type: Number,required: true, default: 2000},// 工资
    email: {type: String},
    create_time: {type: Number, default: Date.now},
    role_id: {type: String}
})
const UserModel = mongoose.model('users', userSchema)
const checkUserModel = async () =>{
    const user = await UserModel.findOne({username: 'admin001'})
        if(!user) {
            await UserModel.create({
                username: 'admin001',
                password: md5('Admin001*')})
            console.log('初始化超级管理员: 用户名: admin001 密码为: Admin001*')
        }
}
checkUserModel()
exports.UserModel = UserModel


