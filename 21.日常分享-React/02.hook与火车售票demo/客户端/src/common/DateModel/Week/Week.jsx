import React,{memo} from 'react'
import PropTypes from 'prop-types'

import Day from '../Day/Day'

import '../dateModel.css'

const Week = memo((props) =>{
  const {dayArr} = props
  return (
    <tr className='date-table-days'>
      {
        dayArr.map((day,index) =>{
          return (
            <Day day={day} key={index}/>
          )
        })
      }
    </tr>
  )
})
Week.propTypes = {
  dayArr:PropTypes.array.isRequired
}

export default Week