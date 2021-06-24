import React,{Component} from 'react'
import {Table,Button,Modal} from 'antd'
import {message} from 'antd'
import {ExclamationCircleOutlined} from '@ant-design/icons';

import {requestCustomerBlack,requestCustomerList,requestRemoveCustomer} from "../../../../../../ajax/index";
import './CheckAllNotReturn.less'

const {Column} =Table
const { confirm } = Modal;
export default class CheckAllNotReturn extends Component{
    state = {
        customerData:[], //  初始化用户列表
        customer:{} // 当前点击的顾客
    }
    componentDidMount() {
        const All ='all'
        this.getCustomerList({All})
    }
    getCustomerList = async ({status,All,username,}) =>{
        const result = await requestCustomerList({status,All,username,})
        if (result.code ===0) {
            let customerData = []
            const nowTime = new Date().getTime()
            result.data.forEach((item,index) =>{
                let flag = item.borrow.some((book) =>{
                    if (book){
                        return ((nowTime-(+book.bookBorrowTime))>86400000*3)
                    } else{
                        return false
                    }
                })
                if (flag) {
                    item.key = index
                    customerData.push(item)
                }
            })
            await this.setState({
                customerData:[...customerData]
            })
            console.log(this.state.customerData)
        } else {
            message.error("请求失败了，请刷新重试")
        }
    }
    getBlackCustomer = async ({username,_id,status}) =>{
        const result = await requestCustomerBlack({username,_id,status})
        if (result.code ===0) {
            const All  = 'all'
            message.success("拉黑成功")
        } else {
            message.error("拉黑失败，请刷新重试")
        }
    }
    gotomanagecustome = () =>{
        const All = 'all'
        requestCustomerList({All})
        this.props.history.replace('/managecustomer')
    }
    blackCustomer = async (record) =>{
        const {_id,username} = record
        if (record.status ===1) {
            message.error("该用户已被拉黑无法再次拉黑")
        }else {
            const status = 1
            this.getBlackCustomer({username,_id,status})
            record.status = 1
            await this.setState({
                customer:{...record}
            })
        }
    }
    removeCustomer = async (record) =>{
        await this.setState({
            customer:{...record}
        })
        confirm({
            title: '确定要删除该用户么？',
            icon: <ExclamationCircleOutlined />,
            content: '删除该用户后，该用户将无法恢复',
            onOk: async () => {
                const customerId = record._id
                const key = record.key
                const result =await requestRemoveCustomer(customerId)
                if (result.code === 0) {
                    message.success("删除成功")
                    const customerData = this.state.customerData.filter((item)=>{
                        return item.key !==key
                    })
                    await this.setState({
                        customerData:[...customerData]
                    })
                } else {
                    message.error("删除失败")
                }
            },
            onCancel() {},
        });
    }
    render(){
        return(
            <div className='CheckAllNotReturn-wrap'>
                <div className='CheckAllNotReturn'>
                    <div className='CheckAllNotReturn-header-wrap'>
                        <div className='CheckAllNotReturn-header'>
                            <Button type='primary' onClick={this.gotomanagecustome}>回到首页</Button>
                            <span style={{marginLeft:40,fontSize:20}}>当前有未归还图书的顾客</span>
                        </div>
                    </div>
                    <div className='CheckAllNotReturn-line-wrap'>
                        <div className='CheckAllNotReturn-line'></div>
                    </div>
                    <div className='CheckAllNotReturn-main'>
                        <Table
                            dataSource={this.state.customerData}
                            pagination={{pageSize:6}}>
                            <Column title="用户名" dataIndex="username" key="username"/>
                            <Column title="邮箱" dataIndex="email" key="email"/>
                            <Column title="手机号" dataIndex="phone" key="phone"/>
                            <Column title="身份证号码" dataIndex="idCard" key="idCard"/>
                            <Column title="状态" dataIndex="status" key="status"
                                    render={(text, record) => (
                                        <span>
                                            {record.status===0?'正常':'已拉黑'}
                                        </span>
                                    )}/>
                            <Column title="操作" dataIndex="action" key="action"
                                    render={(text, record) => (
                                        <p>
                                            <Button
                                                style={{marginRight:20}}
                                                onClick={()=>{
                                                    this.blackCustomer(record)
                                             }}>拉黑</Button>
                                            <Button
                                                onClick={()=>{
                                                this.removeCustomer(record)
                                            }}>删除</Button>
                                        </p>
                                    )}/>
                        </Table>
                    </div>
                </div>
            </div>
        )
    }
}
