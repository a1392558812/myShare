import React, { memo, useContext } from 'react'
import PropTypes from 'prop-types'
import { CountContext } from '../contextMarger'
import '../cityModel.css'

const  AlphabeticIndex = memo((props) =>{
  const {alpha} = props
  const {PositioningLetterPosition} = useContext(CountContext)
  return (
    <i className='city-index-item' onClick={() =>{
      PositioningLetterPosition(alpha)
      console.log(alpha)
    }}>{alpha}</i>
  )
})
AlphabeticIndex.propTypes = {
  alpha: PropTypes.string.isRequired
}

export default  AlphabeticIndex