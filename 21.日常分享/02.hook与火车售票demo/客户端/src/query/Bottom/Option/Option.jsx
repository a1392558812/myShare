import React, {memo,useCallback} from 'react'
import PropTypes from 'prop-types'

import '../bottom.css'
import Filter from '../Filter/Filter'

const Option = memo((props) =>{
  const {
    title,
    options,
    checkedMap,
    dispatchHook
  } = props


  return (
    <div className='option'>
      <h3>{title}</h3>
      <ul>
        {
          options.map((option) =>{
            console.log(option)
            return (
              <Filter key={option.value} value={option.value} checked={option.value in checkedMap} name={option.name} dispatchHook={dispatchHook}/>
            )
          })
        }
      </ul>
    </div>
  )
})
Option.propTypes = {
  title:PropTypes.string.isRequired,
  options:PropTypes.array.isRequired,
  checkedMap:PropTypes.object.isRequired,
  dispatchHook:PropTypes.func.isRequired,
}

export default Option