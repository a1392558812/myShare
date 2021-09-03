import axios from 'axios'
axios.interceptors.request.use((config ) =>{
  let url = config.url
  if(config.method === 'get'){
    url.indexOf('?') === -1 ? config.url = url+'?_='+(new Date().getTime()) : config.url = url+'&_='+(new Date().getTime())
  }
  return config
})
export default function ajax (url,data={},method='GET') {
  return new Promise(function (resolve,reject) {
    let promise
    if (method === "GET") {
      let paramStr = ""
      Object.keys(data).forEach(key => {
        paramStr+=key + "=" +data[key]+ "&"
      })
      if (paramStr) {
        paramStr = "?" + paramStr.substring(0,paramStr.length-1)
      }
      url = url + paramStr
      promise = axios.get(url)
    }else{
      promise = axios.post(url,data)
    }
    promise
      .then(function (response) {
        resolve(response.data)
      })
      .catch(function (error) {
        reject(error)
        alert("出错了："+error)
      })
  })
}