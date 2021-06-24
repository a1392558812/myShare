import React,{PureComponent} from 'react'
import MemoStudy from './MemoStudy/MemoStudy'
export default class Home extends PureComponent{
  constructor(props){
    super(props)
    // 初始化状态
    this.state = {
      content:'奥利给'
    }
  }
  clickFun=()=>{
    this.setState({
      content:'🍔'
    })
    console.log(this)
  }
  render(){
    console.log('home组件渲染了')
    return(
      <div>
        <span onClick={this.clickFun}>{this.state.content}</span>
        <div>
          <span>................................</span>
          <MemoStudy name='ifShouldReRender'/>
        </div>
      </div>
    )
  }
}
/*constructor (props) {
    super(props)
  }
  组件将要挂载时触发的函数：componentWillMount
  组件挂载完成时触发的函数：componentDidMount
  是否要更新数据时触发的函数：shouldComponentUpdate
  将要更新数据时触发的函数：componentWillUpdate
  数据更新完成时触发的函数：componentDidUpdate
  组件将要销毁时触发的函数：componentWillUnmount
  父组件中改变了props传值时触发的函数：componentWillReceiveProps
  */
