import React, {memo} from 'react'
import { useMappedState, useDispatch } from "redux-react-hook";
import PropTypes from 'prop-types'
import classnams from 'classnames'
import './highSpeed.css'

const HighSpeed = memo((props) =>{
  const {toggleHighSpeed} = props
  const {ifSelectedHighSpeed} = useMappedState(state => state).trainReducer
  return(
    <div className='high-speed'>
      <div className='high-speed-label'>只看高铁🚄/动车🚅</div>
      <div className='high-speed-switch' onClick={() =>{toggleHighSpeed()}}>
        <input type="hidden" name='highSpeed' value={ifSelectedHighSpeed}/>
        <div className={classnams('high-speed-track',{checked:ifSelectedHighSpeed})}>
          <span className={classnams('high-speed-handle', {checked: ifSelectedHighSpeed})}/>
        </div>
      </div>
    </div>
  )
})
HighSpeed.propTypes = {
  toggleHighSpeed:PropTypes.func.isRequired
}

export default HighSpeed
