import {initTicketState} from './initData'
import {
  SET_DEPARTDATEACTION,
  SET_ARRIVEDATEACTION,
  SET_DEPARTTIMESTRACTION,
  SET_ARRIVETIMESTRACTION,
  SET_DEPARTSTATIONACTION,
  SET_ARRIVESTATIONACTION,
  SET_TRAINNUMBERACTION,
  SET_DURATIONSTRACTION,
  SET_TICKETSACTION,
  SET_ISSCHEDULEVISIBLEACTION,
  SET_IFSEARCHPARSEDACTION,
} from './actionTypes'

export default (state = initTicketState,action) =>{
  switch (action.type) {
    case SET_DEPARTDATEACTION:
      return {
        ...state,
        departDate:action.data,
      }
    case SET_ARRIVEDATEACTION:
      return {
        ...state,
        arriveDate:action.data,
      }
    case SET_DEPARTTIMESTRACTION:
      return {
        ...state,
        departTimeStr:action.data,
      }
    case SET_ARRIVETIMESTRACTION:
      return {
        ...state,
        arriveTimeStr:action.data,
      }
    case SET_DEPARTSTATIONACTION:
      return {
        ...state,
        departStation:action.data,
      }
    case SET_ARRIVESTATIONACTION:
      return {
        ...state,
        arriveStation:action.data,
      }
    case SET_TRAINNUMBERACTION:
      return {
        ...state,
        trainNumber:action.data,
      }
    case SET_DURATIONSTRACTION:
      return {
        ...state,
        durationStr:action.data,
      }
    case SET_TICKETSACTION:
      return {
        ...state,
        tickets:action.data,
      }
    case SET_ISSCHEDULEVISIBLEACTION:
      return {
        ...state,
        isScheduleVisible:action.data,
      }
    case SET_IFSEARCHPARSEDACTION:
      return {
        ...state,
        ifSearchParsed:action.data,
      }
    default:
      return state
  }

}