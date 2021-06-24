import React, {memo} from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import './menu.css'


const MenuItem = memo((props) =>{
  const {
    onPress,
    title,
    value,
    active
  } =props
  return (
    <li className={classnames({active})} onClick={() =>onPress(value)}>
      {title}
    </li>
  )
})
MenuItem.propTypes = {
  onPress:PropTypes.func.isRequired,
  title:PropTypes.string.isRequired,
  value:PropTypes.oneOfType([PropTypes.string,PropTypes.number]).isRequired,
  active:PropTypes.bool.isRequired,
}


export default MenuItem