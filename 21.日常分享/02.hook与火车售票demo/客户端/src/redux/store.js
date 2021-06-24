/*redux最核心的管理对象*/
import {createStore,applyMiddleware} from 'redux'
import reducers from './reducers'
import thunk from 'redux-thunk'
const store = createStore(
  reducers,
  applyMiddleware(thunk)
)
export default store