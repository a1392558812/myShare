import React, {memo,useMemo} from 'react'
import PropTypes from 'prop-types'
import {useMappedState} from 'redux-react-hook'
import dayjs from 'dayjs'
import URI from 'urijs'
import './candidate.css'
import { objToUrl } from '../../common/tools'

const Channel = memo((props) =>{
  const {
    trainNumber,
    departStation,
    arriveStation,
    departDate
  } = useMappedState(state => state).ticketReducer
  const {
    type,
    name,
    desc,
  } = props
  const url = useMemo(() =>{
    return new URI('order.html') + objToUrl({
      trainNumber,
      dStation:departStation,
      aStation:arriveStation,
      date:dayjs(departDate).format('YYYY-MM-DD'),
      type,
    })
  },[])
  return (
    <div className='channel'>
      <div className='middle'>
        <div className='name'>{name}</div>
        <div className='desc'>{desc}</div>
      </div>
      <a href={url} className='buy-wrapper'>
        <div className='buy'>买票</div>
      </a>
    </div>
  )
})

Channel.propTypes = {
  type:PropTypes.string.isRequired,
  name:PropTypes.string.isRequired,
  desc:PropTypes.string.isRequired,
}

export default Channel