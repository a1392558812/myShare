import axios from 'axios'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// axios请求拦截器，
axios.interceptors.request.use((config) => {
  // 在request函数中展示进度条
  NProgress.start()
  // 配置自己的一些请求之前的处理,例如添加token等
  return config
})

// axios响应拦截器，
axios.interceptors.response.use((config) => {
  // 在response函数中隐藏进度条
  NProgress.done()
  // 配置一些额外处理 比如404 301 400等
  return config
})

export default {
  get: (url) => {
    return new Promise((resolve, reject) => {
      axios.get(url)
        .then(res => {
          resolve(res)
        })
        .catch(e => {
          NProgress.done()
          reject(e)
        })
    })
  }
}
