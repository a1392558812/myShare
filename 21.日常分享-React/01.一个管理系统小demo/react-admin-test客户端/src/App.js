/* 根组件 */
import React,{Component} from 'react'
import {BrowserRouter,Route,Switch} from 'react-router-dom'

import Login from './routerComponents/Login/Login'
import Admin from './routerComponents/Admin/Admin'

export default class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route path='/login' component={Login}></Route>
                    <Route path='/' component={Admin}></Route>
                </Switch>
            </BrowserRouter>
        )
    }
}


