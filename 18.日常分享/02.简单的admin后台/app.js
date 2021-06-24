// 引入express
const express = require('express')
// 创建服务器应用程序 等同于http.createServer()
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json()) // parse application/json

app.engine('html', require('express-art-template'))
const router = require('./router/router')
app.use(express.static('./public/'))
// 路由容器挂在到 app服务中
app.use(router)
app.listen(4000,() =>{
    console.log("服务器于4000端口启动")
})