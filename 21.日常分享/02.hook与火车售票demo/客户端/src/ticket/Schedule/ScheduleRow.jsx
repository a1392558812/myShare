import React, { memo} from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

const ScheduleRow = memo((props) =>{
  const {
    index,
    station,
    arriveTime,
    departTime,
    stay,
    isStartStation, // 是否是始发站
    isEndStation, // 是否是终点站
    isDepartStation, // 是否是行程的出发车站
    isArriveStation, //是否是行程的终点站
    beforeDepartStation, //是否在出发车站之前
    afterArriveStation, // 是否在行程的终点站之后
  } = props
  console.log(props)
  return (
    <li>
      <div className={classnames('icon',{'icon-red':isDepartStation || isArriveStation})}>
        {
          isDepartStation
          ? '出'
            : isArriveStation
            ? '到'
              : index>10
                ? index
                : '0' + index
        }
      </div>
      <div className={classnames('row',{'grey':beforeDepartStation || afterArriveStation})}>
        <span className={classnames('station',{'red':isDepartStation || isArriveStation})}>{station}</span>
        <span className={classnames('arrtime',{"red":isArriveStation})}>{
          isStartStation
          ? '始发站'
          : arriveTime
        }</span>
        <span className={classnames('deptime',{"red":isDepartStation})}>{
          isEndStation
            ? '终到站'
            : departTime
        }</span>
        <span className='stoptime'>
          {
            isStartStation||isEndStation
            ? '-'
            : stay + '分'
          }
        </span>
      </div>
    </li>
  )
})
ScheduleRow.propType = {
index:PropTypes.number.isRequired,
station:PropTypes.string.isRequired,
arriveTime:PropTypes.string.isRequired,
departTime:PropTypes.string.isRequired,
stay:PropTypes.string.isRequired,
isStartStation:PropTypes.bool.isRequired,
isEndStation:PropTypes.bool.isRequired,
isDepartStation:PropTypes.bool.isRequired,
isArriveStation:PropTypes.bool.isRequired,
beforeDepartStation:PropTypes.bool.isRequired,
afterArriveStation:PropTypes.bool.isRequired,
}
export default ScheduleRow