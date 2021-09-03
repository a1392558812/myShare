import React, { Component,useState,useMemo,useCallback,useRef,useEffect} from 'react'
import TestHook from './testHook'
const HookContext = () =>{
  let timer=useRef()
  /* 当使用let timer声明的时候，由于定时器的执行，导致页面每次都重新渲染，此时的timer不是
    clearInterval（）对应的timer了，所以
          useEffect(() =>{
            if(count>=10)clearInterval(timer)
        })
    并不会清除定时器
    但是使用了 let timer=useRef()，useRef()可以保存上一次渲染的timer，保证是同一个timer
  */
  const [count,setCount] = useState(0)
  const [ClickCount,setClickCount] = useState(0)
  const TestHookRef = useRef()
  const reCount = useMemo(() =>{
    return count*3
  },[count===10])
  /* useMemo可以依赖于另一个useMemo */
  const otherReCount = useMemo(() =>{
    return count%2
  },[reCount])
  /* 如果useMemo返回的是函数，可以使用useCallback省略包装函数*/
  /* useMemo(() => fn) === useCallback(fn) */
  const handelClick = useCallback(() =>{
    console.log('点击了')
    setClickCount((ClickCount)=>ClickCount+1)
    TestHookRef.current.sonFun()
  },[TestHookRef])
  useEffect(() =>{
    timer.current = setInterval(() =>{
      setCount( count =>count+1)
    },1000)
  },[])
  useEffect(() =>{
    if(count>=10)clearInterval(timer.current)
  })
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
      <TestHook ref={TestHookRef} reCount={reCount} handelClick={handelClick}/>
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
