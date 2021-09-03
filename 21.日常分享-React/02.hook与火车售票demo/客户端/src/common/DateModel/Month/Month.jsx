import React,{memo,useMemo} from 'react'
import PropTypes from 'prop-types'

import Week from '../Week/Week'

import '../dateModel.css'

const Month = memo((props) =>{
  const {startMonth} = props
  const startDay = new Date(startMonth)
  const currentDay = new Date(startMonth)
  let datArr = []
  for(let i=0;startDay.getMonth() === currentDay.getMonth();i++){
    datArr.push(currentDay.getTime())
    currentDay.setDate(currentDay.getDate() +1)
  }
  datArr = new Array(startDay.getDay() ? startDay.getDay()-1 : 6).fill(null).concat(datArr)
  let lastDay = new Date(datArr[datArr.length-1])
  datArr = datArr.concat(new Array(lastDay.getDay() ? 7-lastDay.getDay():0).fill(null));
  let weekArr = []
  for(let row = 0;row<datArr.length/7;++row){
    const week = datArr.slice(row*7,(row+1)*7)
    weekArr.push(week)
  }
  return(
    <table className='date-table'>
      <thead>
      <tr>
        <td colSpan='7'>
          <h5>{startDay.getFullYear()}年{startDay.getMonth()+1}月</h5>
        </td>
      </tr>
      </thead>
      <tbody>
        <tr className='date-table-weeks'>
          <th>周一</th>
          <th>周二</th>
          <th>周三</th>
          <th>周四</th>
          <th>周五</th>
          <th className='weekend'>周六</th>
          <th className='weekend'>周日</th>
        </tr>
        {
          weekArr.map((week,index) =>{
            return (
              <Week dayArr={week} key={index}/>
            )
          })
        }
      </tbody>
    </table>
  )
})
Month.propTypes = {
  startMonth:PropTypes.number.isRequired
}

export default Month