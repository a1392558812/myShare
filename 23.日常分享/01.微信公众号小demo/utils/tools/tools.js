const {parseString} = require('xml2js')
module.exports = {
    async getUserDataAsync(req){
        let userData = ''
        await req
            .on('data',data =>{
                userData += data.toString()
             })
            .on('end',() =>{
                return userData
            })
        return userData
    },
    async parseXMLAsync(xmlData) {
        let result
        await parseString(xmlData,{trim:true},(err,data) =>{
            if (!err) {
                result = data
            } else {
                result =  err
            }
        })
        return result
    },
    formatJsData (jsData) {
        let message = {}
        jsData = jsData.xml
        if (typeof jsData ==='object') {
            for (let key in jsData) {
                let value = jsData[key]
                if (Array.isArray(value) && value.length>0) {
                    message[key] = value[0]
                }
            }
        }
        return message
    }
}