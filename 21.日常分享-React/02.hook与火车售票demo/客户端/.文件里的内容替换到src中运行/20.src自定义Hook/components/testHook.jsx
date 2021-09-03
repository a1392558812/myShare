import React, {PureComponent, memo} from 'react'
import PropTypes  from 'prop-types'
/* 自定义Hook组件 */
const useTestHook = (count) =>{
  return(
    <div style={{border:'1px solid black',marginTop:'10px'}}>
      <span>testHook</span>
      <h2>无状态函数组件count的值为:{count}</h2>
    </div>
  )
}
export default useTestHook
/*export default class TestHook extends PureComponent {
  static propTypes = {
    count: PropTypes.number.isRequired,
  }
  render(){
    console.log('子组件渲染了')
    return(
      <div style={{border:'1px solid black',marginTop:'10px'}}>
        <span>testHook</span>
        <h2>无状态函数组件count的值为:{this.props.count}</h2>
      </div>
    )
  }
  /!*render() {
    return (
      <div>
        <CountContext.Consumer>
          {
            count =>(
              <h2>count的值为{count}</h2>
            )
          }
        </CountContext.Consumer>
      </div>
    )
  }*!/
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
