import React, { Component,useState,useMemo,useCallback,useRef,useEffect} from 'react'
/*import TestHook from './testHook'*/
import useTestHook from './testHook'
const useSize = () =>{
  const [size,setSize] = useState({
    width:document.documentElement.clientWidth,
    height:document.documentElement.clientHeight,
  })
  const onResize = useCallback(() =>{
    setSize({
      width:document.documentElement.clientWidth,
      height:document.documentElement.clientHeight,
    })
  })
  useEffect(() =>{
    console.log('初始化绑定')
    window.addEventListener('resize',onResize,false)
    return () =>{
      console.log('卸载初始化绑定')
      window.removeEventListener('resize',onResize,false)
    }
  },[])
  return (
    <div>
      <p>useSize自定义Hook</p>
      <p>width:{size.width},height:{size.height}</p>
    </div>
  )
}
/* 自定义Hook */
const useCount = (defaultCount) =>{
  let timer=useRef()
  const [count,setCount] = useState(defaultCount)
  useEffect(() =>{
    timer.current = setInterval(() =>{
      setCount( count =>count+1)
    },1000)
    return () =>clearInterval(timer.current)
  },[])
  useEffect(() =>{
    if(count>=10)clearInterval(timer.current)
  })
  return [count,setCount]
}
const HookContext = () =>{
  const [count,setCount ] =useCount(0)
  const TestHook = useTestHook(count)
  return (
    <div>
      {TestHook}
      <button onClick={() =>{
        setCount(count+1)
      }}>点击一下，count变化----{count}</button>
      {useSize()}
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
