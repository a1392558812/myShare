import {combineReducers} from 'redux'//可以整合暴露多个函数
import {ADDTODO,REMOVETODO,TOGGLETODO,INITSTATE,SETSTATE} from './actionTypes'
const initialState = {
  schedules:[],
  count:0
}
function Schedules(state=initialState,action) {
  switch (action.type) {
    case INITSTATE:
     try {
       return {
         schedules:JSON.parse(localStorage.getItem('schedules')),
         count:state.count
       }
     }catch (e) {
       return  {
         schedules:[],
         count:0
       }
     }
    case ADDTODO:
      return {
        schedules:[...state.schedules,action.data],
        count:state.count+1
      }
    case REMOVETODO:
      return {
        schedules:[...state.schedules.filter((schedule) =>schedule.id !== action.data)],
        count:state.count
      }
    case TOGGLETODO:
      return {
        schedules:state.schedules.map((schedule) =>{
          if(schedule.id ===action.data){
            return {...schedule,complete:!schedule.complete}
          }  else{
            return schedule
          }
        }),
        count:state.count
      }
    case SETSTATE:
      return {
        schedules:action.data,
        count:state.count+1
      }
    default:
      return state
  }
}
export default combineReducers({
  Schedules,
})
//redux向外暴露的是一个对象(里面包含俩个方法)