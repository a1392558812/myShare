import React, {memo,useMemo,useState,useReducer} from 'react'
import PropTypes from 'prop-types'
import {useMappedState,useDispatch} from 'redux-react-hook'
import classnames from 'classnames'


import '../bottom.css'
import Option from '../Option/Option'
import Slider from '../Slider/Slider'
import {
  checkedEndStationsAction,
  checkedStartStationsAction,
  checkedTicketsTypesAction,
  checkedTrainTypesAction, earliestEndTimeAction, earliestStartTimeAction, latestEndTimeAction, latestStartTimeAction
} from '../../../redux/actions'
import checkedReducer from '../HookReducer'

const ButtonModel  = memo((props) =>{
  const {toggleIfOpenCompScrModelAction} = props
  const dispatch = useDispatch()
  const {
    ticketsTypesArr,
    checkedTicketsTypes,
    trainTypesArr,
    checkedTrainTypes,
    startStations,
    checkedStartStations,
    endStations,
    checkedEndStations,
    earliestStartTime,
    latestStartTime,
    earliestEndTime,
    latestEndTime,
  } = useMappedState(state => state).queryReducer
  /* 延迟初始化state,只在初始化调用 */
  const [checkedTicketsTypesState,checkedTicketsTypesStateDispatch] = useReducer(checkedReducer,checkedTicketsTypes,(checkedTicketsTypes) =>{
    return {...checkedTicketsTypes}
  })
  const [checkedTrainTypesState,checkedTrainTypesStateDispatch] = useReducer(checkedReducer,checkedTrainTypes,(checkedTrainTypes) =>{
    return {...checkedTrainTypes}
  })
  const [checkedStartStationsState,checkedStartStationsStateDispatch] = useReducer(checkedReducer,checkedStartStations,(checkedStartStations) =>{
    return {...checkedStartStations}
  })
  const [checkedEndStationsState,checkedEndStationsStateDispatch] = useReducer(checkedReducer,checkedEndStations,(checkedEndStations) =>{
    return {...checkedEndStations}
  })
  const [earliestStartTimeState,setEarliestStartTimeState] = useState(() =>{
    return earliestStartTime
  })
  const [latestStartTimeState,setLatestStartTimeState] = useState(() =>{
    return latestStartTime
  })
  const [earliestEndTimeState,setEarliestEndTimeState] = useState(() =>{
    return earliestEndTime
  })
  const [latestEndTimeState,setLatestEndTimeState] = useState(() =>{
    return latestEndTime
  })
  const optionArr = useMemo(() =>{
    return  [
      {
        title:'坐席类型',
        options:ticketsTypesArr,
        checkedMap:checkedTicketsTypesState,
        dispatchHook:checkedTicketsTypesStateDispatch
      },{
        title:'车次类型',
        options:trainTypesArr,
        checkedMap:checkedTrainTypesState,
        dispatchHook:checkedTrainTypesStateDispatch
      },{
        title:'出发车站',
        options:startStations,
        checkedMap:checkedStartStationsState,
        dispatchHook:checkedStartStationsStateDispatch
      },{
        title:'到达车站',
        options:endStations,
        checkedMap:checkedEndStationsState,
        dispatchHook:checkedEndStationsStateDispatch
      }
    ]
  },[ticketsTypesArr,
    checkedTicketsTypesState,
    trainTypesArr,
    checkedTrainTypesState,
    startStations,
    checkedStartStationsState,
    endStations,
    checkedEndStationsState,])
  const handelSure = () =>{
    dispatch(checkedTicketsTypesAction(checkedTicketsTypesState))
    dispatch(checkedTrainTypesAction(checkedTrainTypesState))
    dispatch(checkedStartStationsAction(checkedStartStationsState))
    dispatch(checkedEndStationsAction(checkedEndStationsState))
    dispatch(earliestStartTimeAction(earliestStartTimeState))
    dispatch(latestStartTimeAction(latestStartTimeState))
    dispatch(earliestEndTimeAction(earliestEndTimeState))
    dispatch(latestEndTimeAction(latestEndTimeState))
    toggleIfOpenCompScrModelAction()
  }
  const isReRender = useMemo(() =>{
    return  Object.keys(checkedTicketsTypesState).length === 0
            && Object.keys(checkedTrainTypesState).length === 0
            && Object.keys(checkedStartStationsState).length === 0
            && Object.keys(checkedEndStationsState).length === 0
            && earliestStartTimeState === 0
            && latestStartTimeState === 24
            && earliestEndTimeState === 0
            && latestEndTimeState === 24
  },[
    checkedTicketsTypesState,
    checkedTrainTypesState,
    checkedStartStationsState,
    checkedEndStationsState,
    earliestStartTimeState,
    latestStartTimeState,
    earliestEndTimeState,
    latestEndTimeState,
  ])

  const handelRest = () =>{
    if(isReRender){
      return
    }
    checkedTicketsTypesStateDispatch({type:'reset'})
    checkedTrainTypesStateDispatch({type:'reset'})
    checkedStartStationsStateDispatch({type:'reset'})
    checkedEndStationsStateDispatch({type:'reset'})
    setEarliestStartTimeState(0)
    setLatestStartTimeState(24)
    setEarliestEndTimeState(0)
    setLatestEndTimeState(24)
  }


  return (
    <div className='bottom-modal'>
      <div className='bottom-dialog'>
        <div className='bottom-dialog-content'>
          <div className='title'>
            <span className={classnames('reset',{ disabled:isReRender})} onClick={handelRest}>重置</span>
            <span className='ok' onClick={handelSure}>确定</span>
          </div>
          <div className='options'>
            {
              optionArr.map((item) =>{
                return (
                  <Option dispatchHook={item.dispatchHook} key={item.title} checkedMap={item.checkedMap} options={item.options} title={item.title}/>
                )
              })
            }
            <Slider
              key={'出发时间'}
              title={'出发时间'}
              StartTime={earliestStartTimeState}
              EndTime={latestStartTimeState}
              StartTimeChange={setEarliestStartTimeState}
              EndTimeChange={setLatestStartTimeState}/>
            <Slider
              key={'到达时间'}
              title={'到达时间'}
              StartTime={earliestEndTimeState}
              EndTime={latestEndTimeState}
              StartTimeChange={setEarliestEndTimeState}
              EndTimeChange={setLatestEndTimeState}/>
          </div>
        </div>
      </div>
    </div>
  )
})

ButtonModel.propTypes = {
  toggleIfOpenCompScrModelAction:PropTypes.func.isRequired
}
export default ButtonModel

