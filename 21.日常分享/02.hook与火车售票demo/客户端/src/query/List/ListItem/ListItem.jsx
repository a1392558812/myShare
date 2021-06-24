import React,{memo,useMemo} from 'react'
import PropTypes from 'prop-types'
import dayjs from 'dayjs'
import URI from 'urijs'

import '../list.css'
import { objToUrl } from '../../../common/tools'
const ListItem = memo( (props) =>{
  const {
    dTime, // 出发时间
    aTime, // 到达时间
    dStation, // 出发车站
    aStation, // 到达的车站
    trainNumber, // 车次
    departTime:date, // 出发日期
    time, // 运行时间
    priceMsg, //价格
    dayAfter, // 是否跨越日期
  } = props

  const paramStr = useMemo(() =>{
    console.log(dayjs(date).format('YYYY-MM-DD'))
    return new URI('ticket.html')+ objToUrl({aStation,dStation,trainNumber,date:dayjs(date).format('YYYY-MM-DD'),})
  },[aStation,dStation,trainNumber,date,])
  return (
    <li className='list-item'>
      <a href={paramStr}>
        <span className='item-time'>
          <em>{dTime} </em>
          <br/>
          <em className='em-light'>{aTime}<i className='time-after'>{dayAfter}</i></em>
        </span>
        <span className='item-stations'>
          <em><i className='train-station train-start'>始</i>{dStation}</em>
          <br/>
          <em className='em-light'><i className='train-station train-end'>终</i>{aStation}</em>
        </span>
        <span className='item-train'>
          <em>{trainNumber}</em>
          <br/>
          <em className='em-light'>{time}</em>
        </span>
        <span className='item-ticket'>
          <em>{priceMsg}</em>
          <br/>
          <em className='em-light-orange'>可以抢票</em>
        </span>
      </a>
    </li>
  )
})
ListItem.propTypes = {
  departTime:PropTypes.number.isRequired,
  dTime:PropTypes.string.isRequired,
  aTime:PropTypes.string.isRequired,
  dStation:PropTypes.string.isRequired,
  aStation:PropTypes.string.isRequired,
  trainNumber:PropTypes.string.isRequired,
  date:PropTypes.string.isRequired,
  time:PropTypes.string.isRequired,
  priceMsg:PropTypes.string.isRequired,
  dayAfter:PropTypes.string.isRequired,
}


export default ListItem