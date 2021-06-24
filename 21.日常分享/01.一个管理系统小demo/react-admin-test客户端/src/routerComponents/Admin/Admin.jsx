import React, { Component } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { Layout } from 'antd';

import './Admin.less'

import cache from '../../utils/cache'

import LayoutSider from '../../commonComponents/LayoutSider/LayoutSider'
import LayoutHeader from '../../commonComponents/LayoutHeader/LayoutHeader'
import Category from './ChildrenRouter/Category/Category'
import Home from './ChildrenRouter/Home/Home'
import Product from './ChildrenRouter/Product/Product'
import Role from './ChildrenRouter/Role/Role'
import User from './ChildrenRouter/User/User'
import ChartForm01 from './ChildrenRouter/ChartForm/ChartForm01'
import ChartForm02 from './ChildrenRouter/ChartForm/ChartForm02'
import ChartForm03 from './ChildrenRouter/ChartForm/ChartForm03'
import NotFindPage from './ChildrenRouter/NotFindPage/NotFindPage'
import Customer from './ChildrenRouter/Customer/Customer'


const { Header, Footer, Content } = Layout;

export default class Admin extends Component {
    render () {
        const user = cache.user
        if (!user.username) {
            return <Redirect to='/login' />
        }
        return (
            <div className='admin'>
                <Layout>
                    <LayoutSider></LayoutSider>
                    <Layout>
                        <Header>
                            <LayoutHeader></LayoutHeader>
                        </Header>
                        <Content className='admin-content'>
                            <Switch className='router'>
                                <Redirect exact from='/' to='/home'></Redirect>
                                <Route path='/category' component={Category}></Route>
                                <Route path='/home' component={Home}></Route>
                                <Route path='/managecustomer' component={Customer}></Route>
                                <Route path='/product' component={Product}></Route>
                                <Route path='/role' component={Role}></Route>
                                <Route path='/user' component={User}></Route>
                                <Route path='/chartform01' component={ChartForm01}></Route>
                                <Route path='/chartform02' component={ChartForm02}></Route>
                                <Route path='/chartform03' component={ChartForm03}></Route>
                                <Route component={NotFindPage}></Route>
                            </Switch>
                        </Content>
                        <Footer>
                            嘟嘟嘟嘟嘟嘟ヾ(o◕∀◕)ﾉヾ
                        </Footer>
                    </Layout>
                </Layout>
            </div>
        )
    }
}
