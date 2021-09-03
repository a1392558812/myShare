import React,{ lazy,Suspense,Component}  from 'react';
import ReactDOM from 'react-dom';
import {StoreContext} from 'redux-react-hook';

import App from './App'
import './index.css'
/* 定制各个浏览器统一样式 */
import 'normalize.css/normalize.css'

import store from '../redux/store'

import * as serviceWorker from '../serviceWorker';

ReactDOM.render(
  ( <StoreContext.Provider value={store}>
    <App/>
  </StoreContext.Provider>)
 ,document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// 如果你想在你的App应用中开启离线工作画着加载更快，你可以把unregister() 改为 register()
serviceWorker.unregister();
