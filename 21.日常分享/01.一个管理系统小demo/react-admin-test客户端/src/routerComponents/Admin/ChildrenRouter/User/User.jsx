import React,{Component} from 'react'
import {Button,Table,Modal,message} from 'antd'
import {UserOutlined,ExclamationCircleOutlined } from '@ant-design/icons';

import {requestUserList,requestRemoveUser,requestAddUser,requestUpdateUser} from '../../../../ajax/index'
import CollectionForm from './CollectionForm'
import './User.less'

const { Column} = Table
const { confirm } = Modal;
export default class User extends Component{
    state = {
        roleObject:{},
        roleArr:[], // 权限列表
        addUserVisible: false,
        updateUsrVisible: false,
        nowClickUserInfo: {},
        data : []
    }
    componentDidMount() {
        this.getUserList()
    }
    showConfirm = (record) => {  // 删除功能按钮
        console.log(record)
        confirm({
            title: `你确定要删除${record.name}么？？？？`,
            icon: <ExclamationCircleOutlined />,
            content: '删除后将无法再恢复，请确认',
            onOk: async () => {
                console.log(record._id)
                const result = await requestRemoveUser(record._id)
                if (result.code ===0) {
                    console.log(result)
                    message.success('删除成功')
                    this.getUserList()
                } else {
                    message.error('删除失败')
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        });
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
            return {timeStr,dateStr}
        }
        return {dateStr:'时间格式出错了',timeStr:'时间格式出错了',}
    }
    getUserList = async () =>{
        const result = await requestUserList()
        if (result.code===0) {
            const data = result.data.users
            const roleArr = result.data.roles
            let roleObject = {}
            roleArr.forEach((role) =>{
                roleObject[role._id] = role.name
            })
            console.log(roleObject)
            data.map((item,index) =>{
                item.key = index
                const timeString = this.timeFunc(item.create_time)
                item.createTime = timeString.dateStr+'  '+timeString.timeStr
                item.name = item.username
                item.roleOfUsr = roleObject[item.role_id]
            })
            await this.setState({
                data,
                roleArr,
                roleObject
            })
        } else {
            message.error("请求失败了，检查下是否网络出错")
        }
    }
    handleCancel = async () => { // 模态框取消按钮
        this.FormRef.current.resetFields()
        await this.setState({
            addUserVisible: false,
            updateUsrVisible: false,
            removeUsrVisible: false,
            nowClickUserInfo: {},
        });
    }
    updateHandleOk = async () =>{ // 修改用户的模态框的确定按钮
        this.FormRef.current.validateFields()
            .then(async (success)=>{
                const {username,phone,email} = success
                const role_id = success.role
                const {_id} = this.state.nowClickUserInfo
                const result = await requestUpdateUser({_id,username,phone,email,role_id})
                if (result.code === 0) {
                    message.success("更新成功")
                    this.setState({
                        updateUsrVisible: false,
                    });
                    this.getUserList()
                    this.FormRef.current.resetFields()
                } else {
                    message.error('更新失败，请检查网络设置')
                }
            })
            .catch((error)=>{
                console.log(error)
            })
    }
    addHandleOk = async () => { // 模态框确定按钮
        this.FormRef.current.validateFields()
            .then(async (success)=>{
                const {username,password,phone,email} = success
                const role_id = success.role
                console.log(username,password,phone,email,role_id)
                const result = await requestAddUser({username,password,phone,email,role_id})
                if (result.code ===0) {
                    message.success('添加成功')
                    this.setState({
                        addUserVisible: false,
                    });
                    this.FormRef.current.resetFields()
                    this.getUserList()
                } else if(result.code ===1) {
                    message.error(`添加失败，${result.message}`)
                }
            })
            .catch((error)=>{
                console.log(error)
            })
    };
    updateUserModal = async (text, record) => { // 修改用户信息操作按钮
        await this.setState({
            updateUsrVisible: true,
            nowClickUserInfo:record
        })
        console.log(record,text,'点击了修改用户信息操作按钮')
    };
    addNewUserModel = async () =>{ // 添加用户操作按钮
        await this.setState({
            addUserVisible: true,
        })
    }
    render(){
        return(
            <div className='User-wrap'>
                <div className='User'>
                    <div className='User-header-wrap'>
                        <div className='User-header'>
                            <Button type='primary' onClick={this.addNewUserModel}>创建新的用户</Button>
                        </div>
                    </div>
                    <div className='User-line-wrap'>
                        <div className='User-line'></div>
                    </div>
                    <div className='User-main-wrap'>
                        <div className='User-main'>
                            <Table dataSource={this.state.data}
                                   pagination={{pageSize:8}}>
                                <Column title="用户名😼" dataIndex="name" key="name" render={(text, record) => (
                                    <span><UserOutlined />{"   "+record.name}</span>
                                )}/>
                                <Column title="邮箱📪" dataIndex="email" key="email" />
                                <Column title="电话☎" dataIndex="phone" key="phone" />
                                <Column title="注册时间👹" dataIndex="createTime" key="createTime" />
                                <Column title="角色分类👺" dataIndex="roleOfUsr" key="roleOfUsr" />
                                <Column title="权限操作👾" key="action"
                                    render={(text, record) => (
                                        <span>
                                          <Button onClick={()=>{
                                             this.updateUserModal(text, record)
                                          }} type='primary' style={{ marginRight: 16 }}>修改</Button>
                                          <Button onClick={()=>{
                                              this.showConfirm(text, record)
                                          }}>删除</Button>
                                        </span>
                                    )}/>
                            </Table>
                        </div>
                    </div>
                </div>
                <Modal
                    title='添加用户'
                    destroyOnClose={true}
                    visible={this.state.addUserVisible}
                    onOk={this.addHandleOk}
                    onCancel={this.handleCancel}>
                    <CollectionForm nowClickUserInfo={{}} roleArr={[...this.state.roleArr]} FormDate={(FormRef) =>{this.FormRef = FormRef} }/>
                </Modal>
                <Modal
                    title="修改用户"
                    destroyOnClose={true}
                    visible={this.state.updateUsrVisible}
                    onOk={this.updateHandleOk}
                    onCancel={this.handleCancel}>
                    <CollectionForm nowClickUserInfo={{...this.state.nowClickUserInfo}} roleArr={[...this.state.roleArr]} FormDate={(FormRef) =>{this.FormRef = FormRef} }/>
                </Modal>
            </div>
        )
    }
}
