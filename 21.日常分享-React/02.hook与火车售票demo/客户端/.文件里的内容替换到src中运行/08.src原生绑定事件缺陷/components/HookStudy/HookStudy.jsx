import React, {useState,Component } from 'react'

// 绑定事件addEventListener很容易忘记在componentWillUnmount中解绑，此外
// document.title = this.state.count同一个函数，不得不在不同的生命周期中调用
export default class HookChild extends Component {
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
}
/*const HookChild =(props) =>{
  console.log(props)
  const [count,setCount] = useState(() =>{
    console.log('const [count,setCount] = useState(() =>{}初始化函数调用)')
    return props.count||0
  })
  const [food,setFood] = useState('🍋📷🐷')
  return (
    <div>
      <p>...........hook......................</p>
      <button onClick={() =>setCount(count+2)}>点击就增加count</button>
      <p style={{backgroundColor:'skyblue'}}>count---{count}</p>
      <button onClick={() =>setFood(food+'👴恰🍔')}>点击就增加food</button>
      <p style={{backgroundColor:'pink'}}>food---{food}</p>
    </div>
  )
}
export default HookChild*/
/*
  组件将要挂载时触发的函数：componentWillMount
  组件挂载完成时触发的函数：componentDidMount
  是否要更新数据时触发的函数：shouldComponentUpdate
  将要更新数据时触发的函数：componentWillUpdate
  数据更新完成时触发的函数：componentDidUpdate
  组件将要销毁时触发的函数：componentWillUnmount
  父组件中改变了props传值时触发的函数：componentWillReceiveProps
  */
