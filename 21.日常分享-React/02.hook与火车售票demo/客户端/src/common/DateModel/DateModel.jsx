import React, { memo, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { useMappedState, useDispatch } from "redux-react-hook";

import {CountContext} from './contextMarger'

import Header from '../Header/Header'
import Month from './Month/Month'

import './dateModel.css'
import { setIfOpenDateModal } from '../../redux/actions'

const DateModel = memo((props) =>{
  const {onSelectDate} = props
  const {ifOpenDateModal} = useMappedState(state => state).trainReducer
  const dispatch = useDispatch()
  const handelOnBack = useCallback(() =>{
    dispatch(setIfOpenDateModal(false))
  },[])
  const nowDate =useMemo(() =>{
    console.log('执行了计算nowDate')
    const nowDate = new Date()
    nowDate.setHours(0)
    nowDate.setMinutes(0)
    nowDate.setSeconds(0)
    nowDate.setMilliseconds(0)
    nowDate.setHours(0)
    nowDate.setDate(1)
    const MonthArr = [nowDate.getTime()]
    nowDate.setMonth(nowDate.getMonth()+1)
    MonthArr.push(nowDate.getTime())
    nowDate.setMonth(nowDate.getMonth()+1)
    MonthArr.push(nowDate.getTime())
    return MonthArr
  },[])
  return (
    <div className={classnames('date-selector',{hidden:!ifOpenDateModal})}>
      < CountContext.Provider value={onSelectDate}>
        <Header title={'日期选择'} handelOnBack={handelOnBack}/>
        <div className='date-selector-tables'>
          {
            nowDate.map((month) =>{
              return (<Month key={month} startMonth={month}/>)
            })
          }
        </div>
      </CountContext.Provider>
    </div>
  )
})
DateModel.propTypes = {
  onSelectDate:PropTypes.func.isRequired
}

export default DateModel