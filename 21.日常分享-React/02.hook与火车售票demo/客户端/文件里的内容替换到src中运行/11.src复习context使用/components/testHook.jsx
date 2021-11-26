import React, { Component,/*PureComponent*/ } from 'react'
import {CountContext} from './contextMarger'
/* PureComponent有局限性，只能监测到一般数据的改变，无法监测类似于数组、对象的变化 */
export default class TestHook extends Component {
  static contextType = CountContext
  // 初始化状态
  state = {}

  render(){
    return(
      <h2>count的值为{this.context}</h2>
    )
  }
  /*render() {
    return (
      <div>
        <CountContext.Consumer>
          {
            count =>(
              <h2>count的值为{count}</h2>
            )
          }
        </CountContext.Consumer>
      </div>
    )
  }*/
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
