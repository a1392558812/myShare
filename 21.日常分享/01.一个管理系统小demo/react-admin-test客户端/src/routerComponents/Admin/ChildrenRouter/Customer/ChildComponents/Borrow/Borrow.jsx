import React,{Component} from 'react'
import {Button,message,Modal,Table} from 'antd'
import {ArrowLeftOutlined,ExclamationCircleOutlined } from '@ant-design/icons';

import {requestRemoveCustomer,requestCategoryList,requestCustomerBlack,requestCustomerList} from '../../../../../../ajax/index'
import BeSelectCustomers from './BeSelectCustomers'
import './Borrow.less'

const { confirm } = Modal;
const {Column} =Table;
export default class Borrow extends Component{
    state = {
        ifFatherCategory:true, // 当前是否是一级分类
        fatherArr:[], // 一级分类列表
        childrenArr:[], // 二级分类列表
        productFatherArr:[],// 一级产品列表
        productChildrenArr:[], // 二级产品列表
        dataSource:[], // 分类列表
        Customer:{}
    }
    async componentWillMount () {
        const record = BeSelectCustomers.BeSelectCustomers
        if (record.username && record !== {}) {
            console.log("async componentDidMount ()",record)
            await this.setState({
                Customer: {...record}
            })
        }else {
            this.props.history.replace('/managecustomer')
        }
    }
    componentDidMount () {
        this.getFatherCategoryList()
    }
    getCustomerList = async ({status,All,username,}) =>{
        const result = await requestCustomerList({status,All,username,})
        if (result.code ===0) {
            result.data.map((item) =>{
                item.key = item._id
            })
            await this.setState({
                customerData:result.data
            })
            console.log(this.state.customerData)
        } else {
            message.error("请求失败了，请刷新重试")
        }
    }
    getFatherCategoryList = async () =>{
        const result = await requestCategoryList('0')
        if (result.code ===0) {
            console.log(result.data)
            result.data.map(item => item.key = item._id)
            await this.setState({
                dataSource:result.data,
                fatherArr:result.data
            })
        } else {
            message.error("请求失败了，请刷新重试")
        }
    }
    getBlackCustomer = async ({username,_id,status}) =>{
        const result = await requestCustomerBlack({username,_id,status})
        if (result.code ===0) {
            const All  = 'all'
            this.getCustomerList({All})
            message.success("操作成功")
        } else {
            message.error("操作失败")
        }
    }
    getChildrenCategoryList = async (grade) =>{
        const result = await requestCategoryList(grade)
        if (result.code ===0) {
            result.data.map((item,index) =>item.key =item._id)
            await this.setState({
                ifFatherCategory:false,
                childrenArr: result.data,
                dataSource:result.data,
            })
        } else {
            message.error("请求出错了，请刷新")
        }
    }
    backToFather = () =>{
        this.setState({
            ifFatherCategory:true,
            dataSource:[...this.state.fatherArr],
            childrenArr:[],
        })
    }
    getRemoveCustomer = async (customerId) =>{
        const result = await requestRemoveCustomer(customerId)
        if (result.code ===0) {
            message.success('删除成功')
        } else {
            message.error('删除失败')
        }
    }
    checkInfo = (record) =>{ // 查看某个二级列表
        console.log(record)
        this.getChildrenCategoryList(record._id)
    }
    removeIt = () =>{
        confirm({
            title: '确定要删除该用户么？',
            icon: <ExclamationCircleOutlined />,
            content: '删除之后将无法再恢复',
            onOk:() => {
                const customerId = this.state.Customer._id
                this.getRemoveCustomer(customerId)
                const All ='all'
                this.getCustomerList({All})
                this.props.history.replace('./managecustome')
            },
            onCancel() {},
        });
    }
    goBack = () =>{
        const All ='all'
        this.getCustomerList({All})
        this.props.history.goBack()
    }
    blackusers = () =>{
        let {status} = this.state.Customer
        confirm({
            title: `确定要${status ===0?"拉黑":"解封"}该用户么？`,
            icon: <ExclamationCircleOutlined />,
            content: `${status ===0?"拉黑":"解封"}该用户后，该用户将${status ===0?"无法":"可以"}再次租借图书`,
            onOk:() => {
                const {_id,username} = this.state.Customer
                if (status ===0) {
                    status = 1
                }else {
                    status = 0
                }
                this.getBlackCustomer({username,_id,status})
                this.props.history.replace('./managecustome')
            },
            onCancel() {},
        });
    }
    checkbooks = (record) =>{
        const {Customer} = this.state
        console.log(record,Customer)
        BeSelectCustomers.BeSelectCustomers = {record,Customer}
        this.props.history.push('/managecustomer/borrowbook')
    }
    componentWillUnmount(){
        this.setState = (state, callback) => {
            return
        }
    }
    render(){
        const {username} = this.state.Customer
        return(
            <div className='Borrow-wrap'>
                <div className='Borrow'>
                    <div className='Borrow-header-wrap'>
                        <div className='Borrow-header'>
                            <div className='Borrow-header-left'>
                                <ArrowLeftOutlined
                                    onClick={this.goBack}
                                    style={{marginRight:20}}/>
                                <span>用户：{username}</span>
                            </div>
                            <div className='Borrow-header-right'>
                                {this.state.ifFatherCategory ? null: <Button
                                    style={{marginRight:10}}
                                    onClick={this.backToFather}>返回详情页</Button>}
                                <Button style={{marginRight:10}} onClick={this.removeIt}>删除用户</Button>
                                <Button
                                    type='primary'
                                    onClick={this.blackusers}>{
                                        this.state.Customer.status===0?"拉黑用户":"解封用户"
                                    }</Button>
                            </div>
                        </div>
                    </div>
                    <div className='Borrow-line-wrap'>
                        <div className='Borrow-line'></div>
                    </div>
                    <div className='Borrow-main'>
                        <div className='Borrow-main'>
                           <Table
                                dataSource={this.state.dataSource}
                                pagination={{pageSize:8}}>
                                <Column title="一级分类名称" dataIndex="name" key="name"/>
                                <Column title="当前分类图书" dataIndex="books" key="books" render={(text, record) => (
                                   <Button onClick={() =>{
                                       this.checkbooks(record)
                                   }}>查看图书</Button>
                               )}/>
                               {this.state.ifFatherCategory?<Column title="查看详情" dataIndex="action" key="action" render={(text, record) => (
                                   <Button onClick={() =>{
                                       this.checkInfo(record)
                                   }}>查看详情</Button>
                               )}/>:null}

                            </Table>
                        </div>
                    </div>
                </div>

            </div>
        )
    }
}
