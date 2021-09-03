const sha1 = require('sha1')
const config = require('../config/config')
const {
    getUserDataAsync,
    parseXMLAsync,
    formatJsData
} = require('../utils/tools/tools')
const initMessage = require('./template')
const replyOption = require('./reply')
module.exports = () => { // 服务器验证的中间件模块
    return async (req, res, next) => {
        const {
            signature,
            echostr,
            timestamp,
            nonce
        } = req.query
        const {
            token,
            appID,
            appsecret
        } = config
        // 按照字典排序
        // sha1加密
        const sha1Str = sha1([timestamp, nonce, token].sort().join(''))
        console.log(sha1Str)
        if (req.method === 'GET') { // 验证服务器有效性的请求
            if (sha1Str === signature) {
                res.send(echostr)
            } else {
                res.send({
                    error: 'error'
                })
            }
        } else if (req.method === 'POST') {
            if (sha1Str === signature) {
                console.log(req.query)
                /*{signature: 'e6b3d5701c1f21619572b9ef8deedb22dc27113d',
                      timestamp: '1585649876',
                      nonce: '1304699780',
                      openid: 'oX0jcvuJArLlGtGjbw1BvNvc4C3s' // 用户的微信ID}*/
                const userDate = await getUserDataAsync(req)
                console.log(userDate, '奥利给')
                /*
                    <xml><ToUserName><![CDATA[gh_daa05b5d6af8]]></ToUserName> // 开发者的ID
                    <FromUserName><![CDATA[oX0jcvuJArLlGtGjbw1BvNvc4C3s]]></FromUserName> // 用户id
                    <CreateTime>1585651559</CreateTime> // 发送的时间戳
                    <MsgType><![CDATA[text]]></MsgType> // 发送的消息类型
                    <Content><![CDATA[还有这种操作？]]></Content>  //  发送的内容
                    <MsgId>22701072161729503</MsgId> // 消息ID


                    <Image>
                        <MediaId><![CDATA[media_id]]></MediaId>
                    </Image>
                    </xml>
                */
                const jsData = await parseXMLAsync(userDate)
                /*{xml: {
                        ToUserName: [ 'gh_daa05b5d6af8' ],
                        FromUserName: [ 'oX0jcvuJArLlGtGjbw1BvNvc4C3s' ],
                        CreateTime: [ '1585652817' ],
                        MsgType: [ 'text' ],
                        Content: [ '奥利给' ],
                        MsgId: [ '22701089462016219' ]



                      }}*/
                console.log(jsData)
                const message = formatJsData(jsData)
                console.log(message)



                const option = replyOption(message)
                let replyMessage = initMessage(option)
                console.log(replyMessage)
                res.send(replyMessage)
            } else {
                res.send({
                    error: 'error'
                })
            }
        }

        /*{
          signature: '037f1b8a20477edad0d0d6fae7665015b05e93d2', // 微信加密签名
          echostr: '4230225111450776045', // 微信随机字符串
          timestamp: '1585574348',  // 时间戳
          nonce: '1570415111'   // 微信随机数
        }*/

    }
}
