import {combineReducers} from 'redux'//可以整合暴露多个函数
import trainReducer from './trainReducer'
import queryReducer from './queryReducer'
import ticketReducer from './ticketReducer'
import orderReducer from './orderReducer'
export default combineReducers({
  trainReducer,
  queryReducer,
  ticketReducer,
  orderReducer
})
