import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  memo,
  useReducer
} from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import { useMappedState, useDispatch } from "redux-react-hook";
import CityList from './CityList/CityList'
import Suggest from './Suggest/Suggest'

import {CountContext} from './contextMarger'
import './cityModel.css'
import {
  getRequestCityData,
  selectFromAndTo,
} from '../../redux/asyncActions'

const CityModel = (props) =>{
  const [inputValue,setInputValue] = useState('')
  const {handelOnBack} = props
  const {ifOpenCityModal,ifLoadingCityData,cityData} = useMappedState(state => state).trainReducer
  const dispatch = useDispatch()
  /* 判断是否显示小xx */
  const ifShowX = useMemo(() =>{
    return inputValue.trim()
  },[inputValue])
  /* 发起请求获取数据 */
  useEffect(() =>{
    if(ifOpenCityModal && cityData && Object.keys(cityData).length === 0  && !ifLoadingCityData){
      getRequestCityData(dispatch)
    }
  },[ifOpenCityModal,cityData,ifLoadingCityData])
  const onSelect = useCallback((name) =>{
    console.log(name)
    selectFromAndTo(dispatch,name)
  },[])
  /* 模态框 */
  const AllCity = () =>{
    if(ifLoadingCityData){
      return (<div>Loading...</div>)
    }
    if(cityData && Object.keys(cityData).length !== 0){
      return (

          <CityList sections={cityData.cityList}/>

      )
    }
    return (
      <div>
        ERROR... ...
      </div>
    )
  }
  const PositioningLetterPosition = useCallback((alpha) =>{
    document.querySelector(`[data-cate='${alpha}']`).scrollIntoView()
  },[])

  return(
    <div className={classnames('city-selector',{hidden:!ifOpenCityModal})}>
      <CountContext.Provider value={{onSelect,PositioningLetterPosition}}>
        <div className='city-search'>
          <div className='search-back' onClick={handelOnBack}>
            <svg width="42" height="42">
              <polyline
                points="25,13 16,21 25,29"
                stroke="#fff"
                strokeWidth="2"
                fill="none"/>
            </svg>
          </div>
          <div className='search-input-wrapper'>
            <input
              type="text" /* */
              onChange={(e) => setInputValue(e.target.value)}
              className='search-input' value={inputValue}
              placeholder='🍔奥利给👿'/>
            {
              ifShowX
                ? <i className='search-clean' onClick={() =>{setInputValue('')}}>&#xf063;</i>
                : null
            }
          </div>
       </div>
        {
          ifShowX
          ? <Suggest inputValue={ifShowX}/>
          : null
        }
        {AllCity()}
      </CountContext.Provider>
    </div>
  )
}
CityModel.propTypes = {
  handelOnBack:PropTypes.func.isRequired
}
export default CityModel
