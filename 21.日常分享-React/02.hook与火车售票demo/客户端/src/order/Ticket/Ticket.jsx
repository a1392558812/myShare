import React, {memo} from 'react'
import {useMappedState,useDispatch} from 'redux-react-hook'
import './ticket.css'

const Ticket =memo(() =>{
  const {price,seatType} = useMappedState(state => state).orderReducer

  return (
    <div className='ticket'>
      <p>
        <span className='ticket-type'>{seatType}</span>
        <span className='ticket-price'>{price}</span>
      </p>
      <div className='label'>坐席</div>
    </div>
  )
})

export default Ticket