import React,{PureComponent} from 'react'
export default class Home extends PureComponent{
  constructor(props){
    super(props)
    // 初始化状态
    this.state = {
      count:0
    }
  }
  clickFun=()=>{
    this.setState({
      count:this.state.count + 3
    })
  }
  render(){
    return (
      <div>
        <button onClick={this.clickFun}>点击一下{this.state.content}</button>
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
