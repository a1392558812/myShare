module.exports = (options) =>{
    let initMessage = `<xml>
                            <ToUserName><![CDATA[${options.ToUserName}]]></ToUserName>
                            <FromUserName><![CDATA[${options.FromUserName}]]></FromUserName>
                            <CreateTime>${options.createTime}</CreateTime>
                            <MsgType><![CDATA[${options.type}]]></MsgType>`
                            /* <Content><![CDATA[${replyContent}]]></Content> */
    if (options.type ==='text') {
        initMessage+= `<Content><![CDATA[${options.replyContent}]]></Content> `
    }else if (options.type ==='image') {
        initMessage+= `<Image><MediaId><![CDATA[${options.mediaId}]]></MediaId></Image>`
    }else if (options.type ==='voice') {
        initMessage+= `<Voice><MediaId><![CDATA[${options.mediaId}]]></MediaId></Voice>`
    }else if (options.type ==='video') {
        initMessage+= `<Video>
                            <MediaId><![CDATA[${options.mediaId}]]></MediaId>
                            <Title><![CDATA[${options.title}]]></Title>
                            <Description><![CDATA[${options.description}]]></Description>
                       </Video>`
    }else if (options.type ==='music') {
        initMessage+= `<Music>
                        <Title><![CDATA[${options.title}]]></Title>
                        <Description><![CDATA[${options.description}]]></Description>
                        <MusicUrl><![CDATA[${options.musicUrl}]]></MusicUrl>
                        <HQMusicUrl><![CDATA[${options.HQmusicUrl}]]></HQMusicUrl>
                        <ThumbMediaId><![CDATA[${options.mediaId}]]></ThumbMediaId>
                      </Music>`
    }else if (options.type ==='news') {
        initMessage+= `<ArticleCount>${options.replyContent.length}</ArticleCount><Articles>`
        options.replyContent.forEach(item =>{
            initMessage+=`<item>
                              <Title><![CDATA[${item.title}]]></Title>
                              <Description><![CDATA[${item.description}]]></Description>
                              <PicUrl><![CDATA[${item.picurl}]]></PicUrl>
                              <Url><![CDATA[${item.url}]]></Url>
                            </item>`
        })
        initMessage+= `</Articles>`
    }
    initMessage += '</xml>'
    return initMessage
}