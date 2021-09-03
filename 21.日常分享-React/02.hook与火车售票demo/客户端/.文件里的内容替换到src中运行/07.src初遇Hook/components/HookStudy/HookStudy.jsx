import React, {useState } from 'react'

const HookChild =(props) =>{
  console.log(props)
  // count类似于state中的值，setCount类似于setState,参数0,类似初始化state的count
  // useState允许接受一个回调函数，异步赋值，延迟初始化
  const [count,setCount] = useState(() =>{
    console.log('const [count,setCount] = useState(() =>{}初始化函数调用)')
    return props.count||0
  })
  const [food,setFood] = useState('🍋📷🐷')
  /* 所有的useState-Hook都必须执行相同的次数，尽可能避免在for循环或者渲染的条件语句中调用useState-Hook */
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
export default HookChild
/*export default class HookStudy extends Component {
  // 初始化状态
  state = {
    count:0
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
