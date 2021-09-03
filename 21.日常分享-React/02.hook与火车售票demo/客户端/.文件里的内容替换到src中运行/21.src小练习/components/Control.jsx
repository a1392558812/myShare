import React, { Component,useState,useMemo,useCallback,useRef,useEffect,memo} from 'react'
import PropTypes from 'prop-types'
let id = 0
const Control = memo((props) =>{
  const inputValueRef = useRef()
  const handelOnSubmit = (e) =>{
    e.preventDefault()
    const text = inputValueRef.current.value.trim()
    if(text){
      props.addTodo({
        id:id++,
        complete:false,
        text,
      })
      inputValueRef.current.value = ''
    }
  }
  return(
    <div>
      <h1>Todo</h1>
      <form onSubmit={handelOnSubmit}>
        <input type="text" ref={inputValueRef}/>
      </form>
    </div>
  )
})
Control.propTypes  = {
  addTodo:PropTypes.func.isRequired
}

export default Control
