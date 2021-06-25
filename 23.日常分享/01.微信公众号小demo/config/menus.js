/* 自定义菜单 */

module.exports={
    "button":[
        {
            "type":"click",
            "name":"今日歌曲",
            "key":"CLICK"
        },
        {
            "name":"菜单",
            "sub_button":[
                {
                    "type":"view",
                    "name":"搜索",
                    "url":"http://www.bilibili.com/"
                },
                {
                    "type": "scancode_waitmsg",
                    "name": "扫码带提示",
                    "key": "扫码带提示",
                },
                {
                    "type": "scancode_push",
                    "name": "扫码推事件",
                    "key": "扫码推事件",
                },
                /*{
                    "type": "media_id",
                    "name": "图片",
                    "media_id": "MEDIA_ID1"
                },
                {
                    "type": "view_limited",
                    "name": "图文消息",
                    "media_id": "MEDIA_ID2"
                }*/
                ]
        },
        {
            "name": "发图",
            "sub_button": [
                {
                    "type": "pic_sysphoto",
                    "name": "系统拍照发图",
                    "key": "系统拍照发图",
                },
                {
                    "type": "pic_photo_or_album",
                    "name": "拍照或者相册发图",
                    "key": "拍照或者相册发图",
                },
                {
                    "type": "pic_weixin",
                    "name": "微信相册发图",
                    "key": "微信相册发图",
                },
                {
                    "name": "发送位置",
                    "type": "location_select",
                    "key": "发送位置"
                },
            ]
        },
    ]
}