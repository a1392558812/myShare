import React, { Component,useState,useMemo} from 'react'
import TestHook from './testHook'
const HookContext = () =>{
  const [count,setCount] = useState(0)
  /* useMemo的逻辑类似与useEffect，第二个参数确定逻辑回调是否执行
      1. 与useEffect相似：如果传入空数组，则该函数只会在渲染时执行一次
      2. useEffect执行的是副作用，所以一定是在渲染之后运行，
      3. useMemo是有返回值的，返回值可以直接参与渲染，useMemo是在渲染期间完成的
   */
  const reCount = useMemo(() =>{
    return count*3
  },[count===10])
  /* useMemo可以依赖于另一个useMemo */
  const otherReCount = useMemo(() =>{
    return count%2
  },[reCount])
  const handelClick = ()=>{
    console.log('点击了')
  }
x
  console.log('父组件渲染了')
  return (
    <div>
      <button onClick={() =>{
        setCount(count+1)
        handelClick()
      }}>点击一下，count变化----{count}</button>
      <p style={{backgroundColor:"skyblue"}}>useMemo返回的reCount  :{reCount}</p>
      <p>{(count >20).toString()}--{count}</p>
      <p>useMemo返回的otherReCount  :{otherReCount}</p>
      {/* 点击造成的 handelClick函数的执行，导致handelClick变化，此时TestHook组件重新渲染，
          即使reCount值并没有发生改变
      */}
      <TestHook reCount={reCount} handelClick={handelClick}/>
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
