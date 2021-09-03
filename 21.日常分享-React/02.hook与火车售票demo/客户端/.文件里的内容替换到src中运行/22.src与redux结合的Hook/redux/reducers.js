import {combineReducers} from 'redux'//可以整合暴露多个函数
import {ADDTODO,REMOVETODO,TOGGLETODO,INITSTATE,SETSTATE} from './actionTypes'
const initialState = []
function Schedules(state=initialState,action) {
  switch (action.type) {
    case INITSTATE:
     try {
       return JSON.parse(localStorage.getItem('schedules'))
     }catch (e) {
       return []
     }
    case ADDTODO:
      return [...state,action.data]
    case REMOVETODO:
      return [...state.filter((schedule) =>schedule.id !== action.data)]
    case TOGGLETODO:
      return state.map((schedule) =>{
        if(schedule.id ===action.data){
          return {...schedule,complete:!schedule.complete}
        }  else{
          return schedule
        }
      })
    case SETSTATE:
      return action.data
    default:
      return state
  }
}
export default combineReducers({
  Schedules,
})
//redux向外暴露的是一个对象(里面包含俩个方法)