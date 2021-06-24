import React, {memo} from 'react'
import PropTypes from 'prop-types'
import Channel from './Channel'

const Seat = memo((props) =>{
  const {type,priceMsg,ticketsLeft,channels,expanded,handelClick,index } = props
  return (
    <li>
      <div className='bar'>
        <span className='seat'>{type}</span>
        <span className='price'>
          <i>￥</i>{priceMsg}
        </span>
        <button className='btn' onClick={() =>{
          handelClick(index)
        }}>{expanded
          ? '收起'
          : '预定'
        }</button>
        <span className='num'>{ticketsLeft}</span>
      </div>
      <div className='channels' style={{
        height: expanded
          ? channels.length * 55 + 'px'
          :0
      }}>
        {
          channels.map((channel,index) =>{
            return(
              <Channel key={channel.name} type={type} name={channel.name} desc={channel.desc}/>
            )
          })
        }
      </div>
    </li>
  )
})

Seat.propTypes = {
  type:PropTypes.string.isRequired,
  priceMsg:PropTypes.string.isRequired,
  ticketsLeft:PropTypes.string.isRequired,
  channels:PropTypes.array.isRequired,
  expanded:PropTypes.bool.isRequired,
  handelClick:PropTypes.func.isRequired,
  index:PropTypes.number.isRequired,
}
export default Seat