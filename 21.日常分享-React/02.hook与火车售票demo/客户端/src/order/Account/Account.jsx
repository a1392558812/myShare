import React, {memo,useState} from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import './account.css'
import { useMappedState } from 'redux-react-hook'

const Account = memo((props) =>{
  const {price,passengers} = useMappedState(state => state).orderReducer
  const [expanded,setExpanded] = useState(false)
  console.log(price)
  return(
    <div className='account'>
      <div
        className={classnames('price',{expanded})}
        onClick={() =>{
          setExpanded(!expanded)
        }}>
        <div className='money'>{passengers.length * price}</div>
        <div className='amount'>支付金额</div>
      </div>
      <div className='button'>提交按钮</div>
      <div
        onClick={() =>setExpanded(false)}
        className={classnames('layer', {hidden: !expanded})}/>
       <div className={classnames('detail', {hidden: !expanded})}>
         <div className='title'>金额详情</div>
         <ul>
            <li>
              <span>🚂火车票</span>
              <span>￥{price}</span>
              <span>&#xD7;{passengers.length}</span>
            </li>
         </ul>
       </div>
    </div>
  )
})

export default Account