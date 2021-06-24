import React, { useCallback,memo } from 'react'
import { useMappedState, useDispatch } from "redux-react-hook/dist/index";
import PropTypes from 'prop-types'
import './header.css'
const Header = memo((props) =>{
  const {
    title,
    handelOnBack
  } = props
  console.log('Header渲染')
  return(
    <div className='header'>
      <div className='header-back' onClick={() =>{
        console.log('点击了')
        handelOnBack()
      }}>
        <svg width='42' height='42'>
          <polyline
            points="25,13 16,21 25,29"
            stroke="#fff"
            strokeWidth="2"
            fill="none"/>
        </svg>
      </div>
      <h1 className='header-title'>{title}</h1>
    </div>
  )
})


Header.propTypes  = {
  title:PropTypes.string.isRequired,
  handelOnBack:PropTypes.func.isRequired
}

export default Header