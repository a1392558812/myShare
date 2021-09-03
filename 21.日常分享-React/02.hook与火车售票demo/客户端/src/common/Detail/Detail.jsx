import React, {memo ,useMemo,useCallback} from 'react'
import {useMappedState,useDispatch} from 'redux-react-hook'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import PropTypes from 'prop-types'

import './detail.css'

const Detail = memo((props) =>{
  const {
    departDate,
    arriveDate,
    departTimeStr,
    arriveTimeStr,
    departStation,
    arriveStation,
    trainNumber,
    durationStr,
  } = props
  const dateStr = (date) =>{
    const result = dayjs(date)
    return result.format('MM-DD')+ ' '+result.locale('zh-cn').format('ddd')
  }
  const departDateStr = useMemo(() =>{
    return dateStr(departDate)
  },[departDate])
  const arriveDateStr = useMemo(() =>{
    return dateStr(arriveDate)
  },[arriveDate])
  console.log(departTimeStr)
  return (
    <div className='detail'>
      <div className='content'>
        <div className='left'>
          <p className='city'>{departStation}</p>
          <p className='time'>{departTimeStr}</p>
          <p className='date'>{departDateStr}</p>
        </div>
        <div className='middle'>
          <p className='train-name'>{trainNumber}</p>
          <p className='train-mid'>
            {
              props.children
            }
          </p>
          <span className='train-time'>耗时{durationStr}</span>
        </div>
        <div className='right'>
          <p className='city'>{arriveStation}</p>
          <p className='time'>{arriveTimeStr}</p>
          <p className='date'>{arriveDateStr}</p>
        </div>
      </div>
    </div>
  )
})
Detail.propTypes = {
  departDate: PropTypes.number.isRequired,
  arriveDate: PropTypes.number.isRequired,
  departTimeStr: PropTypes.string,
  arriveTimeStr: PropTypes.string,
  trainNumber: PropTypes.string.isRequired,
  departStation: PropTypes.string.isRequired,
  arriveStation: PropTypes.string.isRequired,
  durationStr: PropTypes.string,
}

export default Detail