/*
    access_token是公众号的全局唯一接口调用凭据，公众号调用各接口时都需使用access_token。
    开发者需要进行妥善保存。access_token的存储至少要保留512个字符空间。access_token的有效期目前为2个小时，
    需定时刷新，重复获取将导致上次获取的access_token失效。
    https请求方式: GET https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRE
    grant_type	是	获取access_token填写client_credential
    appid	是	第三方用户唯一凭证
    secret	是	第三方用户唯一凭证密钥，即appsecret
*/
module.exports = function (){
    const rp = require('request-promise-native')
    const fs = require('fs')
    const config = require('./config')
    const menus = require('./menus')


    class Wechat {
        constructor(){ // 类的构造方法

        }
        async getAccessToken(){ /* 获取access-token */
            const {appID,appsecret} = config
            const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`
            const result = await rp({method:"GET",url,json:true})
            try{
                result.expires_in = Date.now()+((+result.expires_in)-300)*1000
                return result
            }catch (e) {
                return '出错了'
            }
        }
        async saveAccessToken(accessToken) {
            accessToken = JSON.stringify(accessToken)
            let result = await new Promise((resolve, reject) =>{
                fs.writeFile('./accessToken.txt',accessToken,(error,data) =>{
                    if (!error) {
                        resolve(data)
                    } else{
                        resolve (false)
                    }
                })
            })
            return result
        }
        async readAccessToken() {
            let result = await new Promise((resolve, reject) => {
                fs.readFile('./accessToken.txt',(error,data) =>{
                    if (!error) {
                        resolve(JSON.parse(data))
                    }else{
                        resolve(false)
                    }
                })
            })
            return result
        }
        isValidAccessToken(data){
            if (!data || !data.access_token || !data.expires_in) {
                return false
            }
            if (data.expires_in<Date.now()) {
                return false
            }else{
                return true
            }
        }
        async action(){
            const result = await this.readAccessToken() // 读取本地文件
            console.log(result)
            if (result) { // 读取到本地文件
                console.log('有本地文件')
                const isValid  =  this.isValidAccessToken(result)
                if (isValid) { // 判断本地文件是否可用
                    console.log('读取成功，文件可用')
                    await this.saveAccessToken(result)
                    return result
                } else {
                    console.log('读取失败成功，重新获取文件')
                    const getAccess = await this.getAccessToken()
                    await this.saveAccessToken(result)
                    return getAccess
                }
            } else{
                console.log('没有本地文件')
                const getAccess = await this.getAccessToken()
                const isValid  = await this.isValidAccessToken(getAccess)
                if (isValid) {
                    await this.saveAccessToken(getAccess)
                    return getAccess
                } else {
                    return false
                }
            }
        }
        async createMenu (menus) { // 创建自定义菜单
            const result = await this.action()
            console.log('// 创建自定义菜单',result)
            let data
            if (result) {
                const url = ` https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${result.access_token}`
                data = await rp({method:'POST',url,body:menus,json: true})
            }
            return data
        }
        async deleteMenu() { // 删除自定义菜单
            console.log('//开始执行删除自定义菜单，初始化access_token')
            const result = await this.action()
            console.log('//开始执行删除自定义菜单，初始化access_token完成',result)
            let data
            console.log(result,'// 删除自定义菜单')
            const url = `https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=${result.access_token}`
            data = await rp({method:'GET',url,json:true})
            return data
        }
    }

    (async ()=>{
        const wechat = new Wechat()
        console.log('..........')
        let result = await wechat.deleteMenu()
        console.log('加载中...',result)
        result = await wechat.createMenu(menus)
        console.log(result)
    })()

}
