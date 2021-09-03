import React, { Component,useState,useMemo,useCallback,useRef,useEffect,memo} from 'react'
import {useMappedState} from 'redux-react-hook'
import PropTypes from 'prop-types'
const TodoSomeTings = memo((props) =>{
  const {schedules} = useMappedState(state => state).Schedules;
  const {removeTodo,toggleTodo} = props
  return (
    <div>
      {schedules.map((schedule) =>{
        console.log(schedule)
        return (
          <ToRenderIt key={schedule.id} toggleTodo={toggleTodo} removeTodo={removeTodo} schedule={schedule}/>
        )
      })}
    </div>
  )
})
const ToRenderIt = memo((props) =>{
  console.log(props)
  const handelOnChange = () =>{
    props.toggleTodo(props.schedule.id)
  }
  const handelReMoveIt = () =>{
    props.removeTodo(props.schedule.id)
  }
  return(
    <li>
      <input style={{width:'17px',height:"17px"}} type="checkbox" onChange={handelOnChange} checked={props.schedule.complete}/>
      <label style={{marginRight:'10px'}}>{props.schedule.text}</label>
      <button onClick={handelReMoveIt}>删除该项</button>
    </li>
  )
})
TodoSomeTings.propTypes = {
  removeTodo:PropTypes.func.isRequired,
  toggleTodo:PropTypes.func.isRequired,
}
export default TodoSomeTings
