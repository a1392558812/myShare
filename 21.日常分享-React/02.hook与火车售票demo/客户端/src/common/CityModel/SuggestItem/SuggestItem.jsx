import React, { memo, useContext } from 'react'
import PropTypes from 'prop-types'
import '../cityModel.css'
import { CountContext } from '../contextMarger'

const SuggestItem = memo((props) =>{
  const {onSelect} = useContext(CountContext)
  const {name} = props
  console.log(name)
  return (
    <li className='city-suggest-li' onClick={() =>{
      onSelect(name)
    }}>
      {name}
    </li>
  )
})
SuggestItem.propTypes = {
  name:PropTypes.string.isRequired
}

export default SuggestItem