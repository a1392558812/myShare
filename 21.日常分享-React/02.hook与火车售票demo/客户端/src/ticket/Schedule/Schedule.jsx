import React, {memo,useState,useEffect,useCallback} from 'react'
import PropTypes from 'prop-types'
import datjs from 'dayjs'
import './schedule.css'
import ScheduleRow from './ScheduleRow'

import { useMappedState, useDispatch } from "redux-react-hook";
import { requestScheduleList } from '../../ajax'
const Schedule = memo(() =>{
  const {
    departDate,
    departStation,
    arriveStation,
    trainNumber,
    isScheduleVisible
  } = useMappedState(state => state).ticketReducer
  const [scheduleList,setScheduleList ] = useState([])
  const getRequestScheduleList = useCallback(async ({departDate,departStation,arriveStation,trainNumber}) =>{
    if(isScheduleVisible){
      const result = await requestScheduleList({departDate,departStation,arriveStation,trainNumber})
      console.log(result)
      if(result.code === 0){
        let departRow
        let arrowRow
        result.data.forEach((item,index) =>{
          if(!departRow){
            if(item.station === departStation){
              item.isDepartStation = true
              item.isArriveStation = false
              item.beforeDepartStation = false
              item.afterArriveStation = false
              departRow = item
            }else{
              item.isDepartStation = false
              item.isArriveStation = false
              item.beforeDepartStation = true
              item.afterArriveStation = false
            }
          }else if(!arrowRow){
            if(item.station === arriveStation){
              item.isDepartStation = false
              item.isArriveStation = true
              item.beforeDepartStation = false
              item.afterArriveStation = false
              arrowRow = item
            }else{
              item.isDepartStation = false
              item.isArriveStation = false
              item.beforeDepartStation = false
              item.afterArriveStation = false
            }
          }else{
            item.isDepartStation = false
            item.isArriveStation = false
            item.beforeDepartStation = true
            item.afterArriveStation = false
          }
          item.isStartStation = index === 0;
          item.isEndStation = index === result.data.length - 1;
        })
        setScheduleList(result.data)
      }else{
        console.log('服务器出错了啊！！！')
      }
    }
  },[])
  useEffect(() =>{
    if(isScheduleVisible){
      getRequestScheduleList({departDate:datjs(departDate).format('YYYY-MM-DD'),departStation,arriveStation,trainNumber})
    }
  },[
    isScheduleVisible,
    departDate,
    departStation,
    arriveStation,
    trainNumber])
  return (
    <div className='schedule'>
      <div className='dialog'>
        <h1>列车时刻表</h1>
        <div className='head'>
          <span className='station'>车站</span>
          <span className='deptime'>到达</span>
          <span className='stoptime'>停留时间</span>
        </div>
        <ul>
          {
            scheduleList.map((schedule,index) =>{
              return (
                <ScheduleRow key={schedule.station} index={index+1} {...schedule}/>
              )
            })
          }
        </ul>
      </div>
    </div>
  )
})


export default Schedule