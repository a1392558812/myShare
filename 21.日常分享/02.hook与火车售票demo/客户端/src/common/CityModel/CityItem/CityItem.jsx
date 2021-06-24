import React, { useContext,memo } from 'react'
import PropTypes from 'prop-types'
import '../cityModel.css'
import { CountContext } from '../contextMarger'

const CityItem = memo((props) =>{
  const {name} = props
  const {onSelect} = useContext(CountContext)
  return (
    <div>
      <li className='city-li' onClick={() =>{
        onSelect(name)
      }}>{name}</li>
    </div>
  )
})

CityItem.propTypes = {
  name:PropTypes.string.isRequired,
}
export default CityItem