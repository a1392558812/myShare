import React, {useCallback,memo,useMemo} from 'react'
import {useMappedState,useDispatch} from 'redux-react-hook'
import classnames from 'classnames'
import './bottom.css'
import {
  ifHighSpeedAction,
  ifOpenCompScrModelAction,
  onlyWatchHadTicketsAction,
  orderTypeAction
} from '../../redux/actions'
import ButtonModel from './ButtonModel/BottomModel'


const Bottom = memo((props) =>{
  const {
    orderType,
    ifHighSpeed,
    onlyWatchHadTickets,
    ifOpenCompScrModel
  } = useMappedState(state => state).queryReducer
  const dispatch = useDispatch()
  const toggleOrderType = useCallback(() =>{
    if(orderType ===1){
      dispatch(orderTypeAction(2))
    }else{
      dispatch(orderTypeAction(1))
    }
  },[orderType])
  const toggleIfHighSpeed = useCallback(() =>{
    dispatch(ifHighSpeedAction(!ifHighSpeed))
  },[ifHighSpeed])
  const toggleOnlyWatchHadTicketsAction = useCallback(() =>{
    dispatch(onlyWatchHadTicketsAction(!onlyWatchHadTickets))
  },[onlyWatchHadTickets])
  const toggleIfOpenCompScrModelAction = useCallback(() =>{
    dispatch(ifOpenCompScrModelAction(!ifOpenCompScrModel))
  },[ifOpenCompScrModel])
  const showStr = useMemo(() =>{
    if(orderType === 1){
      return 'εΊε ζ©πζ'
    }else{
      return 'θζΆ η­πιΏ'
    }
  },[orderType])
  const {
    checkedTicketsTypes,
    checkedTrainTypes,
    checkedStartStations,
    checkedEndStations,
    earliestStartTime,
    latestStartTime,
    earliestEndTime,
    latestEndTime,
  } = useMappedState(state => state).queryReducer
  const isReRender = useMemo(() =>{
    return  Object.keys(checkedTicketsTypes).length === 0
      && Object.keys(checkedTrainTypes).length === 0
      && Object.keys(checkedStartStations).length === 0
      && Object.keys(checkedEndStations).length === 0
      && earliestStartTime === 0
      && latestStartTime === 24
      && earliestEndTime === 0
      && latestEndTime === 24
  },[
    checkedTicketsTypes,
    checkedTrainTypes,
    checkedStartStations,
    checkedEndStations,
    earliestStartTime,
    latestStartTime,
    earliestEndTime,
    latestEndTime,
  ])
  return (
    <div className='bottom'>
      <div className='bottom-filters'>
        <span className='item' onClick={() =>{toggleOrderType()}}>
          <i className='icon'>&#xf065;</i>
          {showStr}
        </span>
        <span className={classnames('item',{'item-on':ifHighSpeed})} onClick={() =>toggleIfHighSpeed()}>
          <i className='icon'>
            {
              ifHighSpeed
              ? '\uf43f'
              : '\uf43e'
            }
          </i>
          εͺηπ/π
        </span>
        <span className={classnames('item',{'item-on':onlyWatchHadTickets})} onClick={() =>toggleOnlyWatchHadTicketsAction()}>
          <i className='icon'>
            {
              onlyWatchHadTickets
                ? '\uf43d'
                : '\uf43c'
            }
          </i>
          εͺηζη₯¨
        </span>
        <span className={classnames('item',{'item-on':ifOpenCompScrModel||!isReRender})} onClick={() =>toggleIfOpenCompScrModelAction()}>
          <i className='icon'>{
            isReRender
            ? '\uf0f7'
            : '\uf446'
          }</i>
          η»Όεη­ι
        </span>
      </div>
      {
        ifOpenCompScrModel
          ? <ButtonModel toggleIfOpenCompScrModelAction={toggleIfOpenCompScrModelAction}/>
          : null
      }
    </div>
  )
})
export default Bottom