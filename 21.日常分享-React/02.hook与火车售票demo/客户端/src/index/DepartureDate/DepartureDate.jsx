import React, {useMemo,useCallback,memo} from 'react'
import { useMappedState, useDispatch } from "redux-react-hook";
import dayjs from 'dayjs'
import './departureData.css'
import {formatFun,getWeek} from './handelData'
import {
  setIfOpenDateModal
} from '../../redux/actions'
const DepartureData =memo((props) =>{
  const {departTime:time,ifOpenDateModal} = useMappedState(state => state).trainReducer
  const dispatch = useDispatch()
  const formatTime = formatFun(time)
  const timerShowStr = useMemo(() =>{
    console.log('执行了timerShowStr函数')
    return dayjs(time).format('YYYY-MM-DD')
  },[formatTime])
  const weekString = useMemo(() =>{
    return getWeek(new Date(timerShowStr))
  },[timerShowStr])
  const ifToday = formatTime === formatFun()
  const handelOpenDataModel = useCallback(() =>{
    console.log('handelOpenDataModel执行了')
    dispatch(setIfOpenDateModal(true))
  },[])
  return(
    <div className='delete-date' onClick={() =>{
      handelOpenDataModel()
    }}>
      <input type="hidden" name='data' value={timerShowStr}/>
      {timerShowStr}
      <span className='depart-week'>{
        ifToday
          ? weekString+'  (👴今天)'
          : weekString
      }</span>
    </div>
  )
})
export default DepartureData
