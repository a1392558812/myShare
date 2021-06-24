import {initQueryState} from './initData'
import {
  SET_SEARCHPARSEDACTION,
  SET_FROMACTION,
  SET_TOACTION,
  SET_DEPARTTIMEACTION,
  SET_IFHIGHSPEEDACTION,
  SET_TRAINLISTACTION,
  SET_ORDERTYPEACTION,
  SET_ONLYWATCHHADTICKETSACTION,
  SET_TICKETSTYPESARRACTION,
  SET_CHECKEDTICKETSTYPESACTION,
  SET_TRAINTYPESARRACTION,
  SET_CHECKEDTRAINTYPESACTION,
  SET_STARTSTATIONSACTION,
  SET_CHECKEDSTARTSTATIONSACTION,
  SET_ENDSTATIONSACTION,
  SET_CHECKEDENDSTATIONSACTION,
  SET_EARLIESTSTARTTIMEACTION,
  SET_LATESTSTART,
  SET_EARLIESTENDTIMEACTION,
  SET_LATESTENDTIMEACTION,
  SET_IFOPENCOMPSCRMODELACTION
} from './actionTypes'

export default (state=initQueryState,action) => {
  switch (action.type) {
    case  SET_SEARCHPARSEDACTION:
      return {
        ...state,
        searchParsed:action.data
      }
    case  SET_FROMACTION:
      return {
        ...state,
        from:action.data
      }
    case  SET_TOACTION:
      return {
        ...state,
        to:action.data
      }
    case  SET_DEPARTTIMEACTION:
      console.log(action.data)
      return {
        ...state,
        departTime:action.data
      }
    case  SET_IFHIGHSPEEDACTION:
      if(action.data){
        return {
          ...state,
          checkedTrainTypes:{
            [1]:true,
            [5]:true
          },
          ifHighSpeed:action.data
        }
      }else{
         let newStateIfHighSpeed = {
          ...state,
          ifHighSpeed:action.data,
        }
        delete newStateIfHighSpeed.checkedTrainTypes[1]
        delete newStateIfHighSpeed.checkedTrainTypes[5]
        return newStateIfHighSpeed
      }
    case  SET_TRAINLISTACTION:
      return {
        ...state,
        trainList:action.data
      }
    case  SET_ORDERTYPEACTION:
      return {
        ...state,
        orderType:action.data
      }
    case  SET_ONLYWATCHHADTICKETSACTION:
      return {
        ...state,
        onlyWatchHadTickets:action.data
      }
    case  SET_TICKETSTYPESARRACTION:
      return {
        ...state,
        ticketsTypesArr:action.data
      }
    case  SET_CHECKEDTICKETSTYPESACTION:
      return {
        ...state,
        checkedTicketsTypes:action.data
      }
    case  SET_TRAINTYPESARRACTION:
      return {
        ...state,
        trainTypesArr:action.data
      }
    case  SET_CHECKEDTRAINTYPESACTION:
      console.log(action.data)
      let newStateCheckedTrainTypes = {
        ...state,
        checkedTrainTypes:action.data
      }
      newStateCheckedTrainTypes.ifHighSpeed = !!(newStateCheckedTrainTypes.checkedTrainTypes[1] && newStateCheckedTrainTypes.checkedTrainTypes[5]);
      return newStateCheckedTrainTypes
    case  SET_STARTSTATIONSACTION:
      return {
        ...state,
        startStations:action.data
      }
    case  SET_CHECKEDSTARTSTATIONSACTION:
      return {
        ...state,
        checkedStartStations:action.data
      }
    case  SET_ENDSTATIONSACTION:
      return {
        ...state,
        endStations:action.data
      }
    case  SET_CHECKEDENDSTATIONSACTION:
      return {
        ...state,
        checkedEndStations:action.data
      }
    case  SET_EARLIESTSTARTTIMEACTION:
      return {
        ...state,
        earliestStartTime:action.data
      }
    case  SET_LATESTSTART:
      return {
        ...state,
        latestStartTime:action.data
      }
    case SET_EARLIESTENDTIMEACTION:
      return {
        ...state,
        earliestEndTime:action.data
      }
    case  SET_LATESTENDTIMEACTION:
      return {
        ...state,
        latestEndTime:action.data
      }
    case  SET_IFOPENCOMPSCRMODELACTION:
      return {
        ...state,
        ifOpenCompScrModel:action.data
      }
    default:
      return state
  }
}