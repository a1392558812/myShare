export default {
  abstract: true, // 标记为抽象组件
  setup (props) {
    const handelClick = (callBack) => {
      return () => {
        const time = new Date().getTime() % 3 // 模拟的权限判断，意思一下，动态产生true和false就行
        console.log('做了一些逻辑判读后handelClick点击了')
        if (time) {
          console.log('👴要执行')
          callBack && callBack()
        } else {
          console.log('👴不要执行')
        }
      }
    }
    return {
      handelClick
    }
  },
  render () {
    const vNode = this.$slots.default()[0]
    const vNodeClick = vNode.props.onClick
    vNode.props.onClick = this.handelClick(vNodeClick)
    console.log('vNode', vNodeClick)
    return vNode
  }
}
