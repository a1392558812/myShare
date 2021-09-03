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
  SET_IFOPENCOMPSCRMODELACTION,

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


/*
* trainNumber
departStation
arriveStation
seatType
departDate*/

export const passengersAdult = (passengers) =>passengersActionCreate(passengers)
export const passengersChild = (passengers) =>passengersActionCreate(passengers)

export const trainNumberActionCreate = (trainNumber) =>({type:SET_TRAINNUMBERACTIONCREATE,data:trainNumber })
export const departStationActionCreate = (departStation) =>({type:SET_DEPARTSTATIONACTIONCREATE,data:departStation })
export const arriveStationActionCreate = (arriveStation) =>({type:SET_ARRIVESTATIONACTIONCREATE,data:arriveStation })
export const seatTypeActionCreate = (seatType) =>({type:SET_SEATTYPEACTIONCREATE,data:seatType })
export const departDateActionCreate = (departDate) =>({type:SET_DEPARTDATEACTIONCREATE,data:departDate })
export const arriveDateActionCreate = (arriveDate) =>({type:SET_ARRIVEDATEACTIONCREATE,data:arriveDate })
export const departTimeStrActionCreate = (departTimeStr) =>({type:SET_DEPARTTIMESTRACTIONCREATE,data:departTimeStr })
export const arriveTimeStrActionCreate = (arriveTimeStr) =>({type:SET_ARRIVETIMESTRACTIONCREATE,data:arriveTimeStr })
export const durationStrActionCreate = (durationStr) =>({type:SET_DURATIONSTRACTIONCREATE,data:durationStr })
export const priceActionCreate = (price) =>({type:SET_PRICEACTIONCREATE,data:price })
export const passengersActionCreate = (passengers) =>({type:SET_PASSENGERSACTIONCREATE,data:passengers })
export const menuActionCreate = (menu) =>({type:SET_MENUACTIONCREATE,data:menu })
export const isMenuVisibleActionCreate = (isMenuVisible) =>({type:SET_ISMENUVISIBLEACTIONCREATE,data:isMenuVisible })
export const searchParsedActionCreate = (searchParsed) =>({type:SET_SEARCHPARSEDACTIONCREATE,data:searchParsed })

export const  departDateAction = (departDate) =>({type:SET_DEPARTDATEACTION,data:departDate})
export const  arriveDateAction = (arriveDate) =>({type:SET_ARRIVEDATEACTION,data:arriveDate})
export const  departTimeStrAction = (departTimeStr) =>({type:SET_DEPARTTIMESTRACTION,data:departTimeStr})
export const  arriveTimeStrAction = (arriveTimeStr) =>({type:SET_ARRIVETIMESTRACTION,data:arriveTimeStr})
export const  departStationAction = (departStation) =>({type:SET_DEPARTSTATIONACTION,data:departStation})
export const  arriveStationAction = (arriveStation) =>({type:SET_ARRIVESTATIONACTION,data:arriveStation})
export const  trainNumberAction = (trainNumber) =>({type:SET_TRAINNUMBERACTION,data:trainNumber})
export const  durationStrAction = (durationStr) =>({type:SET_DURATIONSTRACTION,data:durationStr})
export const  ticketsAction = (tickets) =>({type:SET_TICKETSACTION,data:tickets})
export const  isScheduleVisibleAction = (isScheduleVisible) =>({type:SET_ISSCHEDULEVISIBLEACTION,data:isScheduleVisible})
export const  ifSearchParsedAction = (ifSearchParsed) =>({type:SET_IFSEARCHPARSEDACTION,data:ifSearchParsed})

export const searchParsedAction =(searchParsed) =>({type:SET_SEARCHPARSEDACTION,data:searchParsed})
export const fromAction =(from) =>({type:SET_FROMACTION,data:from})
export const toAction =(to) =>({type:SET_TOACTION,data:to})
export const departTimeAction =(departTime) =>({type:SET_DEPARTTIMEACTION,data:departTime})
export const ifHighSpeedAction =(ifHighSpeed) =>({type:SET_IFHIGHSPEEDACTION,data:ifHighSpeed})
export const trainListAction =(trainList) =>({type:SET_TRAINLISTACTION,data:trainList})
export const orderTypeAction =(orderType) =>({type:SET_ORDERTYPEACTION,data:orderType})
export const onlyWatchHadTicketsAction =(onlyWatchHadTickets) =>({type:SET_ONLYWATCHHADTICKETSACTION,data:onlyWatchHadTickets})
export const ticketsTypesArrAction =(ticketsTypesArr) =>({type:SET_TICKETSTYPESARRACTION,data:ticketsTypesArr})
export const checkedTicketsTypesAction =(checkedTicketsTypes) =>({type:SET_CHECKEDTICKETSTYPESACTION,data:checkedTicketsTypes})
export const trainTypesArrAction =(trainTypesArr) =>({type:SET_TRAINTYPESARRACTION,data:trainTypesArr})
export const checkedTrainTypesAction =(checkedTrainTypes) =>({type:SET_CHECKEDTRAINTYPESACTION,data:checkedTrainTypes})
export const startStationsAction =(startStations) =>({type:SET_STARTSTATIONSACTION,data:startStations})
export const checkedStartStationsAction =(checkedStartStations) =>({type:SET_CHECKEDSTARTSTATIONSACTION,data:checkedStartStations})
export const endStationsAction =(endStations) =>({type:SET_ENDSTATIONSACTION,data:endStations})
export const checkedEndStationsAction =(checkedEndStations) =>({type:SET_CHECKEDENDSTATIONSACTION,data:checkedEndStations})
export const earliestStartTimeAction =(earliestStartTime) =>({type:SET_EARLIESTSTARTTIMEACTION,data:earliestStartTime})
export const latestStartTimeAction =(latestStart) =>({type:SET_LATESTSTART,data:latestStart})
export const earliestEndTimeAction =(earliestEnd) =>({type:SET_EARLIESTENDTIMEACTION,data:earliestEnd})
export const latestEndTimeAction =(latestEnd) =>({type:SET_LATESTENDTIMEACTION,data:latestEnd})
export const ifOpenCompScrModelAction =(ifOpenCompScrModel) =>({type:SET_IFOPENCOMPSCRMODELACTION,data:ifOpenCompScrModel})

export const setFrom = (from) =>({type:SET_FROM_ACTIONTYPE,data:from})
export const setTo = (to) =>({type:SET_TO_ACTIONTYPE,data:to})
export const setIfOpenCityModal = (ifOpenCityModal) =>({type:SET_IFOPENCITYMODAL_ACTIONTYPE,data:ifOpenCityModal})
export const setNowSelectedCityLeft = (nowSelectedCityLeft) =>({type:SET_NOWSELECTEDCITYLEFT_ACTIONTYPE,data:nowSelectedCityLeft})
export const setCityData = (cityData) =>({type:SET_CITYDATA_ACTIONTYPE,data:cityData})
export const setIfLoadingCityData = (ifLoadingCityData) =>({type:SET_IFLOADINGCITYDATA_ACTIONTYPE,data:ifLoadingCityData})
export const setIfOpenDateModal = (ifOpenDateModal) =>({type:SET_IFOPENDATEMODAL_ACTIONTYPE,data:ifOpenDateModal})
export const setIfSelectedHighSpeed = () =>({type:SET_IFSELECTEDHIGHSPEED_ACTIONTYPE})
export const exchangeFromTo = () =>({type:SET_EXCHANGEFROMTO_ACTIONTYPE})
export const setTime = (time) =>({type:SET_TIME_ACTIONTYPE,data:time})
