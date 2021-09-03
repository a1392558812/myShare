const express = require('express')
const sha1 = require('sha1')
const app = express() // 产生应用对象
require('./config/acessToken')()

const config = require('./config/config') // 配置模块
const middleware = require('./middleware/middleware')

app.use(express.static('public')) // 声明使用静态中间件

// 声明使用解析post请求的中间件

app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.use(middleware())
app.listen('4000', () => {
    console.log('服务器启动成功,端口号4000')
})


