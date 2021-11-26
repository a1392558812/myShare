import React, { Component} from 'react'
import ContextItem from '../contextMargen'
class Customer extends Component {
  static contextType = ContextItem
  render() {
    const count = this.context
    return (
      <span>消费者组件,context的值为：{count}</span>
    )
  }
}
export default Customer
/*<TestCreateContext.Consumer>
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
     </TestCreateContext.Consumer>*/
/*
  组件将要挂载时触发的函数：componentWillMount
  组件挂载完成时触发的函数：componentDidMount
  是否要更新数据时触发的函数：shouldComponentUpdate
  将要更新数据时触发的函数：componentWillUpdate
  数据更新完成时触发的函数：componentDidUpdate
  组件将要销毁时触发的函数：componentWillUnmount
  父组件中改变了props传值时触发的函数：componentWillReceiveProps
  */
