const express = require('express')
const fs = require('fs')
const {find,add,updateById,remove} = require('../students')
// 创建一个路由容器，
const router = express.Router()
// 将所有的路由挂在到router容器中
router.get('/',(req,res) =>{
    find().then(
        students => {
            res.render('index.html',{
                foods:['臭豆腐','俘虏','老干妈','加柠檬🍋',],
                students
            })
        },
        err =>{
            res.status(500).send("404 not find"+err)
        }
    )
    /*fs.readFile('./mockJson.json',(err,data) =>{
        if (!err) {
            const {students} = JSON.parse(data.toString())
            console.log(students)
            res.render('index.html',{
                foods:['臭豆腐','俘虏','老干妈','加柠檬🍋',],
                students
            })
        }else {
            return res.status(500).send("404 not find")
        }
    })*/

})
router.get('/students/new',(req,res) =>{
    res.render('new.html')
})
// 添加新学生
router.post('/students/new',(req,res) =>{
    const data = req.body
    console.log("const data = req.body",data)
    add(data)
        .then(
            value => {
                res.redirect('/')
            },
            err =>{
                res.status(500).send("出错了"+err)
            }
        )
})

router.get('/students/edit',(req,res) =>{
    const id = (req.query.id)*1
    console.log(id)
    find().then(
        value => {
            const result = value.find(item => item.id === id)
            console.log("result",result)
            res.render('edit.html',{
                student:result
            })
        },
        err =>{
            res.status(500).send("出错了"+err)
        }
    )
})

router.post('/students/edit',(req,res) =>{
    console.log("跟新学生",req.body)
    const student = req.body
    updateById(student).then(
        value => {
            res.redirect('/')
        },
        err =>{
            res.status(500).send("出错了"+err)
        }
    )
})

router.get('/students/delete',(req,res) =>{
    const {id} = req.query
    console.log(id)
    remove(id)
        .then(
            value =>{
                res.redirect('/')
            },
            err =>{
                res.status(500).send("出错了"+err)
            }
        )
})
module.exports = router



/*module.exports = (app) =>{
    app.get('/',(req,res) =>{
        fs.readFile('./mockJson.json',(err,data) =>{
            if (!err) {
                const {students} = JSON.parse(data.toString())
                console.log(students)
                res.render('index.html',{
                    foods:['臭豆腐','俘虏','老干妈','加柠檬🍋',],
                    students
                })
            }else {
                return res.status(500).send("404 not find")
            }
        })

    })
}*/
