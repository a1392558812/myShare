import React,{Component} from 'react'
import {Switch,Route,Redirect} from 'react-router-dom'

import Revise from './ChildrenRouterComponents/Revise/Revise'
import DetailedInformation from './ChildrenRouterComponents/DetailedInformation/DetailedInformation'
import MainContent from './ChildrenRouterComponents/MainContent/MainContent'

import './Product.less'

export default class Product extends Component{
    render(){
        return(
            <div className='Product'>
                <Switch>
                    <Route path='/product/addupdate' component={Revise}></Route>
                    <Route path='/product/detail' component={DetailedInformation}></Route>
                    <Route exact={true} path='/product' component={MainContent}></Route>
                    <Redirect exact={true} to='/product'></Redirect>
                </Switch>
            </div>
        )
    }
}
