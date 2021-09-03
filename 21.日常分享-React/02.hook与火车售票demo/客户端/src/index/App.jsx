import React, {useState,useMemo,useCallback,useRef,useEffect,memo,useReducer} from 'react'
import { useMappedState, useDispatch } from "redux-react-hook";

import Header from '../common/Header/Header'
import StartAndEnd from './StartAndEnd/StartAndEnd'
import HighSpeed from './HighSpeed/HighSpeed'
import DepartureDate from './DepartureDate/DepartureDate'
import Submit from './Submit/Submit'
import CityModel from '../common/CityModel/CityModel'
import DateModel from '../common/DateModel/DateModel'


import {
  setIfOpenCityModal,
  setTime,
  setIfOpenDateModal,
  setIfSelectedHighSpeed,
} from '../redux/actions'

import './App.css'
import { formatFun } from './DepartureDate/handelData'


const App = memo((props) =>{
  const dispatch = useDispatch()
  const handelOnBack = useCallback(() =>{
    dispatch(setIfOpenCityModal(false))
  },[])
  const OnBack = useCallback(() =>{
    window.history.back()
  },[])
  const onSelectDate = useCallback((day) =>{
    if(!day){
      return
    }
    if(day < formatFun()){
      return
    }
    dispatch(setTime(day))
    dispatch(setIfOpenDateModal(false))
  },[])
  const toggleHighSpeed = useCallback(() =>{
    dispatch(setIfSelectedHighSpeed())
  },[])
  console.log('App渲染了')
  return(
    <div>
      <div className='header-wrapper'>
        <Header title={'火车票'} handelOnBack={OnBack}/>
      </div>
      <form action='./query.html' className='form'>
        <StartAndEnd/>
        <DepartureDate/>
        <HighSpeed toggleHighSpeed={toggleHighSpeed}/>
        <Submit/>
      </form>
      <CityModel  handelOnBack={handelOnBack}/>
      <DateModel onSelectDate={onSelectDate}/>
    </div>
  )
})


export default App
