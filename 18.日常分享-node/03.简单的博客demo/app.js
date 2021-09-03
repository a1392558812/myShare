const express = require('express')
const path = require('path')
const session = require('express-session')
const mongoose = require('mongoose')
const router = require('./router/router')


const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use("/public",express.static(path.join(__dirname,'public')))
console.log(__dirname,"~~~奥利给~~~",__filename)
app.engine('html', require('express-art-template'))
app.use(session({
    secret: 'blogAdmin', // 配置加密字符串，会在这个字符串基础上进行加密，防止与他人的session重复
    resave: false,
    saveUninitialized: false // 无论受使用session，都默认生成sessionId
}))

app.use(router)

const DB_URL = 'mongodb://localhost/blogAdminDB'
mongoose.connect(DB_URL, {useNewUrlParser: true})
const conn = mongoose.connection // 获取连接对象
conn.on('error',(error)=>{ // 绑定连接失败的监听
    console.log('数据库连接失败' + error)
});
conn.on('connected',() =>{ // 绑定连接完成的监听
    console.log("blogAdminDB数据库已连接")
    app.listen(4000,() =>{
        console.log("服务器于4000端口启动")
    })
})
conn.on('disconnected', () => { // 绑定连接断开的监听
    console.log('数据库连接已断开');
});
