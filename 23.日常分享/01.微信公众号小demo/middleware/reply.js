module.exports = (message) =>{
    let replyContent = '宁说设么呢🐍emmmmmm'
    let option = {
        ToUserName:message.FromUserName,
        FromUserName:message.ToUserName,
        CreateTime:Date.now(),
    }
    if (message.MsgType==='text') { // 只处理用户发送的文本消息
        if (message.Content === '1') { // 判断用户具体发送的消息
            replyContent = '奥利给001！！'
        } else if (message.Content === '2') {
            replyContent = '奥利给002！！'
        }else if (message.Content === '3') { // 全匹配
            replyContent = '奥利给003！！'
        } else if (message.Content.match('鲁迅')) { // 半匹配
            replyContent = '在我的后园，可以看见墙外有两株树，一株是枣树，还有一株也是枣树。'
        }
        option.type = 'text'
    }else if (message.MsgType==='image') {
        option.type = 'image'
        option.mediaId = message.MediaId
        console.log(message.PicUrl)
    } else if (message.MsgType==='voice') {
        option.type = 'voice'
        option.mediaId = message.MediaId
        console.log(message.Recognition)
    } else if (message.MsgType==='location') {
        option.type = 'text'
        replyContent = `纬度为:${message.Location_X},
                      经度为：${message.Location_Y},
                      地图缩放大小:${message.Scale},
                      地理位置信息:${message.Label}`
    } else if (message.MsgType==='event') {
        if (message.Event === 'subscribe') {
            option.type = 'text'
            replyContent = '奥利给，关注了ヾ(≧O≦)〃嗷~'
            if(message.EventKey){
                replyContent = '奥利给，扫描了带参数的二维码关注事件'
            }
        } else if(message.Event === 'unsubscribe') {
            console.log("卧槽！！！！无情")
        } else if (message.Event === 'SCAN') {
            option.type = 'text'
            replyContent = '奥利给，扫描了带参数的二维码用户已关注时的事件推送'
        }else if (message.Event === 'LOCATION') {
            option.type = 'text'
            replyContent = `纬度为:${message.Latitude	},
                      经度为：${message.Longitude},
                      地理位置精度:${message.Precision},`
        }else if(message.Event === 'CLICK') {
            option.type = 'text'
            replyContent = `宁配么？点击了菜单按钮${message.EventKey}`
        }
    }
    option.replyContent = replyContent
    return option
}