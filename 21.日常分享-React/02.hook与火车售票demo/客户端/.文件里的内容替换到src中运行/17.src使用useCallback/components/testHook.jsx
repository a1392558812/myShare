import React, { memo} from 'react'
import PropTypes  from 'prop-types'
const TestHook = memo((props) =>{
  console.log('TestHook子组件渲染了')
  return(
    <div style={{border:'1px solid black',marginTop:'10px'}}>
      <span>testHook</span>
      <h2 onClick={props.handelClick}>无状态函数组件count的值为:{props.reCount}</h2>
    </div>
  )
})

TestHook.propTypes = {
  reCount: PropTypes.number.isRequired,
  handelClick:PropTypes.func.isRequired
}
export default TestHook
/*export default class TestHook extends Component {
  static contextType = CountContext
  // 初始化状态
  state = {}
  render(){
    return(
      <h2>count的值为{this.context}</h2>
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
