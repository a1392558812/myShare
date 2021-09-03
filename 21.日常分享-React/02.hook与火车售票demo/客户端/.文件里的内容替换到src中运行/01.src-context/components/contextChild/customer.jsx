import React, { Component } from 'react'
// createContext(defaultValue)可以使用多个，但是强烈建议只使用一个
import {TestCreateContext,NextTestCreateContext} from '../contextStudy'
export default class extends Component {
  constructor(props) {
    super(props)
    // 初始化状态
    this.state = {}
  }
  render() {
    return (
      <TestCreateContext.Consumer>
        {contextValue =>(
          <NextTestCreateContext>
            {
              (nextCount) =>(
                <div>
                  <span>消费者组件,context的值为：{contextValue}</span>
                  <span>消费者组件,nextContext的值为：{nextCount}</span>
                </div>
              )
            }
          </NextTestCreateContext>
        )}
      </TestCreateContext.Consumer>
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
