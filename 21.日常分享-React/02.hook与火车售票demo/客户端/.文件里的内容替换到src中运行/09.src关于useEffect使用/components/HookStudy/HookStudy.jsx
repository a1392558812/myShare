import React, {useState,Component,useEffect } from 'react'
// Hooks并不关心生命周期的componentWillMount,componentDidMount
// 统一在渲染后调用
const HookChild =(props) =>{
  const [food,setFood] = useState('🍋📷🐷')
  const [count,setCount] = useState(() =>{
    console.log('const [count,setCount] = useState(() =>{}延迟初始化函数调用)')
    return props.count||0
  })
  const [size,setSize] = useState({
      width:document.documentElement.clientWidth,
      height:document.documentElement.clientHeight
  })
  const onResize = () =>{
    setSize({
      width:document.documentElement.clientWidth,
      height:document.documentElement.clientHeight
    })
  }
  useEffect(() =>{
    document.title = count
  })
  /*  第二个参数是一个数组，当数组内每一项都不变时，才会阻止useEffect的执行
    1. 不传数组，意味着每次渲染都会执行useEffect，----->{包含了整个class组件的生命周期}
    2. 传入空数组，由于[]===[]，所以只会执行一次 ----->{包含了class组件的生命周期的componentWillMount与componentDidMount}
  */
  useEffect(()=>{
    window.addEventListener('resize',onResize,false)
    // 该return函数会在视图被销毁(组件被销毁或者重新渲染)触发
    return () =>{
      window.removeEventListener('resize',onResize,false)
    }
  },[])
  const PClick = (e) =>{
    console.log('useEffect()---document.querySelector(#thisP)执行',e)
  }
/*_______________________________________________________________________________________________________*/
  /* 测试useEffect第二个参数不同的值 */
  // 代表每次count值变化，该useEffect都会执行，且size的变化不会触发该useEffect的行为
  useEffect(() =>{
    console.log('触发useEffect()--count:',count)
  },[count])
  useEffect(() =>{
    document.querySelector('#thisP').addEventListener('click',PClick,false)
    /* 此种情况下，DOM结构被替换，addEventListener事件失效 */
  },[])
/*_____________________________________________________________________________________________________*/
  return (
    <div>
      <p>...........hook......................</p>
      <button onClick={() =>setCount(count+1)}>点击就增加count</button>
      <p>当前count % 2 ===0值为=>{(count % 2 ===0).toString()}</p>
      <p style={{backgroundColor:'skyblue'}}>count---{count}</p>
      <button onClick={() =>setFood(food+'👴恰🍔')}>点击就增加food</button>
      <p style={{backgroundColor:'pink'}}>food---{food}</p>
      {
        count % 2 ===0
          ? <p id='thisP'>size：{size.width} x {size.height}</p>
          : <span id='thisP'>根据count切换的p标签</span>
      }
    </div>
  )
}
export default HookChild
/*export default class HookChild extends Component {
  state = {
    count:0,
    size:{
      width:document.documentElement.clientWidth,
      height:document.documentElement.clientHeight,
    }
  }
  componentDidMount() {
    document.title = this.state.count
    window.addEventListener('resize',this.onResize,false)
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    document.title = this.state.count
  }
  componentWillUnmount() {
    window.removeEventListener('resize',this.onResize,false)
  }

  onResize =()=>{
    this.setState({
      size:{
        width:document.documentElement.clientWidth,
        height:document.documentElement.clientHeight,
      }
    })
  }
  addClick = () =>{
    this.setState({
      count:this.state.count+1+'🍋'
    })
  }
  render() {
    return (
      <div>
        <span>.................................</span>
        <button onClick={this.addClick}>点击就增加{this.state.count}</button>
        <p>size：{this.state.size.width} x {this.state.size.height}</p>
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
