const express = require('express')
const md5 = require('blueimp-md5')
const router = express.Router() // 得到路由器对象

const {
    UserModel,
    CategoryModel,
    ProductModel,
    RoleModel,
    CustomerModel
} = require('../models/modelCollections') // 引入model


const login = () => {
    router.post('/login', async (req, res) => {
        const {
            username,
            password
        } = req.body
        console.log(username, password)
        try {
            const data = await UserModel.findOne({
                username,
                password: md5(password)
            })
            if (data) {
                if (data.role_id) {
                    const _id = data.role_id
                    const role = await RoleModel.findOne({_id})
                    data._doc.role = role
                    res.send({ code: 0,data})
                } else {
                    data._doc.role = {
                        menus: []
                    }
                    // 返回登陆成功信息(包含user)
                    res.send({
                        code: 0,
                        data
                    })
                }
            } else { // 登陆失败
                res.send({
                    code: 1,
                    message: '用户名或密码不正确!'
                })
            }
        } catch (error) {
            res.send({
                code: 1,
                message: '登陆异常, 请重新尝试'
            })
        }
    })
}
const customer = () => {
    // 添加顾客
    router.post('/customer/add', async (req, res) => {
        const {username, password} = req.body
        const status = 0
        try {
            const customer = await CustomerModel.findOne({
                username
            })
            if (customer) {
                res.send({code: 1,message: '此顾客已存在'})
            } else {
                const createCustomer = {...req.body,status,password: md5(password)}
                const customer = await CustomerModel.create(createCustomer)
                if (customer) {
                    res.send({code: 0,data: customer})
                }
            }
        } catch (error) {
            res.send({
                code: 1,
                message: '添加顾客异常'
            })
        }
    })
    // 更新顾客
    router.post('/customer/update', async (req, res) => {
        const customer = req.body
        if (customer.password) {
            console.log('if分支', customer)
            customer.password = md5(customer.password)
            console.log(customer)
            try {
                let data = await CustomerModel.findOneAndUpdate({
                    _id: customer._id
                }, customer)
                data = Object.assign(data, customer)
                /* Object.assign方法用于对象的合并，
                 将源对象（source）的所有可枚举属性，
                 复制到目标对象（target）。*/
                // 返回
                console.log("奥利给", data)
                res.send({
                    code: 0,
                    data
                })
            } catch (error) {
                console.log('更新用户异常', error)
                res.send({
                    code: 1,
                    message: '更新用户异常, 请重新尝试'
                })
            }
        } else {
            console.log('else分支', customer)
            try {
                let data = await CustomerModel.findOneAndUpdate({
                    _id: customer._id
                }, customer)
                data = Object.assign(data, customer)
                res.send({
                    code: 0,
                    data
                })
            } catch (error) {
                console.log('更新用户异常', error)
                res.send({
                    code: 1,
                    message: '更新用户异常'
                })
            }
        }
    })
    // 删除顾客
    router.post('/customer/delete', async (req, res) => {
        const _id = req.body.customerId
        console.log(_id)
        try {
            await CustomerModel.deleteOne({
                _id
            })
            console.log("emmmm")
            res.send({
                code: 0
            })
        } catch (error) {
            console.log('更新顾客异常', error)
            res.send({
                code: 1,
                message: '更新顾客异常'
            })
        }

    })
    // 获取顾客列表（按名字，状态，手机号，身份证）
    router.get('/customer/list', async (req, res) => {
        const {
            status,
            All,
            username,
        } = req.query
        console.log(status, All, username, )
        let contition = {}
        if (All === 'undefined') {
            if (status !== 'undefined') {
                contition = {
                    status
                }
            } else if (username !== 'undefined') {
                contition = {
                    username: new RegExp(`^.*${username}.*$`)
                }
            }
            console.log(contition)
            try {
                const data = await CustomerModel.find(contition)
                res.send({
                    code: 0,
                    data
                })
            } catch (error) {
                res.send({
                    code: 1,
                    message: '获取分类列表异常, 请重新尝试'
                })
            }
        } else if (All !== 'undefined') {
            try {
                const data = await CustomerModel.find(contition)
                res.send({
                    code: 0,
                    data
                })
            } catch (error) {
                res.send({
                    code: 1,
                    message: '获取分类列表异常, 请重新尝试'
                })
            }
        }
    })
}
const user = () => {
    // 添加用户
    router.post('/user/add', async (req, res) => {
        const {username,password} = req.body
        try {
            const user = await UserModel.findOne({username})
            if (user) {
                res.send({code: 1,message: '此用户已存在'})
            } else {
                req.body.password = md5(password)
                const createUser = {...req.body}
                const data = await UserModel.create(createUser)
                res.send({code: 0,data})
            }
        } catch (error) {
            res.send({code: 1,message: '添加用户异常, 请重新尝试'})
        }
    })
    // 更新用户
    router.post('/user/update', async (req, res) => {
        const user = req.body
        const _id = user._id
        try {
            const oldUser = await UserModel.findOneAndUpdate({_id}, user)
            const data = Object.assign(oldUser, user)
            console.log(data, '更新用户')
            res.send({code: 0,data})
        } catch (error) {
            console.log('更新用户异常', error)
            res.send({code: 1,message: '更新用户异常, 请重新尝试'})
        }
    })
    // 删除用户
    router.post('/user/delete', async (req, res) => {
        const _id = req.body.userId
        console.log(_id)
        try {
            await UserModel.deleteOne({_id})
            res.send({code: 0})
        } catch (error) {
            console.log('更新用户异常', error)
            res.send({code: 1,message: '更新用户异常, 请重新尝试'})
        }
    })
    // 获取所有用户列表
    router.get('/user/list', async (req, res) => {
        try {
            const users = await UserModel.find({username: {'$ne': 'admin001'}})
            const roles = await RoleModel.find()
            console.log("所有用户列表", {users,roles})
            const data = {users,roles}
            res.send({ code: 0,data})
        } catch (error) {
            console.log('获取用户列表异常', error)
            res.send({code: 1,message: '获取用户列表异常, 请重新尝试'})
        }
    })
}
const category = () => {
    // 添加分类
    router.post('/category/add', async (req, res) => {
        let name = req.body.categoryName
        let grade = req.body.grade || '0'
        console.log({name,grade})
        const createCategory = { name,grade}
        try {
            const data = await CategoryModel.create(createCategory)
            res.send({code: 0,data})
        } catch (error) {
            console.log('添加分类异常', error)
            res.send({code: 1,message: '添加分类异常',categoryName:name,grade})
        }
    })
    // 获取分类列表
    router.get('/category/list', async (req, res) => {
        let grade = req.query.grade || '0'
        console.log(grade, typeof grade)
        try {
            const data = await CategoryModel.find({grade})
            console.log(data)
            res.send({code: 0,data})
        } catch (error) {
            console.log('获取分类列表异常', error)
            res.send({code: 1,message: '获取分类列表异常'})
        }
    })
    // 更新分类名称
    router.post('/category/update', async (req, res) => {
        const name = req.body.categoryName
        const _id = req.body.categoryId
        console.log(_id, name)
        try {
            await CategoryModel.findOneAndUpdate({_id}, {name})
            res.send({code: 0})
        } catch (error) {
            console.log('更新分类名称异常', error)
            res.send({code: 1,message: '更新分类名称异常'})
        }
    })
    // 删除某一二级分类
    router.post('/category/delete', async (req, res) => {
        const { categoryId} = req.body
        console.log(categoryId)
        try {
            const result = await ProductModel.findOne({categoryId})
            if (result) {
                res.send({code: 2})
            } else {
                const _id = categoryId
                const result = await CategoryModel.deleteOne({ _id})
                console.log(result, '~~~~~~~~~~~~~~~~~~~')
                res.send({code: 0})
            }
        } catch (e) {
            res.send({code: 1})
        }
    })
    // 根据分类ID获取分类
    router.get('/category/info', async (req, res) => {
        const _id = req.query.categoryId
        try {
            const data = await CategoryModel.findOne({_id})
            res.send({code: 0,data})
        } catch (error) {
            console.log('获取分类信息异常', error)
            res.send({code: 1,message: '获取分类信息异常'})
        }
    })
}
const product = () => {
    // 添加产品
    router.post('/product/add', async (req, res) => {
        let product = req.body
        console.log(product)
        try {
            const date = await ProductModel.create(product)
            res.send({code: 0, date})
        } catch (error) {
            console.log('添加产品异常', error)
            res.send({code: 1,message: '添加产品异常'})
        }
    })
    // 获取产品分页列表
    router.get('/product/list', async (req, res) => {
        const {pageNum,pageSize} = req.query // pageNum当前第几页，pageSize每页多少条
        try {
            const condition = {}
            const sort = {"_id": -1}
            const skip = (pageNum - 1) * pageSize
            const list = await ProductModel.find(condition, null, {skip,limit: pageSize * 1,sort})
            const total = await ProductModel.count(condition)
            const pages = Math.floor((total + pageSize - 1) / pageSize)
            const data = {pageNum,pageSize,list,total, pages}
            console.log(data)
            res.send({code: 0,data})
        } catch (error) {
            console.log('获取商品列表异常', error)
            res.send({code: 1,message: '获取商品列表异常, 请重新尝试'})
        }
    })
    // 搜索产品列表
    router.get('/product/search', async (req, res) => {
        const {pageNum,pageSize,productName,productDesc,categoryId} = req.query
        console.log(pageNum, pageSize, productName, productDesc, categoryId)
        let condition = {}
        try {
            if (productName) {
                condition = {name: new RegExp(`^.*${productName}.*$`)}
            } else if (productDesc) {
                condition = {desc: new RegExp(`^.*${productDesc}.*$`)}
            } else if (categoryId) {
                condition = {categoryId}
            }
            console.log(condition)
            const sort = { "_id": -1}
            const skip = (pageNum - 1) * pageSize
            const list = await ProductModel.find(condition, null, {skip,limit: pageSize * 1,sort})
            const total = await ProductModel.count(condition)
            const pages = Math.floor((total + pageSize - 1) / pageSize)
            const data = {pageNum, pageSize,list,total,pages}
            console.log(data)
            res.send({code: 0,data})
        } catch (error) {
            console.log('搜索商品列表异常', error)
            res.send({code: 1,message: '搜索商品列表异常'})
        }
    })
    // 更新产品
    router.post('/product/update', async (req, res) => {
        const product = req.body
        const _id = req.body._id
        try {
            await ProductModel.findOneAndUpdate({_id}, product)
            res.send({code: 0})
        } catch (error) {
            res.send({code: 1,message: '更新商品名称异常, 请重新尝试'})
        }
    })
    // 更新产品状态(上架/下架)
    router.post('/product/updateStatus', async (req, res) => {
        const status = req.body.status
        const _id = req.body.productId
        try {
            await ProductModel.findOneAndUpdate({_id}, {status})
            res.send({code: 0})
        } catch (error) {
            console.log('更新产品状态异常', error)
            res.send({code: 1,message: '更新产品状态异常, 请重新尝试'})
        }
    })
}
const role = () => {
    // 添加角色
    router.post('/role/add', async (req, res) => {
        const name = req.body.roleName
        try {
            const role = await RoleModel.findOne({name})
            if (role) {
                res.send({code: 1,message: '该角色已存在, 请重新尝试'})
            } else {
                const data = await RoleModel.create({name})
                res.send({code: 0,data})
            }
        } catch (error) {
            console.log('添加角色异常', error)
            res.send({code: 1,message: '添加角色异常, 请重新尝试'})
        }
    })
    // 获取角色列表
    router.get('/role/list', async (req, res) => {
        try {
            const data = await RoleModel.find()
            res.send({code: 0,data})
        } catch (error) {
            console.log('获取角色列表异常', error)
            res.send({code: 1,message: '获取角色列表异常'})
        }
    })
    // 更新角色(设置权限)
    router.post('/role/update', async (req, res) => {
        const _id = req.body._id
        const newRole = req.body
        newRole.auth_time = Date.now()
        try {
            const oldRole = await RoleModel.findOneAndUpdate({_id}, newRole)
            const data = { ...oldRole._doc,...newRole}
            res.send({code: 0,data})
        } catch (error) {
            console.log('更新角色异常', error)
            res.send({code: 1,message: '更新角色异常'})
        }
    })
    // 删除角色
    router.post('/role/delete', async (req, res) => {
        const role_id = req.body._id
        console.log(role_id)
        try {
            const result = await UserModel.findOne({role_id})
            if (result) {
                res.send({code: 2})
            } else {
                await RoleModel.deleteOne({_id: role_id})
                res.send({code: 0})
            }
        } catch (e) {
            res.send({code: 1})
        }
    })
}
const fileUpload = () => {
    const multer = require('multer')
    const path = require('path')
    const fs = require('fs')
    const absolutePath = path.join(__dirname, '..', 'public/upload')
     // 一个自定义存储的方式，让开发者设定存储路径和命名：
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
        filename: (req, file, cb) => { //修改上传文件的名字 // path.extname(file.originalname)  文件后缀名
            console.log(file)
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
        }
    })
    const uploadHandel = multer({storage: storage}).single('image')
    router.post('/image/upload', (req, res) => {
        uploadHandel(req, res, (error) => { //错误处理
            if (error) {
                res.send({status: 1,msg: '上传文件失败'})
            } else {
                const name = req.file.filename
                const url = `http://localhost:5000/upload/${name}`
                const data = {name,url}
                res.send({status: 0,data})
            }
        })
    })
    // 删除图片
    router.post('/image/delete', (req, res) => {
        const Path = path.join(absolutePath, req.body.name)
        fs.unlink(Path, (error) => {
            if (error) {
                console.log(error)
                res.send({status: 1,msg: '删除文件失败'})
            } else {
                res.send({status: 0})
            }
        })
    })
}

login() // 登录
customer() // 顾客的相关操作
fileUpload() // 处理照片上传
product() // 产品处理
user() // 用户处理
category() // 种类处理
role() // 角色处理

module.exports = router
