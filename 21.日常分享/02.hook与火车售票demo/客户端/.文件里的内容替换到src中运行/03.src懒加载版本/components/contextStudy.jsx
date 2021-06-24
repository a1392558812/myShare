import React, { Component,createContext } from 'react'
import Middle from './contextChild/Middle'
import ContextItem from './contextMargen'
export class ContextStudy extends Component {
  state = {
    count:0,
    nextCount:202,
  }
  addClick = () =>{
    this.setState({
      count: this.state.count+1,
      nextCount:this.state.nextCount+100,
    })
  }
  render() {
    return (
      /* provider生产者组件 */
      <ContextItem.Provider value={this.state.count}><br/>
          学习context
          <button onClick={this.addClick}>点击</button>
          <Middle/>
      </ContextItem.Provider>
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
