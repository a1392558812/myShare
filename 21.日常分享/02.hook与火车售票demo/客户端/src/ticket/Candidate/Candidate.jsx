import React, {memo,useState,useCallback} from 'react'
import PropTypes from 'prop-types'
import {useMappedState,useDispatch} from 'redux-react-hook'
import './candidate.css'
import Seat from './Seat'

const Candidate = memo(() =>{
  const {tickets} = useMappedState(state => state).ticketReducer
  const [expandedIndex,setExpandedIndex] = useState(-1)
  const handelClick = useCallback((index) =>{
    setExpandedIndex(index === expandedIndex? -1: index)
  },[expandedIndex])
  return (
    <div className='candidate'>
      <ul>
        {
          tickets.map((ticket,index) =>{
            console.log(ticket)
            return (
              <Seat
                index={index}
                key={ticket.type}
                channels={ticket.channels}
                priceMsg={ticket.priceMsg}
                ticketsLeft={ticket.ticketsLeft}
                type={ticket.type}
                handelClick={handelClick}
                expanded={expandedIndex ===index}/>
            )
          })
        }
      </ul>
    </div>
  )
})
export default Candidate