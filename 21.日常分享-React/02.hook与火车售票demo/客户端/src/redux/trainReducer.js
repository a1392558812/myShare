import {initState} from './initData'
import {
  SET_FROM_ACTIONTYPE,
  SET_TO_ACTIONTYPE,
  SET_IFOPENCITYMODAL_ACTIONTYPE,
  SET_NOWSELECTEDCITYLEFT_ACTIONTYPE,
  SET_CITYDATA_ACTIONTYPE,
  SET_IFLOADINGCITYDATA_ACTIONTYPE,
  SET_IFOPENDATEMODAL_ACTIONTYPE,
  SET_IFSELECTEDHIGHSPEED_ACTIONTYPE,
  SET_EXCHANGEFROMTO_ACTIONTYPE,
  SET_TIME_ACTIONTYPE,
} from './actionTypes'
export default  (state=initState,action) => {
  switch (action.type) {
    case SET_EXCHANGEFROMTO_ACTIONTYPE:
      return {
        ...state,
        from:state.to,
        to:state.from,
      }
    case SET_FROM_ACTIONTYPE:
      return {
        ...state,
        from:action.data
      }
    case SET_TO_ACTIONTYPE:
      return {
        ...state,
        to:action.data
      }
    case SET_IFOPENCITYMODAL_ACTIONTYPE:
      return {
        ...state,
        ifOpenCityModal:action.data}
    case SET_NOWSELECTEDCITYLEFT_ACTIONTYPE:
      return {
        ...state,
        nowSelectedCityLeft:action.data
      }
    case SET_CITYDATA_ACTIONTYPE:
      return {
        ...state,
        cityData:action.data
      }
    case SET_IFLOADINGCITYDATA_ACTIONTYPE:
      return {
        ...state,
        ifLoadingCityData:action.data
      }
    case SET_TIME_ACTIONTYPE:
      return {
        ...state,
        departTime:action.data
      }
    case SET_IFOPENDATEMODAL_ACTIONTYPE:
      return {
        ...state,
        ifOpenDateModal:action.data
      }
    case SET_IFSELECTEDHIGHSPEED_ACTIONTYPE:
      return {
        ...state,
        ifSelectedHighSpeed:!state.ifSelectedHighSpeed
      }
    default:
      return state
  }
}