import React, { Component,useState,useMemo,useCallback,useRef,useEffect,memo} from 'react'
import TodoSomeTings from './components/Todos'
import Control from './components/Control'
const App = memo(() =>{
  const [schedules,setTodo] = useState([])
  const addTodo =  useCallback((schedule) => {
    setTodo(schedules =>[...schedules,schedule])
  },[])
  const removeTodo = useCallback((id) => setTodo(schedules =>[...schedules.filter((schedule) =>schedule.id !== id)]),[])
  const toggleTodo = useCallback((id) => setTodo(schedules =>schedules.map((schedule) =>{
    if(schedule.id ===id){
      return {...schedule,complete:!schedule.complete}
    }  else{
      return schedule
    }
  })),[])
  /* 当我们的schedules数组发生变化时，我们就需要将新schedules保存到本地 */
  useEffect(() =>{
    console.log(JSON.parse(localStorage.getItem('schedules')))
    setTodo(JSON.parse(localStorage.getItem('schedules')))
  },[])
  useEffect(() =>{
    localStorage.setItem('schedules',JSON.stringify(schedules))
  },[schedules])
  return(
    <div style={{width:'550px',margin:'300px auto',backgroundColor:'skyblue'}}>
      <Control addTodo={addTodo}/>
      <TodoSomeTings schedules={schedules} removeTodo={removeTodo} toggleTodo={toggleTodo}/>
    </div>
  )
})

export default App
