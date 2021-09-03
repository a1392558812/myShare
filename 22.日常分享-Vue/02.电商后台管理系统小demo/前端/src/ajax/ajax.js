import axios from 'axios'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 在request函数中展示进度条
axios.interceptors.request.use((config) => {
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  config.headers._id = window.sessionStorage.getItem('_id')
  console.log("头部挂载")
  return config
})
// 在response函数中隐藏进度条
axios.interceptors.response.use((config) => {
  NProgress.done()
  return config
})

export default function ajax(url, data = {}, method = 'GET') {
  return new Promise(function (resolve, reject) {
    let promise
    if (method === "GET") {
      let paramStr = ""
      Object.keys(data).forEach(key => {
        if(data[key]||data[key] === 0){
          paramStr += key + "=" + data[key] + "&"
        }
      })
      if (paramStr) {
        paramStr = paramStr.substring(0, paramStr.length - 1)
      }
      url = url + "?" + paramStr
      promise = axios.get(url)
    } else {
      promise = axios.post(url, data)
    }
    promise
      .then(function (response) {
        resolve(response.data)
      })
      .catch(function (error) {
        reject(error)
      })
  })
}
