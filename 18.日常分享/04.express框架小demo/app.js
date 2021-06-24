// 引入express
const express = require('express')
// 创建服务器应用程序 等同于http.createServer()
const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.json()) // parse application/json
const comments = []
for (let i=0;i<10;i++){
    let obj={}
    obj.name = `双刀李老${i+1}`
    obj.message = `在下天下第${i+1}，于${i}天前发布`
    obj.dataTime = Date.now()
    comments.push(obj)
}
/* app.engine('art', require('express-art-template'))
*  配置使用'express-art-template'模板引擎，
* 第一个参数表示，当渲染以‘.art结尾的文件时，使用art-template模板引擎’
*
* 'express-art-template'是专门用来在Express’中把‘art-template’整合到‘Express’
*
*  Express框架为res对象提供了一个方法：render，但默认是不可以使用的，通过配置模板引擎就可以使用了
*  res.render('html模板名',{模板数据})，第一个参数不可以写路径，默认会去项目的‘view’目录查找文件
*  如果需要修改默认的view’目录，可以如下修改
*   app.set('views','修改的路径')
*
* */



app.engine('html', require('express-art-template'));

// 公开指定的静态资源目录，
// app.use('/public/',express.static('./public/'))
app.use(express.static('./public/'))

app.get('/',(req,res) =>{
    res.render('index.html',{
        comments
    })
})

app.get('/post',(req,res) =>{
    res.render('post.html')
})
// 在Express中没有内置的处理POST请求的API，此处我们需要一个第三方包`body-parser`
app.post('/post',(req,res) =>{
    const comment = req.body
    console.log(comment)
    comment.dateTime = Date.now()
    comments.push(comment)
    res.redirect(302,'/')
    /*res.statusCode = 302
    res.setHeader('Location','/')*/
})

// 相当于server.listen()
app.listen(4000,() =>{
    console.log('服务器启动成功，端口号4000')
})