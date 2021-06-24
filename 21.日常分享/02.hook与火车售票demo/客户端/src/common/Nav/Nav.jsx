import React, {useMemo,memo} from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

import './nav.css'

const Nav = memo((props) =>{
  const {
    departTime,
    prevHandel,
    nextHandel,
    isPrevDisabled,
    isNextDisabled
  } = props
  const dataStr = useMemo(() =>{
    const d = dayjs(departTime);
    return d.format('M月D日 ') + d.locale('zh-cn').format('ddd');
  },[departTime])
  return (
    <div className='nav'>
      <span onClick={() =>{prevHandel()}} className={classnames('nav-prev',{'nav-disabled':isPrevDisabled})}>前一天</span>
      <span className='nav-current'>
        {dataStr}
      </span>
      <span onClick={() =>{nextHandel()}} className={classnames('nav-next',{'nav-disabled':isNextDisabled})}>后一天</span>
    </div>
  )
})

Nav.propTypes = {
  departTime:PropTypes.number.isRequired,
  prevHandel:PropTypes.func.isRequired,
  nextHandel:PropTypes.func .isRequired,
  isPrevDisabled:PropTypes.bool.isRequired,
  isNextDisabled:PropTypes.bool.isRequired,
}

export default Nav