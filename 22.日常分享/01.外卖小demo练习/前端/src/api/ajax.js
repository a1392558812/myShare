/* ajax请求模块 */
import axios from 'axios'
export default function ajax (url,data={},method='GET') { // 返回值是一个promise对象
  return new Promise(function (resolve,reject) {
    // 执行异步ajax请求
    let promise
    if (method === "GET") { // 发生get请求
      // {username:lucky,password:666}---->拼串----->paramStr =username=lucky&password=666
      let paramStr = ""
      Object.keys(data).forEach(key => {
        paramStr+=key + "=" +data[key]+ "&"
      })
      if (paramStr) {
        paramStr = paramStr.substring(0,paramStr.length-1)
      }
      url = url + "?" + paramStr
      promise = axios.get(url) // 使用axios发生get请求
    }else{ // 发生post请求
      promise = axios.post(url,data) // 使用axios发送post请求
    }
    promise // 异步返回的数据是response.data
      .then(function (response) { //成功调用resolve()
        resolve(response.data)
    })
      .catch(function (error) { // 失败调用reject()
        reject(error)
      })
  })
}


