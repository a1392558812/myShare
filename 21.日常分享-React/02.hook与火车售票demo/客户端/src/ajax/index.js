import ajax from './ajax'
const baseUrl = 'http://localhost:3000'
export const requestCityData = () =>ajax(`${baseUrl}/getcitydata`,{},'GET')
export const requestSearchData = ({searchKey}) =>ajax(`${baseUrl}/getsearchdata`,{searchKey},'GET')
export const requestQuery = (
  {departTime,
   ifHighSpeed,
   from,
   to,
   searchParsed,
   orderType,
   onlyWatchHadTickets,
   checkedTicketsTypes,
   checkedTrainTypes,
   checkedStartStations,
   checkedEndStations,
   earliestStartTime,
   latestStartTime,
   earliestEndTime,
   latestEndTime,})=>
  ajax(`${baseUrl}/query`,{
    departTime,
    ifHighSpeed,
    from,
    to,
    searchParsed,
    orderType,
    onlyWatchHadTickets,
    checkedTicketsTypes,
    checkedTrainTypes,
    checkedStartStations,
    checkedEndStations,
    earliestStartTime,
    latestStartTime,
    earliestEndTime,
    latestEndTime,
},'GET')
export const requestTicket = ({data,trainNumber,}) =>ajax(`${baseUrl}/ticket`,{data,trainNumber},'GET')
export const requestScheduleList = ({departDate,departStation,arriveStation,trainNumber}) =>ajax(`${baseUrl}/schedule`,{departDate,departStation,arriveStation,trainNumber},'GET')
export const requestOrder = ({dStation,aStation,type,date}) =>ajax(`${baseUrl}/order`,{dStation,aStation,type,date},'GET')