import React, { Component,useState} from 'react'
import {CountContext} from './contextMarger'
import TestHook from './testHook'
const HookContext = () =>{
  const [count,setCount] = useState(0)
  return (
    <div>
      <CountContext.Provider value={count}>
        <button onClick={() =>setCount(count+3)}>点击一下，count变化----{count}</button>
        <TestHook/>
      </CountContext.Provider>
    </div>
  )
}
export default HookContext
/*export default class extends Component {
  // 初始化状态
  state = {}

  render() {
    return (
      <div>

      </div>
    )
  }
}*/
/*
  组件将要挂载时触发的函数：componentWillMount
  组件挂载完成时触发的函数：componentDidMount
  是否要更新数据时触发的函数：shouldComponentUpdate
  将要更新数据时触发的函数：componentWillUpdate
  数据更新完成时触发的函数：componentDidUpdate
  组件将要销毁时触发的函数：componentWillUnmount
  父组件中改变了props传值时触发的函数：componentWillReceiveProps
  */
