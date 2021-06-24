import React, {memo} from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'

import '../bottom.css'

const Filter = memo((props) =>{
  const {
    name,
    checked,
    dispatchHook,
    value
  } = props

  return (
    <li className={classnames({checked})} onClick={() =>{
      console.log(value)
      dispatchHook({data:value,type:'toggle'})
    }}>
      {name}
    </li>
  )
})
Filter.propTypes = {
  name:PropTypes.string.isRequired,
  checked:PropTypes.bool.isRequired,
  dispatchHook:PropTypes.func.isRequired,
  value:PropTypes.string.isRequired,
}

export default Filter
