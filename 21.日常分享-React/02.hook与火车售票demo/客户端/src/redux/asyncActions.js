import store from './store'
import dayjs from 'dayjs'
import {
  requestCityData,
  requestQuery,
  requestTicket
} from '../ajax/index'
import {
  setCityData,
  setIfLoadingCityData,
  setIfOpenCityModal,
  setNowSelectedCityLeft,
  setFrom,
  setTo,
  orderTypeAction,
  ifHighSpeedAction,
  ifOpenCompScrModelAction,
  onlyWatchHadTicketsAction,
  departTimeAction,
  trainListAction,
  ticketsTypesArrAction,
  trainTypesArrAction,
  startStationsAction,
  endStationsAction,
  departTimeStrAction,
  arriveTimeStrAction,
  durationStrAction,
  arriveDateAction,
  ticketsAction,
  departTimeStrActionCreate,
  arriveDateActionCreate,
  arriveTimeStrActionCreate,
  durationStrActionCreate,
  priceActionCreate,
  passengersAdult,
  passengersChild,
  passengersActionCreate,
  menuActionCreate,
  isMenuVisibleActionCreate,
} from './actions'
import orderReducer from './orderReducer'
import { requestOrder } from '../ajax'

export const showMenu = (dispatch,menu) =>{
  dispatch(menuActionCreate(menu))
  dispatch(isMenuVisibleActionCreate(true))
}
export const showGender = (dispatch,id) =>{
  const {passengers} = store.getState().orderReducer
  const passenger = passengers.find( passenger =>{
    return passenger.id === id
  })
  if(passenger){
    showMenu(dispatch,{
      onPress(gender){
        handelUpdate(dispatch,id,{gender})
        dispatch(isMenuVisibleActionCreate(false))
      },
      options:[
        {title:"👦",value:'male',active:'male'===passenger.gender},
        {title:"👧",value:'female',active:'female'===passenger.gender}
      ]
    })
  }else{
    return
  }
}
export const showFollowAdultMenu = (dispatch,id) =>{
  const {passengers} = store.getState().orderReducer
  const passenger = passengers.find( passenger =>{
    return passenger.id === id
  })
  console.log(passenger)
  if(!passenger){
    return
  }
  showMenu(dispatch,{
    onPress(followAdult){
      handelUpdate(dispatch,id,{followAdult})
      dispatch(isMenuVisibleActionCreate(false))
    },
    options: passengers.filter(passenger =>{
      console.log(passengers)
      return passenger.ticketType === 'adult'
    }).map(adult =>{
      return {
        title:adult.name,
        value:adult.id,
        active:adult.id===passenger.followAdult
      }
    })
  })
}
export const showTicketTypeMenu = (dispatch,id) =>{
  const {passengers} = store.getState().orderReducer
  const passenger = passengers.find( passenger =>{
    return passenger.id === id
  })
  if(!passenger){
    return
  }
  showMenu(dispatch,{
    onPress(ticketType){
      if(ticketType === 'adult'){
        handelUpdate(
          dispatch,
          id,
          {ticketType,licenceNo: ""},
          ['gender','followAdult','birthday']
        )
      }else{
        const adult = passengers.find((passenger =>{
          return passenger.id !== id && passenger.ticketType === 'adult'
        }))
        if(adult){
          handelUpdate(
            dispatch,
            id,
            {ticketType,gender: "",followAdult: adult.id,birthday: "",},
            ['licenceNo']
          )
        }else{
          alert('没有其他成人可以携带该屁孩')
        }
      }
      dispatch(isMenuVisibleActionCreate(false))
    },
    options: [
      {title:'成人票',value:'adult',active: passenger.ticketType === 'adult'},
      {title:'儿童票',value:'child',active: passenger.ticketType !== 'adult'},
      ]
  })
}
export const handelUpdate = (dispatch,id,nameObj,removeKeys = []) =>{
  const {passengers} = store.getState().orderReducer
  for(let i=0;i<passengers.length;i++){
    if(passengers[i].id === id){
      const newPassengers = [...passengers]
      newPassengers[i] = Object.assign({},newPassengers[i],nameObj)
      for(let key of removeKeys){
        delete passengers[i][key]
      }
      dispatch(passengersActionCreate(newPassengers))
      break
    }
  }
}
export const handelDelete = (dispatch,id) =>{
  const {passengers} = store.getState().orderReducer
  const newPassengers = passengers.filter((passenger) =>{
    return passenger.id !== id && passenger.followAdult !== id
  })
  dispatch(passengersActionCreate(newPassengers))
}


