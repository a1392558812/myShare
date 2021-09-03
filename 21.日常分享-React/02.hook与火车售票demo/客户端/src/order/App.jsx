import React, {useEffect,useCallback} from 'react'
import URI from 'urijs'
import dayjs from 'dayjs'
import { useMappedState, useDispatch } from "redux-react-hook";

import Header from '../common/Header/Header'
import Menu from './Menu/Menu'
import Account from './Account/Account'
import Choose from './Choose/Choose'
import Passengers from './Passengers/Passengers'
import Ticket from './Ticket/Ticket'
import {
  trainNumberActionCreate,
  departStationActionCreate,
  arriveStationActionCreate,
  seatTypeActionCreate,
  departDateActionCreate,
  searchParsedActionCreate,
  isMenuVisibleActionCreate,
} from '../redux/actions'
import Detail from '../common/Detail/Detail'

import './App.css'
import { getRequestOrder } from '../redux/asyncActions'

const App = (props) =>{
  const {
    passengers,
    arriveDate,
    searchParsed,
    trainNumber,
    departStation,
    arriveStation,
    departTimeStr,
    arriveTimeStr,
    durationStr,
    seatType,
    departDate,
    isMenuVisible,
    menu
  } = useMappedState(state => state).orderReducer
  const dispatch = useDispatch()
  const handelOnBack = useCallback(() =>{
    window.history.back()
  },[])
  useEffect(()=>{
    console.log(URI.parseQuery(window.location.search))
    const {aStation,dStation,date,trainNumber,type,} = URI.parseQuery(window.location.search)
    dispatch(trainNumberActionCreate(trainNumber))
    dispatch(departStationActionCreate(dStation))
    dispatch(arriveStationActionCreate(aStation))
    dispatch(seatTypeActionCreate(type))
    dispatch(departDateActionCreate(dayjs(date).valueOf()))
    dispatch(searchParsedActionCreate(true))
  },[])

  useEffect(() =>{
    if(searchParsed){
      getRequestOrder(dispatch)
    }
  },[searchParsed])
  const hideMenu = useCallback(() =>{
    dispatch(isMenuVisibleActionCreate(false))
  },[])
  if(searchParsed){
    return(
      <div>
        <div className='header-wrapper'>
          <Header handelOnBack={handelOnBack} title={'👴填写订单'}/>
        </div>
        <div className='detail-wrapper'>
          <Detail
            departDate={departDate}
            arriveDate={arriveDate}
            departTimeStr={departTimeStr}
            arriveTimeStr={arriveTimeStr}
            departStation={departStation}
            arriveStation={arriveStation}
            trainNumber={trainNumber}
            durationStr={durationStr}
            handelClick={() =>{}}>
              <span style={{display: 'block'}} className='train-icon'/>
          </Detail>
        </div>
        <Ticket/>
        <Passengers/>
        {
          passengers.length>0
          ? <Choose/>
          : null
        }
        <Account/>
        <Menu hideMenu={hideMenu} {...menu} show={isMenuVisible}/>
      </div>
    )
  }else{
    return (
      <div>
        Loading... ...
      </div>
    )
  }

}

export default App
