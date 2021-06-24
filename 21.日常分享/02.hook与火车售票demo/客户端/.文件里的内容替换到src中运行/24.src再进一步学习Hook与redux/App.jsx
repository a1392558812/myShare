import React, {useState,useMemo,useCallback,useRef,useEffect,memo,useReducer} from 'react'
import { useMappedState, useDispatch } from "redux-react-hook";
import {
  AddTodo,
  RemoveTodo,
  ToggleTodo,
  InitState,
} from './redux/actions'
import {asyncAddTodo} from './redux/asyncActions'
import TodoSomeTings from './components/Todos'
import Control from './components/Control'
const App = memo(() =>{
  const dispatch = useDispatch();
  let {schedules,count} = useMappedState(state => state).Schedules;
  const addTodo =  useCallback((schedule) =>{
    asyncAddTodo(schedule,dispatch)
  },[])
  const removeTodo = useCallback((id) =>{
    dispatch(RemoveTodo(id))
  } ,[])
  const toggleTodo = useCallback((id) => {
    dispatch(ToggleTodo(id))
  },[])
  useEffect(() =>{
    dispatch(InitState())
},[])
  /* 当我们的schedules数组发生变化时，我们就需要将新schedules保存到本地 */
  useEffect(() =>{
    console.log('..........',schedules)
    localStorage.setItem('schedules',JSON.stringify(schedules))
  },[schedules])
  console.log('渲染了')
  return(
    <div style={{width:'550px',margin:'300px auto',backgroundColor:'skyblue'}}>
      <p>此处是个count：{count}</p>
      <Control addTodo={addTodo}/>
      <TodoSomeTings  removeTodo={removeTodo} toggleTodo={toggleTodo}/>
    </div>
  )
})

export default App
