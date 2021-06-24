import {ADDTODO,REMOVETODO,TOGGLETODO,INITSTATE} from './actionTypes'
export const AddTodo = (schedule)=>({type:ADDTODO,data:schedule})//同步添加
export const RemoveTodo = (id)=>({type:REMOVETODO,data:id})//同步删除
export const ToggleTodo = (id)=>({type:TOGGLETODO,data:id})//同步删除
export const InitState = (schedules)=>({type:INITSTATE,data:schedules})//同步删除
