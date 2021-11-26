import React, { useState } from 'react'
// 坑爹行为，定义名称要大写
const MyHooks = (initVal) =>{
  initVal = '🍔'+initVal
  const [val , setCount] = useState(initVal)
  return [val, () =>{
    setCount(val+1)
  }]
}
export default () =>{
  const [count , addCount] = MyHooks(0)
  return(
    <div>
      <span>我的Hooks学习:{count}</span>
      <button onClick={() =>addCount()}> 点击一下</button>
    </div>
  )
}
/*export default class list extends Component {
  state = {

  }
  render() {
    return (
      <div>
        我的Hooks学习:
        <button> 点击一下</button>
      </div>
    )
  }
}*/
