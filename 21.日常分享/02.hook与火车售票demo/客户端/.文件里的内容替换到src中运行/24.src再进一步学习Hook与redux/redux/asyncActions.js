import { AddTodo } from './actions'
import store from './store'
export const asyncAddTodo = (addSchedule,dispatch) =>{
  setTimeout(() => {
    if(!store.getState().Schedules.schedules.find((schedule) =>schedule.text === addSchedule.text)){
      console.log('可以添加，正在异步添加',)
      dispatch(AddTodo(addSchedule))
    }else{
      console.log('不可以添加',store.getState().Schedules.schedules)
    }
  }, 3000)
}