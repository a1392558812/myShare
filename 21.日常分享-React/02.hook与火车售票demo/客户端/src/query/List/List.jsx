import React, {memo} from 'react'
import PropTypes from 'prop-types'
import {useMappedState} from 'redux-react-hook'
import './list.css'
import ListItem from './ListItem/ListItem'

const List = memo((props) =>{
  const {trainList,departTime} =useMappedState(state => state).queryReducer
  return (
    <ul className='list'>
      {
        trainList.map((train) =>{
          return (
            <ListItem departTime={departTime} {...train} key={train.trainNumber}/>
          )
        })
      }
    </ul>
  )
})

export default List