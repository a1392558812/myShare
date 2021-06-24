import React, {memo} from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import './menu.css'
import MenuItem from './MenuItem'

const Menu = memo((props) =>{
  const {
    show,
    options,
    onPress,
    hideMenu
  } = props
  return (
    <div>
      {
        show
        ? <div className='menu-mask' onClick={hideMenu}/>
        : null
      }
      <div className={classnames('menu',{show})}>
        <div className='menu-title'/>
        <ul>
          {
            options
            ? options.map((option,index) =>{
                return (
                  <MenuItem key={option.value} {...option} onPress={onPress}/>
                )
              })
            : null
          }
        </ul>
      </div>
    </div>
  )
})
Menu.propTypes = {
  show:PropTypes.bool.isRequired,
  options:PropTypes.array,
  onPress:PropTypes.func,
  hideMenu:PropTypes.func.isRequired,
}

export default Menu

