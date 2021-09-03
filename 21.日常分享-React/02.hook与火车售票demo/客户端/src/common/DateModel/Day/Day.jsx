import React, { memo, useContext } from 'react'
import PropTypes from 'prop-types'
import '../dateModel.css'
import classnames from 'classnames'
import { formatFun } from '../../../index/DepartureDate/handelData'
import {CountContext} from '../contextMarger'

const Day = memo((props) =>{
  const {day} = props
  const onSelect = useContext(CountContext)
  if(!day){return (<td className='null'/>)}
  const classes = []
  const nowDay = formatFun()
  if(day<nowDay){classes.push('disabled')}
  if([6,0].includes(new Date(day).getDay())){classes.push('weekend')}
  const dateStr = nowDay ===day ? '🍋今天' : new Date(day).getDate()
  return (
    <td className={classnames(classes)} onClick={() =>{onSelect(day)}}>
      {dateStr}
    </td>
  )
})
Day.propTypes = {
  day:PropTypes.number
}


export default Day