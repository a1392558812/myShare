import React from 'react';
import ReactDOM from 'react-dom';
import {Switch,Route,Redirect,NavLink,BrowserRouter} from 'react-router-dom'
import * as serviceWorker from './serviceWorker';
import Home from './components/home'
import List from './components/list'
import {ContextStudy} from './components/contextStudy'

ReactDOM.render(
  (<BrowserRouter>
    <NavLink to='/list'>list页面</NavLink>
    <NavLink to='/home'>home页面</NavLink>
    <NavLink to='/context'>context页面</NavLink>
    <Switch>
      <Route path='/home' component={Home}/>
      <Route path='/list' component={List}/>
      <Route path='/context' component={ContextStudy}/>
      <Redirect to='/home'/>
    </Switch>
  </BrowserRouter>)
 ,document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
