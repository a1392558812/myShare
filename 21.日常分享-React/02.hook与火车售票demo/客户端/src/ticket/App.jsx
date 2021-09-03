import React, { useEffect, useCallback, useMemo, lazy, Suspense } from 'react'

import { useMappedState, useDispatch } from "redux-react-hook";
import URI from 'urijs'
import dayjs from 'dayjs'

import Detail from '../common/Detail/Detail'
import Nav from '../common/Nav/Nav'
import Header from '../common/Header/Header'
import Candidate from './Candidate/Candidate'
/*import Schedule from './Schedule/Schedule'*/

import './App.css'
import { formatFun } from '../index/DepartureDate/handelData'
import {
  arriveStationAction,
  departDateAction,
  departStationAction,
  ifSearchParsedAction, isScheduleVisibleAction,
  trainNumberAction
} from '../redux/actions'

import useNavHook from '../common/Nav/useNavHook'
import { getRequestTicket } from '../redux/asyncActions'

const App = (props) =>{
  const Schedule = lazy(() =>{
    return import('./Schedule/Schedule')
  })
  const {
    departDate,
    arriveDate,
    departTimeStr,
    arriveTimeStr,
    departStation,
    arriveStation,
    trainNumber,
    durationStr,
    tickets,
    isScheduleVisible,
    ifSearchParsed,
  } = useMappedState(state => state).ticketReducer
  const dispatch = useDispatch()
  useEffect(() =>{
    const {aStation,dStation,date,trainNumber,} = URI.parseQuery(window.location.search)
    dispatch(departDateAction(formatFun(dayjs(date).valueOf())))
    dispatch(departStationAction(dStation))
    dispatch(arriveStationAction(aStation))
    dispatch(trainNumberAction(trainNumber))
    dispatch(ifSearchParsedAction(true))
  },[])
  const handelOnBack = useCallback(() =>{
    window.history.back()
  },[])
  const {
    isPrevDisabled,
    isNextDisabled,
    nextHandel,
    prevHandel
  } = useNavHook(
    departDate,
    () =>{
      dispatch(departDateAction(formatFun(departDate)+86400*1000))
    },
    () =>{
      dispatch(departDateAction(formatFun(departDate) - 86400*1000))
    },
  )
  useEffect(() =>{
    window.document.title = trainNumber
  },[trainNumber])
  useEffect(() =>{
    if(ifSearchParsed){
      getRequestTicket(dispatch,{data:departDate,trainNumber})
    }
  },[ifSearchParsed])
  const handelClick = useCallback(() =>{
    dispatch(isScheduleVisibleAction(!isScheduleVisible))
  },[isScheduleVisible])
  console.log('渲染了')
  if(ifSearchParsed){
    return(
      <div>
        <div className='header-wrapper'>
          <Header handelOnBack={handelOnBack} title={trainNumber}/>
          <div className='nav-wrapper'>
            <Nav
              departTime={departDate}
              isNextDisabled={isNextDisabled}
              isPrevDisabled={isPrevDisabled}
              nextHandel={nextHandel}
              prevHandel={prevHandel}/>
          </div>
        </div>
        <div className='detail-wrapper'>
          <Detail
            arriveDate={arriveDate}
            arriveStation={arriveStation}
            arriveTimeStr={arriveTimeStr}
            departDate={departDate}
            departStation={departStation}
            departTimeStr={departTimeStr}
            durationStr={durationStr}
            isScheduleVisible={isScheduleVisible}
            trainNumber={trainNumber}>
            <span className='left'/>
            <span className='schedule' onClick={handelClick}>时刻表</span>
            <span className='right'/>
          </Detail>
        </div>
        <Candidate/>
        {
          isScheduleVisible
            ?<div className='mask' onClick={() =>{handelClick()}}>
              <Suspense  fallback={<div>loading... ...</div>}>
                <Schedule/>
              </Suspense>
            </div>
            : null
        }
      </div>
    )
  }else{
    return null
  }
}

export default App
