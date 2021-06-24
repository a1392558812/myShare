const mongoose = require('mongoose')
const path = require('path')
const express = require('express')
const app = express()
app.use(express.static(path.join(__dirname, './public/')))

app.use(express.urlencoded({extended: true}))

app.use(express.json())

const Routers = require('./routers/routers')
app.use(Routers)

/*
const middleware = () => {
  const fs = require('fs')
  const readeFilePromise = new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, '/public/index.html'), (err, data) => {
      if (!err) {
        resolve(data.toString())
      } else {
        reject(err)
      }
    })
  })
  app.use((req, res) => {
    readeFilePromise
      .then(
        value => {
          res.send(value)
        },
        err => {
          res.send(`
              <!doctype html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport"
                          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
                    <meta http-equiv="X-UA-Compatible" content="ie=edge">
                    <title>404 NOT FIND</title>
                </head>
                <body>
                    <h1>网页丢失在浩瀚的苍穹中</h1>
                </body>
                </html>
          `)
        }
      )
  })
}
middleware()
 */

const DB_URL = 'mongodb://localhost/serverDB'
mongoose.connect(DB_URL, {
  useNewUrlParser: true
})
const conn = mongoose.connection
conn.on('error', (error) => {
  console.log('数据库连接失败' + error)
});
conn.on('connected', () => {
  console.log("serverDB数据库已连接")
  app.listen('5000', () => {
    console.log('服务器启动成功,端口号5000')
  })
})
conn.on('disconnected', () => {
  console.log('数据库连接已断开');
});
