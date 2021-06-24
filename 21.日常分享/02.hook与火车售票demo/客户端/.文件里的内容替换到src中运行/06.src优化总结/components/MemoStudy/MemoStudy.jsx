import React, {memo} from 'react'
import PropTypes from 'prop-types'
// 无状态组件
export default memo((props) =>{
  /*
    简单的归结：
      1. PureComponent 提供了简单的对比算法，来避免重复的刷新
      2. (class函数组件)可以手动调用shouldComponentUpdate(nextProps, nextState, nextContext) {}
          函数来优化渲染
      3. 无状态组件可以通过memo来包装实现类似PureComponent的效果
  */
  const propTypes = {
    name: PropTypes.string.isRequired
  }
  return (
    <div>
      {console.log('MemoStudy渲染了')}
      MemoStudy无状态组件
    </div>
  )
})
/*
  组件将要挂载时触发的函数：componentWillMount
  组件挂载完成时触发的函数：componentDidMount
  是否要更新数据时触发的函数：shouldComponentUpdate
  将要更新数据时触发的函数：componentWillUpdate
  数据更新完成时触发的函数：componentDidUpdate
  组件将要销毁时触发的函数：componentWillUnmount
  父组件中改变了props传值时触发的函数：componentWillReceiveProps
  */

