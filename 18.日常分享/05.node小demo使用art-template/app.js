// 服务器
const http = require('http')
const template = require('art-template')
const fs = require('fs')
const urlMiddleware = require('url')
const comments = []
for (let i=0;i<10;i++){
    let obj={}
    obj.name = `双刀李老${i+1}`
    obj.message = `在下天下第${i+1}，于${i}天前发布`
    obj.dataTime = Date.now()
    comments.push(obj)
}
http.createServer((req,res) =>{
    const reqObj = urlMiddleware.parse(req.url,true)
    const url = reqObj.pathname // 处理get请求
    if (url === '/') {
        fs.readFile('./static/index.html',(err,data) =>{
            if (err) {
                return res.end('404 not find')
            } else {
                const newData = template.render(data.toString(),{
                    comments
                })
                return res.end(newData)
            }
        })
    }else if (url === '/pinglun') {
        const content = reqObj.query
        content.dataTime = Date.now()
        comments.push(content)
        res.statusCode = 302
        res.setHeader('Location','/')
        res.end()
    } else if (url.indexOf('/public/') === 0) {
        const staticUrl = './static' + url
        fs.readFile(staticUrl,(err,data) =>{
            if (err) {
                fs.readFile('./static/404.html',(err,value) =>{
                    if (err) {
                        return res.end('404 not find')
                    } else {
                        return res.end(value)
                    }
                })
            } else {
                return res.end(data)
            }
        })
    }else if (url === '/post') {
        fs.readFile('./static/post.html',(err,data) =>{
            if (!err) {
                return res.end(data)
            }
        })
    } else {
        fs.readFile('./static/404.html',(err,data) =>{
            if (err) {
                return res.end('404 not find')
            } else {
                return res.end(data)
            }
        })
    }
}).listen(4000,() =>{
    console.log('服务器启动成功，端口号4000')
})