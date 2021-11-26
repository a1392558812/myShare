import React,{ lazy,Suspense,Component}  from 'react';
import ReactDOM from 'react-dom';
import {Switch,Route,Redirect,NavLink,BrowserRouter} from 'react-router-dom'

import * as serviceWorker from './serviceWorker';
import Home from './components/home'
import HookUseContextStudy from './components/HookUseContextStudy'
class Main extends Component {
  state = {
    hasError:false
  }
  componentDidCatch(){
    this.setState({
      hasError:true
    })
  }
  render(){
    if(this.state.hasError){
      return (
        <div>
          ERROR页面
        </div>
      )
    }else{
      return (
        <BrowserRouter>
          <NavLink to='/home'>home页面</NavLink><br/>
          <NavLink to='/hook'>HookUseContextStudy页面</NavLink><br/>
          <Route path='/hook' component={HookUseContextStudy}/>
          <Route path='/home' component={Home}/>
        </BrowserRouter>
      )
    }
  }
}
ReactDOM.render(
  (<Main/>)
 ,document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
