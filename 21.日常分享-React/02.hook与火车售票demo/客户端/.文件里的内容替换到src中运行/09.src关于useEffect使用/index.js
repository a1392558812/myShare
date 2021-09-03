import React,{ lazy,Suspense,Component}  from 'react';
/*
lazy函数 ：懒加载相关组件
const LazyLoad = lazy(() =>import('./components/lazyLoad'))
Suspense函数 ： 配合lazy函数使用
*/
import ReactDOM from 'react-dom';
import {Switch,Route,Redirect,NavLink,BrowserRouter} from 'react-router-dom'

import * as serviceWorker from './serviceWorker';
import Home from './components/home'
import List from './components/list'
import {ContextStudy} from './components/contextStudy'
import HookStudy from './components/HookStudy'

// 懒加载LazyLoad组件
/* 类比Vue懒加载 */
const LazyLoad = lazy(() =>import(/* webpackChunkName:'LazyLoad' */'./components/lazyLoad'))

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
      const style={
        width:'100%',
        height:'500px',
        border:'1px solid black'
      }
      return (
        <BrowserRouter>
          <NavLink to='/list'>list页面</NavLink><br/>
          <NavLink to='/home'>home页面</NavLink><br/>
          <NavLink to='/context'>context页面</NavLink><br/>
          <NavLink to='/lazyload'>lazyload页面</NavLink><br/>
          <NavLink to='/hook'>hook页面</NavLink><br/>
          <Switch>
            <Route path='/home' component={Home}/>
            <Route path='/list' component={List}/>
            <Route path='/context' component={ContextStudy}/>
            <Route path='/hook' component={HookStudy}/>
            { /*
            Suspense函数通过fallback={}函数，显示LazyLoading加载过程中所要显示的内容
            <Suspense fallback={
                <div>
                  Loading???
                </div>
              }>
            */}
            <Suspense fallback={<div>Loading???</div>}>
              <Route path='/lazyload' component={LazyLoad}/>
            </Suspense>
            <Redirect to='/home'/>
          </Switch>
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
