import React,{Component} from 'react'
import {
    Button,
    Input,
    Table,
    message,
    Card,
    Row,
    Col,
    Modal
} from 'antd'
import {UserOutlined} from '@ant-design/icons';

import './Customers.less'
import {requestCustomerList,requestCustomerUpdateBorrow} from '../../../../../ajax/index'
import AddCustomer from './AddCustomer/AddCustomer'
import UpdateCustomer from './UpdateCustomer/UpdateCustomer'
import BeSelectCustomers from './Borrow/BeSelectCustomers'

const {Search} = Input;
const {Column} = Table;
export default class Customers extends Component{
    state = {
        borrow:[],
        initCustomerData:{}, // 将被修改的客户
        customerData:[], // 顾客列表
        addModalVisible: false, // 添加顾客的模态框
        updateModalVisible: false,// 更新顾客的模态框
        giveBackBookModalVisible:false, // 还书的模态框
    }
    componentWillMount () {
        const All = 'all'
        this.getCustomerList({All})
    }
    gotoBorrow = (record) =>{
        console.log(record)
        BeSelectCustomers.BeSelectCustomers = record
        console.log(BeSelectCustomers.BeSelectCustomers)
        this.props.history.push('/managecustomer/borrow')
    }
    openAddCustomerModal = () =>{ // 打开添加顾客的模态框
        this.setState({
            addModalVisible:true,
        })
    }
    CloseModalVisible = () =>{ // 关闭模态框
        this.setState({
            addModalVisible:false,
            updateModalVisible: false,
            giveBackBookModalVisible:false
        })
    }
    updateCustomer = async (record) =>{
        await this.setState({
            updateModalVisible:true,
            initCustomerData:{...record}
        })
        console.log(record)
    }
    searchAsUserName = (value) =>{
        const username = value
        this.getCustomerList({username,})
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
    getCustomerUpdateBorrow = async ({_id,username,borrow}) =>{
        const result =  await requestCustomerUpdateBorrow({_id,username,borrow})
        if (result.code ===0) {
            console.log(result.data)
            message.success("还书成功")
            const All = 'all'
            this.getCustomerList({All})
        } else {
            message.success("还书失败，请刷新重试")
        }
    }
    getContinueBorrowBook = async ({_id,username,borrow}) =>{
        const result =  await requestCustomerUpdateBorrow({_id,username,borrow})
        if (result.code ===0) {
            console.log(result.data)
            message.success("续租成功")
            const All = 'all'
            this.getCustomerList({All})
        } else {
            message.success("续租失败，请刷新重试")
        }
    }
    searchAsBlack = async () =>{
        const status = 1
        this.getCustomerList({status})
    }
    searchAllCustomer = async () =>{
        const All = 'all'
        this.getCustomerList({All})
    }
    openGiveBackModal = async (record) =>{ // 打开还书的模态框
        await this.setState({
            initCustomerData:{...record},
            giveBackBookModalVisible:true,
            borrow:[...record.borrow]
        })
        console.log(record)
    }
    timeFunc = (timeNum) => {
        let dateStr = ''
        let timeStr = ''
        if (timeNum) {
            let time = new Date(timeNum)
            dateStr += time.getFullYear()+"年"
            dateStr += time.getMonth()+1+"月"
            dateStr += time.getDate()+"日"
            timeStr += time.getHours()+":"
            timeStr += time.getMinutes()+":"
            timeStr += time.getSeconds()
            return dateStr+' '+timeStr
        }
        return {dateStr:'时间格式出错了',timeStr:'时间格式出错了',}
    }
    giveBackBook = (index) =>{
        let {borrow} = this.state
        borrow = borrow.filter((item,key) =>index !==key)
        const {_id,username} = this.state.initCustomerData
        this.getCustomerUpdateBorrow({_id,username,borrow})
        this.setState({
            borrow:[...borrow]
        })
        console.log(borrow)
    }
    gotoNotReturn = () =>{
        this.props.history.push('/managecustomer/notreturn')
    }
    continueBorrowBook = (index) =>{
        console.log(this.state.initCustomerData)
        if (this.state.initCustomerData.status !== 0) {
             message.error("该用户已比拉黑，请解封该用户")
        }else{
            let oldBorrow = this.state.borrow
            const theBorrow = oldBorrow.filter((item,key) =>index ===key)[0]
            if (new Date().getTime()-(+theBorrow.bookBorrowTime)>86400000*3) {
                message.error("该书本借阅已逾期，请归还图书或联系管理员赔偿后再借阅")
            }else {
                console.log(index)
                const borrow = oldBorrow
                borrow[index].bookBorrowTime = new Date().getTime()
                const {_id,username} = this.state.initCustomerData
                this.getContinueBorrowBook({_id,username,borrow})
                this.CloseModalVisible()
                const All = 'all'
                this.getCustomerList({All})
            }
        }
    }
    render(){
        const {addModalVisible,updateModalVisible,giveBackBookModalVisible} = this.state
        return(
            <div className='Customer-wrap'>
                <div className='Customer'>
                    <div className='Customer-header-wrap'>
                        <div className='Customer-header'>
                            <Search  placeholder="按名称搜索顾客"
                                     onSearch={value => this.searchAsUserName(value)}
                                     style={{width: 200,marginRight:10 }}/>
                            <Button
                                type='primary'
                                style={{marginRight:10 }}
                                onClick={this.searchAllCustomer}>所有顾客</Button>
                            <Button
                                onClick={this.searchAsBlack}
                                type='primary'
                                style={{marginRight:10 }}>搜索被拉黑的顾客</Button>
                            <Button
                                type='primary'
                                style={{marginRight:10 }}
                                onClick={this.openAddCustomerModal}>添加顾客</Button>
                            <Button
                                type='primary'
                                style={{marginRight:10 }}
                                onClick={this.gotoNotReturn}>查询未归还图书顾客</Button>
                        </div>
                    </div>
                    <div className='Customer-line-wrap'>
                        <div className='Customer-line'></div>
                    </div>
                    <div className='Customer-main'>
                        <Table
                            dataSource={this.state.customerData}
                            pagination={{pageSize:7}}>
                            <Column title="用户名" dataIndex="username" key="username"/>
                            <Column title="邮箱" dataIndex="email" key="email"/>
                            <Column title="手机号" dataIndex="phone" key="phone"/>
                            <Column title="身份证号码" dataIndex="idCard" key="idCard"/>
                            <Column title="状态" dataIndex="status" key="status"
                                     render={(text, record) => (
                                        <span>
                                            {record.status===0?'正常':'已被拉黑'}
                                        </span>
                                     )}/>
                            <Column title="租借图书" dataIndex="borrow" key="borrow"
                                    render={(text, record) => (
                                        <span>
                                             <Button onClick={() =>{
                                                 this.gotoBorrow(record)
                                             }}>详情</Button>
                                        </span>)}/>
                            <Column title="归还图书" dataIndex="giveBack" key="giveBack"
                                    render={(text, record) => (
                                        <span>
                                             <Button onClick={() =>{
                                                 this.openGiveBackModal(record)
                                             }}>归还</Button>
                                        </span>)}/>
                            <Column title="操作" dataIndex="action" key="action"
                                    render={(text, record) => (
                                        <span>
                                            <Button
                                                type="primary"
                                                onClick={()=>{
                                                    this.updateCustomer(record)
                                                }}
                                                style={{marginRight:20}}>修改用户</Button>
                                        </span> )}/>
                        </Table>
                    </div>
                </div>

                <AddCustomer
                    getCustomerList={this.getCustomerList}
                    addModalVisible={addModalVisible}
                    CloseModalVisible={this.CloseModalVisible}></AddCustomer>

                <UpdateCustomer
                    getCustomerList={this.getCustomerList}
                    updateModalVisible={updateModalVisible}
                    CloseModalVisible={this.CloseModalVisible}
                    initCustomerData={this.state.initCustomerData}></UpdateCustomer>

                <Modal
                    width={900}
                    title="归还图书"
                    destroyOnClose={true}
                    footer={null}
                    visible={giveBackBookModalVisible}
                    onOk={this.CloseModalVisible}
                    onCancel={this.CloseModalVisible}>
                    <Card>
                        <p><UserOutlined />用户名：{this.state.initCustomerData.username}</p>
                    </Card>
                    <div className="site-card-wrapper">
                        <Row gutter={24}>
                           {this.state.borrow.map((item,index) => {
                                return (
                                    <Col span={12} key={index}>
                                        <Card key={index} title={item.bookName} bordered={true} style={{ width: 380 }}>
                                            <p>图书的借阅时间为4天</p>
                                            <p>借阅时间：{this.timeFunc(+item.bookBorrowTime)}</p>
                                            <p>当前时间：{this.timeFunc(new Date().getTime())}</p>
                                            <p>是否逾期：
                                                {(new Date().getTime()-(+item.bookBorrowTime)>86400000*3?"已逾期":"未逾期")}
                                            </p>
                                            <Button
                                                style={{marginRight:50}}
                                                type='primary'
                                                onClick={() =>{
                                                this.giveBackBook(index)
                                            }}>归还图书</Button>
                                            <Button type='primary' onClick={() =>{
                                                this.continueBorrowBook(index)
                                            }}>续租图书</Button>
                                        </Card>
                                    </Col>
                                )
                            })
                            }
                        </Row>
                    </div>
                </Modal>
            </div>
        )
    }
}
