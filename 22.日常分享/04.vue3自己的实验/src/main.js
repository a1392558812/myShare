/* createRenderer */
import { createRenderer } from 'vue'
import App from "./App";
const { createApp } = createRenderer({
  // 创建元素
  createElement(tag, isSVG, is) {
    return {tag}
  },
  // 插入元素
  insert(child, parent, anchor) {
    child.parent = parent
    if (!parent.childs) {
      parent.childs = []
    } else {
      parent.childs.push(child)
    }
    // 如果当前节点是画布，执行绘画逻辑
    if (parent.nodeType === 1) {
      draw(child)
    }
  },
  // 元素属性比较
  patchProp(el, key, prevValue, nextValue) {
    el[key] = nextValue
  }
  // 自己平台其它更多的操作方法
  // ...
})
const draw = (el, noClear) => {
  if (!noClear) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
  if (el.tag === 'bar-chart') {
    const { data } = el
    const barWidth = canvas.width / 10,
      gap = 20,
      paddingLeft = (data.length * barWidth + (data.length - 1) * gap) / 3,
      paddingBootom = 10;
    data.forEach(({ title, count, color }, index) => {
      const x = paddingLeft + index * (barWidth + gap)
      const y = canvas.height - paddingBootom - count
      ctx.fillStyle = color
      ctx.fillRect(x, y, barWidth, count)
    })
  }

  // 递归
  el.childs && el.childs.forEach(child => draw(child, true))
}
let canvas, ctx;
function createCanvasApp(App) {
  const app = createApp(App)
  app.config.isCustomElement = tag => tag === 'bar-chart'
  const mount = app.mount
  // 重写mount方法，执行初始操作
  app.mount = function(selector) {
    canvas = document.createElement('canvas')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    document.querySelector(selector).appendChild(canvas)
    ctx = canvas.getContext('2d')
    mount(canvas)
  }
  // 返回app，以供链式调用及摇数优化
  return app
}
const app = createCanvasApp(App)
app.mount('#app')

