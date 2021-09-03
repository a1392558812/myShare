import React, { PureComponent,/*Component*/ } from 'react'

/* PureComponent使用PureComponent方法，可以实现简单的避免重复渲染

* 但是PureComponent有局限性，只能监测到一般数据的改变，无法监测类似于数组、对象的变化 */
import PropTypes from 'prop-types'
export default class MemoStudy extends PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired
  }
  // 初始化状态
  state = {
    num:0
  }
  addClick =()=>{
    this.setState({num: this.state.num + 1})
  }
  render() {
     /* 父组件改变，子组件并未改变，
     但是随着父组件的更新，子组件也需要重新渲染，
     */
    console.log('MemoStudy组件渲染了')
    return (
      <div>
        <span> 康康值的改变！！：{this.state.num}</span>
        <button onClick={this.addClick}>点击一下</button>
      </div>
    )
  }
}
/*
  组件将要挂载时触发的函数：componentWillMount
  组件挂载完成时触发的函数：componentDidMount
  是否要更新数据时触发的函数：shouldComponentUpdate
  将要更新数据时触发的函数：componentWillUpdate
  数据更新完成时触发的函数：componentDidUpdate
  组件将要销毁时触发的函数：componentWillUnmount
  父组件中改变了props传值时触发的函数：componentWillReceiveProps
  */
