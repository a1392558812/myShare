import {
  SET_TRAINNUMBERACTIONCREATE,
  SET_DEPARTSTATIONACTIONCREATE,
  SET_ARRIVESTATIONACTIONCREATE,
  SET_SEATTYPEACTIONCREATE,
  SET_DEPARTDATEACTIONCREATE,
  SET_ARRIVEDATEACTIONCREATE,
  SET_DEPARTTIMESTRACTIONCREATE,
  SET_ARRIVETIMESTRACTIONCREATE,
  SET_DURATIONSTRACTIONCREATE,
  SET_PRICEACTIONCREATE,
  SET_PASSENGERSACTIONCREATE,
  SET_MENUACTIONCREATE,
  SET_ISMENUVISIBLEACTIONCREATE,
  SET_SEARCHPARSEDACTIONCREATE,
} from './actionTypes'
import { initOrderDate } from './initData'

export default (state=initOrderDate,action) =>{
  switch (action.type) {
    case SET_TRAINNUMBERACTIONCREATE:
      return {
      ...state,
        trainNumber:action.data
      }
    case SET_DEPARTSTATIONACTIONCREATE:
      return {
        ...state,
        departStation:action.data
      }
    case SET_ARRIVESTATIONACTIONCREATE:
      return {
        ...state,
        arriveStation:action.data
      }
    case SET_SEATTYPEACTIONCREATE:
      return {
        ...state,
        seatType:action.data
      }
    case SET_DEPARTDATEACTIONCREATE:
      return {
        ...state,
        departDate:action.data
      }
    case SET_ARRIVEDATEACTIONCREATE:
      return {
        ...state,
        arriveDate:action.data
      }
    case SET_DEPARTTIMESTRACTIONCREATE:
      return {
        ...state,
        departTimeStr:action.data
      }
    case SET_ARRIVETIMESTRACTIONCREATE:
      return {
        ...state,
        arriveTimeStr:action.data
      }
    case SET_DURATIONSTRACTIONCREATE:
      return {
        ...state,
        durationStr:action.data
      }
    case SET_PRICEACTIONCREATE:
      return {
        ...state,
        price:action.data
      }
    case SET_PASSENGERSACTIONCREATE:
      return {
        ...state,
        passengers:action.data
      }
    case SET_MENUACTIONCREATE:
      return {
        ...state,
        menu:action.data
      }
    case SET_ISMENUVISIBLEACTIONCREATE:
      return {
        ...state,
        isMenuVisible:action.data
      }
    case SET_SEARCHPARSEDACTIONCREATE:
      return {
        ...state,
        searchParsed:action.data
      }
    default:
      return state
  }
}