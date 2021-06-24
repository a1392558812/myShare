import React, { memo } from 'react'
import {useMappedState,useDispatch} from 'redux-react-hook'
import classnames from 'classnames'
import PropTypes from 'prop-types'

import {handelUpdate} from '../../redux/asyncActions'
import './choose.css'


const Choose = memo((props) =>{
  const dispatch = useDispatch()
  const {
    passengers
  } = useMappedState(state => state).orderReducer
  const createSeat = (seatType) =>{
    return (
      <div>
        {
          passengers.map((passenger) =>{
            return (
              <p
                onClick={() =>{
                  handelUpdate(dispatch,passenger.id,{
                    seat:seatType
                  })
                }}
                key={passenger.id}
                data-text={seatType}
                className={classnames('seat',{active:passenger.seat === seatType})}>
                &#xe02d;
              </p>
            )
          })
        }
      </div>
    )
  }
  return(
    <div className='choose'>
      <p className='tip'>在线选座</p>
      <div className='container'>
        <div className='seats'>
          <div>窗</div>
          {createSeat('A')}
          {createSeat('B')}
          {createSeat('C')}
          <div>过道</div>
          {createSeat('D')}
          {createSeat('F')}
          <div>窗</div>
        </div>
      </div>
    </div>
  )
})
Choose.propTypes = {

}

export default Choose