const express = require('express')
const md5 = require('blueimp-md5')
const router = express.Router()
const userModal = require('../models/user.js')

router.get('/',(req,res) =>{
    console.log(req.session.user)
    res.render('index.html',{
        user: req.session.user
    })
})

router.get('/login',(req,res) =>{
    res.render('login.html')
})
router.post('/login', async (req,res) =>{
   const {email,password} = req.body
    console.log(email,password)
    try{
        const user = await userModal.findOne({email,password:md5(md5(password))})
        if (user) { // 登录成功
            req.session.user = user
            res.status(200).json({
                err_code: 0,
                message: "OK",
            })
        } else{
            res.status(200).json({
                err_code: 1,
                message: "邮箱或者密码错误",
            })
        }
    }catch (e) {
        res.status(500).json({
            err_code: 500,
            message: "服务器繁忙，请稍后重试"+e,
        })
    }
})

router.get('/register',(req,res) =>{
    res.render('register.html')
})
router.post('/register', async (req,res) =>{
    const {email,nickname} = req.body
    console.log(email,nickname)
    try{
        const user = await userModal.findOne({$or:[{email},{nickname}]})
        if (!user) {
            req.body.password = md5(md5(req.body.password))
            const data = await userModal.create(req.body)
            if (data) {
                // 注册成功，记录登录的session状态
                req.session.user = data
                res.status(200).json({
                    err_code: 0,
                    message: "OK",
                })
            } else {
                res.status(500).json({
                    err_code: 500,
                    message: "服务器繁忙，请稍后重试",
                })
            }
        } else {
            res.status(200).json({
                err_code: 1,
                message: "该用户已存在",
            })
        }
    }
    catch (e) {
        res.status(500).json({
            err_code: 500,
            message: "服务器繁忙，请稍后重试",
        })
    }
})

router.get('/logout',(req,res) =>{
    req.session.user = null
    res.redirect('/login')
})

module.exports = router