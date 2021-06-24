import React,{Component} from 'react'
import {Switch,Route,Redirect} from 'react-router-dom'
import Customers from './ChildComponents/Customers'
import UpdateCustomer from './ChildComponents/UpdateCustomer/UpdateCustomer'
import Borrow from './ChildComponents/Borrow/Borrow'
import BorrowBook from './ChildComponents/Borrow/BorrowBook/BorrowBook'
import CheckAllNotReturn from './ChildComponents/CheckAllNotReturn/CheckAllNotReturn'

import './Customer.less'
export default class Customer extends Component{
    render(){
        return(
            <div className='MainCustomer'>
                <Switch>
                    <Route exact={true} path='/managecustomer' component={Customers}></Route>
                    <Route path='/managecustomer/notreturn' component={CheckAllNotReturn}></Route>
                    <Route path='/managecustomer/update' component={UpdateCustomer}></Route>
                    <Route path='/managecustomer/borrowbook' component={BorrowBook}></Route>
                    <Route path='/managecustomer/borrow' component={Borrow}></Route>
                    <Redirect exact={true} to='/managecustomer'></Redirect>
                </Switch>
            </div>
        )
    }
}
