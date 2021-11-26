import Vue from 'vue'
import loading from '../test6.vue'

const Loading = {}

Loading.install = (Vue) => { // 注册组件，即全局注册，我在main.js中集中注册了，所以在这里注释了
  Vue.component('loading', loading)
  console.log('Vue', Vue)
}
let currentLoading // 当前实例

Loading.show = function (options ={}) {
  const LoadingInstance = Vue.extend(loading)
  const initInstance = () => {
    currentLoading = new LoadingInstance({propsData: { showModal: options === undefined ? true : options.showModal }})
    let LoadingEl = ''
    LoadingEl = currentLoading.$mount().$el
    console.log('options', options)
    if (options && options.target) {
      options.target.appendChild(LoadingEl)
    } else {
      document.body.appendChild(LoadingEl)
    }
    return LoadingEl
  }
  if (currentLoading) {
    Loading.close()
    currentLoading = null
  }
  initInstance()
  if (typeof options === 'object') { // 在这里我们通过options，和confirm，cancel重写了实例里面的方法
    Object.assign(currentLoading, options, { showModal: true })
  }
}
Loading.close = () => {
  if (currentLoading) {
    Object.assign(currentLoading, { showModal: false })
  }
}
export default Loading
