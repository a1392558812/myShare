const fs = require('fs')
const dataPath = './mockJson.json'
/* 获取学生列表 */
const find = () =>{
    return new Promise((resolve,reject) =>{
        fs.readFile(dataPath,(err,data) =>{
            if (!err) {
                resolve(JSON.parse(data.toString()).students)
            }else {
                reject(err)
            }
        })
    })
}
exports.find = find

/* 添加学生 */
exports.add = (data) =>{
    console.log("???emmmmmm",data)
    return new Promise((resolve,reject) => {
        find().then(
            value => {
                data.id = Date.now()
                value.unshift(data)
                console.log(JSON.stringify(value))
                const students = {students:value}
                fs.writeFile(dataPath,JSON.stringify(students), (err) => {
                    if (err) {
                        console.log("写入失败")
                        reject(1)
                    } else {
                        console.log("写入成供")
                        resolve(err)
                    }
                })
            },
            err => {
                reject(err)
            }
        )
    })
}

/* 更新学生 */
exports.updateById = (student) =>{
    console.log("接受的参数",student)
    return new Promise((resolve,reject) => {
        find().then(
            value => {
                student.id = student.id*1
                let stu = value.find((item) =>item.id === student.id)
                for (let key in student) {
                    stu[key] = student[key]
                }
                const students = {students:value}
                fs.writeFile(dataPath, JSON.stringify(students), (err) => {
                    if (err) {
                        console.log("更新失败")
                        reject(1)
                    } else {
                        console.log("更新成功")
                        resolve(students)
                    }
                })
            },
            err =>{
                console.log("find()函数失败")
                reject(err)
            }
        )
    })
}

/* 删除学生 */
exports.remove = (id) =>{
    return new Promise((resolve,reject) =>{
        find().then(
            value => {
                const index = value.findIndex((item) =>item.id === id*1)
                value.splice(index, 1)
                const students = {students:value}
                fs.writeFile(dataPath, JSON.stringify(students), (err) => {
                    if (err) {
                        console.log("更新失败")
                        reject(1)
                    } else {
                        console.log("更新成功")
                        resolve(students)
                    }
                })
            },
            err =>{
                reject(err)
            }
        )
    })
}