let passengerIdSeed = 0
export const  createPassengersAdult = (dispatch) =>{
  const {passengers} = store.getState().orderReducer
  for(let passenger of passengers){
    console.log(passenger)
    const keys = Object.keys(passenger)
    for(let key of keys){
       if(!passenger[key]){
         return
       }
    }
  }
  dispatch(passengersAdult([
    ...passengers,
    {
      id:++passengerIdSeed,
      name: '',
      ticketType:'adult',
      licenceNo:'',
      seat:'Z',
    }
  ]))
}

export const  createPassengersChild = (dispatch) =>{
  let adultFount
  const {passengers} = store.getState().orderReducer
  for(let passenger of passengers){
    console.log(passenger)
    const keys = Object.keys(passenger)
    for(let key of keys){
      if(!passenger[key]){
        return
      }
    }
    if(passenger.ticketType === 'adult'){
      adultFount = passenger.id
    }
  }
  if(!adultFount){
    alert('请添加一个同行成人')
      return
  }
  dispatch(passengersChild([
    ...passengers,
    {
      id:++passengerIdSeed,
      name: '',
      gender:'none',
      birthday:'',
      followAdult:adultFount,
      ticketType:'child',
      seat:'Z',
    }
  ]))
}

export const getRequestCityData = async (dispatch) =>{
  const {ifLoadingCityData} = store.getState().trainReducer
  if(!ifLoadingCityData){
    const cityData_cache = JSON.parse(localStorage.getItem('cityData_cache')||'{}')
    // 判断缓存是否可用
    dispatch(setIfLoadingCityData(true))
    console.log(cityData_cache,Date.now())
    if(!cityData_cache.expires||cityData_cache.expires<Date.now()){
      console.log('不使用缓存')
      const result = await requestCityData()
      console.log(result)
      if(result.code === 0){
        dispatch(setCityData(result.data))
        localStorage.setItem('cityData_cache',JSON.stringify({
          expires:Date.now()+60*1000,
          cityData:result.data
        }))
      }else{
        console.log('数据获取失败')
      }
    }else{
      console.log('使用缓存')
      dispatch(setCityData(cityData_cache.cityData))
      console.log(cityData_cache.cityData)
    }
    dispatch(setIfLoadingCityData(false))
  }
}
export const selectFromAndTo = (dispatch,name) =>{
  console.log(store.getState().trainReducer)
  const {nowSelectedCityLeft} = store.getState().trainReducer
  if(!nowSelectedCityLeft){
    dispatch(setFrom(name))
  }else{
    dispatch(setTo(name))
  }
  dispatch(setIfOpenCityModal(false))
  dispatch(setNowSelectedCityLeft(!nowSelectedCityLeft))
}
export const getRequestQuery = async (dispatch,{
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
    latestEndTime,}) =>{
  console.log('发请求了啊')
  const result = await requestQuery({
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
  })
  console.log(result)
  if(result.code ===0 ){
    const {
      trains,
      filter:{
        ticketType,
        trainType,
        depStation,
        arrStation
      }
    } = result.data.dataMap.directTrainInfo
      dispatch(trainListAction(trains))
      dispatch(ticketsTypesArrAction(ticketType))
      dispatch(trainTypesArrAction(trainType))
      dispatch(startStationsAction(depStation))
      dispatch(endStationsAction(arrStation))
      console.log(store.getState())
  }else{
    console.log('出错了啊')
  }
}
export const getRequestTicket = async (dispatch,{data,trainNumber}) =>{
  const result = await requestTicket({data,trainNumber})
  console.log(result)
  if(result.code === 0){
    const {
      detail:{
        departTimeStr,
        arriveTimeStr,
        arriveDate,
        durationStr,
      }
      ,candidates} = result.data
    dispatch(departTimeStrAction(departTimeStr))
    dispatch(arriveTimeStrAction(arriveTimeStr))
    dispatch(durationStrAction(durationStr))
    dispatch(arriveDateAction(arriveDate))
    dispatch(ticketsAction(candidates))

  }else{
    console.log('请求失败了啊')
  }
}
export const getRequestOrder = async (dispatch) =>{
  const {
    searchParsed,
    departStation,
    arriveStation,
    seatType,
    departDate,
  } = store.getState().orderReducer
  if(searchParsed){
    const result = await requestOrder({
      dStation:departStation,
      aStation:arriveStation,
      type:seatType,
      date:dayjs(departDate).format('YYYY-MM-DD'),
    })
    console.log(result)
    if(result.code === 0){
      const {
        arriveDate,
        arriveTimeStr,
        departTimeStr,
        durationStr,
        price,
      } = result.data
      dispatch(departTimeStrActionCreate(departTimeStr))
      dispatch(arriveDateActionCreate(arriveDate))
      dispatch(arriveTimeStrActionCreate(arriveTimeStr))
      dispatch(durationStrActionCreate(durationStr))
      dispatch(priceActionCreate(price))
    }else{
      console.log('请求失败了啊')
    }
  }
}

