import React, {useState,useMemo,useCallback,useRef,useEffect,memo,useReducer} from 'react'
import { useMappedState, useDispatch } from "redux-react-hook";
import './startAndEnd.css'
import switchImg from '../images/switch.svg'
import {
  exchangeFromTo,
  setIfOpenCityModal
} from '../../redux/actions'

const StartAndEnd =memo((props) =>{
  const {from,to} = useMappedState(state => state).trainReducer
  const dispatch = useDispatch()
  const renderFun = useCallback(() =>{
    return (
      <div className='journey'>
        <div className='journey-station' onClick={()=>dispatch(setIfOpenCityModal(true))}>
          <input type="text" readOnly name='from' value={from} className='journey-input journey-from'/>
        </div>
        <div className='journey-switch' onClick={()=> dispatch(exchangeFromTo())}>
          <img src={switchImg} alt="img" width='70' height='40'/>
        </div>
        <div className='journey-station' onClick={()=>dispatch(setIfOpenCityModal(true))}>
          <input type="text" readOnly name='to' value={to} className='journey-input journey-to'/>
        </div>
      </div>
    )
  },[from,to])
  return(
    <div>
      {
        renderFun()
      }
    </div>
  )
})


export default StartAndEnd
