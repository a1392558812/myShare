import React, {memo ,useCallback} from 'react'
import PropTypes from 'prop-types'
import { handelDelete, handelUpdate, showTicketTypeMenu } from '../../redux/asyncActions'
import { useDispatch } from 'redux-react-hook'


const Passenger = memo((props) =>{
  const dispatch = useDispatch()
  const {
    id,
    name,
    followAdult,
    ticketType,
    licenceNo,
    gender,
    showGender,
    birthday,
    showFollowAdultMenu,
    showTicketTypeMenu,
    mapIdToName
  } = props
  console.log(mapIdToName,followAdult)
  return(
    <li className='passenger'>
      <i className='delete' onClick={() =>handelDelete(dispatch,id)}>-</i>
      <ol className='items'>
        <li className='item'>
          <label className='label name'>姓名</label>
            <input
              type="text"
              className='input name'
              placeholder='乘客姓名'
              onChange={(e) =>{
                handelUpdate(dispatch,id,{name:e.target.value})
              }}
              value={name}/>
          <label className='ticket-type' onClick={() =>showTicketTypeMenu(dispatch,id)}>
            {
              ticketType === 'adult'
              ? '成人票'
              : '儿童票'
            }
          </label>
        </li>
        {
          ticketType ==='adult'
          ? <li className='item'>
              <label className='label licenceNo'>身份证</label>
              <input
                type="text"
                className='input licenceNo'
                placeholder='证件号码'
                onChange={(e) =>{
                  handelUpdate(dispatch,id,{licenceNo:e.target.value})
                }}
                value={licenceNo}/>
            </li>
          : null
        }
        {
          ticketType !=='adult'
            ? <li className='item arrow'>
              <label className='label gender'>性别</label>
              <input
                type="text"
                className='input gender'
                placeholder='性别'
                onClick={() =>showGender(dispatch,id)}
                readOnly
                value={
                  gender === 'male'
                    ? "👦男"
                    : gender === 'female'
                        ? "👧女"
                        : '👴'
                }/>
            </li>
            : null
        }
        {
          ticketType !=='adult'
            ? <li className='item'>
              <label className='label birthday'>出生日期</label>
              <input
                type="text"
                className='input birthday'
                placeholder='出生日期'
                onChange={(e) =>{
                  handelUpdate(dispatch,id,{birthday:e.target.value})
                }}
                value={birthday}/>
            </li>
            : null
        }
        {
         ticketType !=='adult'
            ? <li className='item arrow'>
              <label className='label followAdult'>同行大人</label>
              <input
                type="text"
                className='input followAdult'
                placeholder='同行大人'
                readOnly
                onClick={() =>showFollowAdultMenu(dispatch,id)}
                value={mapIdToName[followAdult]}/>
            </li>
            : null
        }
      </ol>
    </li>
  )
})
Passenger.propTypes = {
  id:PropTypes.number.isRequired,
  name:PropTypes.string.isRequired,
  followAdult:PropTypes.number,
  ticketType:PropTypes.string.isRequired,
  licenceNo:PropTypes.string,
  gender:PropTypes.string,
  birthday:PropTypes.string,
  showGender:PropTypes.func.isRequired,
  showFollowAdultMenu:PropTypes.func.isRequired,
  showTicketTypeMenu:PropTypes.func.isRequired,
  mapIdToName:PropTypes.object,
}
export default Passenger
