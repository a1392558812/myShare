import React, {useCallback,useEffect,useMemo} from 'react'
import { useMappedState, useDispatch } from "redux-react-hook";
import URI from 'urijs'
import dayjs from 'dayjs'

import useNav from '../common/Nav/useNavHook'
import Nav from '../common/Nav/Nav'
import Header from '../common/Header/Header'
import List from './List/List'
import Bottom from './Bottom/Bottom'


import './App.css'
import {
  departTimeAction,
  fromAction,
  ifHighSpeedAction,
  toAction,
  searchParsedAction
} from '../redux/actions'
import { formatFun } from '../index/DepartureDate/handelData'
import {
  getRequestQuery
} from '../redux/asyncActions'

const App = (props) =>{
  const {
    from,
    to,
    departTime,
    ifHighSpeed,
    searchParsed,
    orderType,
    onlyWatchHadTickets,
    checkedTicketsTypes,
    checkedTrainTypes,
    checkedStartStations,
    checkedEndStations,
    earliestStartTime,
    latestStartTime,
    earliestEndTime,
    latestEndTime,
  } = useMappedState(state => state).queryReducer
  const dispatch = useDispatch()
  const handelOnBack = useCallback(() =>{
    window.history.back()
  },[])
  useEffect(() =>{
    const {from,to,data,highSpeed,} = URI.parseQuery(window.location.search)
    dispatch(fromAction(from))
    dispatch(toAction(to,))
    dispatch(departTimeAction(formatFun(dayjs(data).valueOf())))
    dispatch(ifHighSpeedAction(highSpeed==='true'))
    dispatch(searchParsedAction(true))
  },[])
  useEffect(() =>{
    if(!searchParsed){
      console.log('searchParsed',searchParsed)
      return
    }else{
      console.log('searchParsed',searchParsed)
      getRequestQuery(dispatch,{
        departTime:dayjs(departTime).format('YYYY-MM-DD'),
        ifHighSpeed,
        from,
        to,
        searchParsed,
        orderType,
        onlyWatchHadTickets,
        checkedTicketsTypes:Object.keys(checkedTicketsTypes),
        checkedTrainTypes:Object.keys(checkedTrainTypes),
        checkedStartStations:Object.keys(checkedStartStations),
        checkedEndStations:Object.keys(checkedEndStations),
        earliestStartTime,
        latestStartTime,
        earliestEndTime,
        latestEndTime,
      })
    }
  },[
    departTime,
    ifHighSpeed,
    from,
    to,
    searchParsed,
    orderType,
    onlyWatchHadTickets,
    checkedTicketsTypes,
    checkedTrainTypes,
    checkedStartStations,
    checkedEndStations,
    earliestStartTime,
    latestStartTime,
    earliestEndTime,
    latestEndTime,
  ])
  const {
    isPrevDisabled,
    isNextDisabled,
    nextHandel,
    prevHandel} = useNav(
      departTime,
      function () {
        dispatch(departTimeAction(formatFun(departTime)+86400*1000))
      },
      function () {
        dispatch(departTimeAction(formatFun(departTime)-86400*1000))
      }
  )
  if(!searchParsed){
    return null
  }
  return(
    <div>
      <div className='header-wrapper'>
        <Header handelOnBack={handelOnBack} title={`${from}--${to}`}/>
      </div>
      <Nav
        departTime={departTime}
        isNextDisabled={isNextDisabled}
        isPrevDisabled={isPrevDisabled}
        nextHandel={nextHandel}
        prevHandel={prevHandel}/>
      <List/>
      <Bottom/>
    </div>
  )
}

export default App
