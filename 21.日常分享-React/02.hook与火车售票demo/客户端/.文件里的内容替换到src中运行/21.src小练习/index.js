import React,{ lazy,Suspense,Component}  from 'react';
import ReactDOM from 'react-dom';
import {Switch,Route,Redirect,NavLink,BrowserRouter} from 'react-router-dom'

import * as serviceWorker from './serviceWorker';
import App from './App'
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
          <App/>
        </BrowserRouter>
      )
    }
  }
}

ReactDOM.render(
  (<Main style={{width:'100%',height:'100%'}}/>)
 ,document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
