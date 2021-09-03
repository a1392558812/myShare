import React,{Component} from 'react'
import {Button,Table,Modal,Input,message,TreeSelect,Card} from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {requestRoleList,requestRoleAdd,requestUpdateRole,deleteRole} from '../../../../ajax/index'
import {readUserInfo,deleteUserInfo} from '../../../../utils/cookies'
import './Role.less'
import {menuArr} from './SetMenu/SetMenu'
import cache from "../../../../utils/cache";

const { SHOW_PARENT } = TreeSelect;
const {Column} = Table;
const { confirm } = Modal;
export default class Role extends Component{
    state = {
        valueToPath:{},
        value: [], // 默认被选中的树状列表
        RootVisible:false, // 模态框开关
        treeData : [], // 树状列表初始值
        data : [], // 初始化显示的数据
        selectItem:{}, // 被选中的角色
        initItem:{},
        visible:false, // 创建角色的模态框是否可见
        inputContent:"" // 文本框中输入的内容
    }
    getDeleteRole = async ({_id}) =>{
        const result = await deleteRole({_id})
        console.log(result)
        if (result.code === 0) {
            message.success("删除角色成功")
            this.getRoleList()
        } else if (result.code === 2) {
            message.error("该角色下有管理员，请先删除管理员")
        } else if (result.code === 1) {
            message.error("删除失败")
        }
    }
    async componentWillMount () {
        const treeData = []
        let valueToPath = {}
        menuArr.forEach((item,index) =>{
            let toolObject = {}
            toolObject.path = item.path
            toolObject.title = item.title
            toolObject.value = '0-'+index
            toolObject.key = '0-'+index
            valueToPath['0-'+index] = item.path
            if(item.child) {
                let children=[]
                valueToPath['0-'+index] = []
                item.child.map((childItem,childIndex) =>{
                    let toolChildObject = {}
                    toolChildObject.path = childItem.path
                    toolChildObject.title = childItem.title
                    toolChildObject.value = '0-'+index+'-'+childIndex
                    valueToPath['0-'+index].push(childItem.path)
                    valueToPath['0-'+index+'-'+childIndex] = childItem.path
                    toolChildObject.key = '0-'+index+'-'+childIndex
                    children.push(toolChildObject)
                })
                toolObject.children = children
            }
            treeData.push(toolObject)
        })
        await this.setState({
            treeData,
            valueToPath
        })
    }
    componentDidMount() {
        this.getRoleList()
    }
    getRoleList = async () =>{
        let result = await requestRoleList()
        if (result.code === 0) {
            let data = []
            result.data.forEach((item,index) =>{
                let dataObj = {}
                dataObj.key = index+1
                dataObj.name = item.name // 名称
                const createTimeString = this.timeFunc(item.create_time)
                dataObj.createTime = createTimeString.dateStr+ ' '+ createTimeString.timeStr  // 创建时间
                const authTimeString = this.timeFunc(item.auth_time)
                dataObj.authorizeTime = authTimeString.dateStr+ ' '+ authTimeString.timeStr  // 授权时间
                dataObj.menus = item.menus// 所拥有的权限
                dataObj._id = item._id // id
                dataObj.authorizePeople = item.auth_name // 授权人
                data.push(dataObj)
            })
            await this.setState({
                data
            })
        }
    }
    beSureSelectItem = async (record) =>{ // 左键功能
        this.ajaxArr = []
        if (record.menus!==[]) {
            this.ajaxArr = record.menus
            let nowSelectValueArr = []
            record.menus.forEach((item) =>{
                this.state.treeData.forEach((data) =>{
                    if (data.path) {
                        if (item===data.path) {
                            nowSelectValueArr.push(data.value)
                        }
                    } else {
                        data.children.forEach((childData) =>{
                            if (item===childData.path) {
                                nowSelectValueArr.push(childData.value)
                            }
                        })
                    }
                })
            })
            await this.setState({
                value:nowSelectValueArr
            })
        }
        await this.setState({
            selectItem:record,
            initItem:record
        })
    }
    addRolehandleOk = async () =>{
        if (this.state.inputContent.trim() !== '') {
            const roleName = this.state.inputContent
            const result = await requestRoleAdd(roleName)
            if (result.code ===0 ) {
                message.success('添加成功')
                this.setState({
                    inputContent:'',
                    visible:false
                })
               this.getRoleList()
            }else {
                message.error('添加失败了o(╥﹏╥)o')
            }
        } else{
            message.error('请确认输入的内容不能为空')
        }
    }
    inputContent = async (e) =>{
        const {value} = e.target
        await this.setState({
            inputContent:value
        })
        console.log('inputContent',value)
    }
    RootRolehandleCancel = async () =>{
        this.ajaxArr = []
        const record = this.state.initItem
        if (record.menus!==[]) {
            this.ajaxArr = record.menus
            let nowSelectValueArr = []
            record.menus.forEach((item) =>{
                this.state.treeData.forEach((data) =>{
                    if (data.path) {
                        if (item===data.path) {
                            nowSelectValueArr.push(data.value)
                        }
                    } else {
                        data.children.forEach((childData) =>{
                            if (item===childData.path) {
                                nowSelectValueArr.push(childData.value)
                            }
                        })
                    }
                })
            })
            await this.setState({
                value:nowSelectValueArr
            })
        }
        await this.setState({
            selectItem:record,
            RootVisible:false,
        })
    }
    handleCancel = async (e) =>{
        await this.setState({

            inputContent:'',
            visible:false
        })
    }
    addRolePeople = () =>{
        this.setState({
            visible:true
        })
    }
    TreeSelectOnChange = (value) =>{
        this.ajaxArr = []
        value.forEach((item) =>{
            if (typeof this.state.valueToPath[item] === 'string') {
                this.ajaxArr.push(this.state.valueToPath[item])
            } else {
                this.ajaxArr = [...this.ajaxArr,...this.state.valueToPath[item]]
            }
        })
        console.log(this.ajaxArr)
        this.setState({value});
    }
    RootRolehandleOk = async () =>{ // 设置角色权限的模态框确定按钮
        const _id = this.state.selectItem._id
        const menus = this.ajaxArr
        const auth_time = ''
        const auth_name = readUserInfo().username
        const result = await requestUpdateRole({_id,menus,auth_time,auth_name})
        if (result.code ===0 ) {
            if (_id === readUserInfo().role_id) {
                message.info('当前权限发生变更，请重新登录');
                deleteUserInfo()
                cache.user = {}
                this.props.history.replace('/login')
            } else {
                message.success('更新成功了')
                this.getRoleList()
                await this.setState({
                    RootVisible:false,
                })
            }

        } else{
            message.error('更新失败55555')
        }
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
    RootRole = () =>{
        this.setState({
            RootVisible:true
        })
    }
    deleteRootRole = () =>{
        confirm({
            title: `你确定要删除（${this.state.selectItem.name}）角色么？`,
            icon: <ExclamationCircleOutlined />,
            content: '删除之后将无法再恢复',
            onOk:()=> {
                console.log(this.state.selectItem)
                const {_id} = this.state.selectItem
                this.getDeleteRole({_id})
            },
            onCancel() {
                console.log('奥利给');
            },
        });
    }
    render() {
        return (
            <div className='Role'>
                <div className='Role-wrap'>
                    <div className='Role-header-wrap'>
                        <div className='Role-header'>
                            <Button type='primary' onClick={this.addRolePeople} style={{marginRight: 15}}>创建♡新角色</Button>
                            <Button
                                type={this.state.selectItem.key ? 'primary' : ''}
                                style={{marginRight:20}}
                                onClick={this.RootRole}
                                disabled={this.state.selectItem.key ? false : true}>设置角色权限</Button>
                            <Button
                                type={this.state.selectItem.key ? 'primary' : ''}
                                onClick={this.deleteRootRole}
                                disabled={this.state.selectItem.key ? false : true}>删除角色</Button>
                        </div>
                    </div>
                    <div className='Role-line-wrap'>
                        <div className='Role-line'></div>
                    </div>
                    <div className='Role-main'>
                        <div>
                            <Table
                                onRow={(record) => {
                                    return {
                                        onClick: (function () { // 左键功能
                                            this.beSureSelectItem(record)
                                        }).bind(this),
                                        onContextMenu: (function () { // 右键功能
                                            console.log(record)
                                        }).bind(this),
                                    };
                                }}
                                rowSelection={{
                                    type: 'radio',
                                    selectedRowKeys:[this.state.selectItem.key]}}
                                dataSource={[...this.state.data]}
                                bordered={true}
                                pagination = {{defaultPageSize: 9}}>
                                <Column title="名称" dataIndex="name" key="name"/>
                                <Column title="创建时间" dataIndex="createTime" key="createTime"/>
                                <Column title="授权时间" dataIndex="authorizeTime" key="authorizeTime"/>
                                <Column title="何人授权" dataIndex="authorizePeople" key="authorizePeople"/>
                            </Table>
                        </div>
                    </div>
                </div>
                <Modal
                    title="创建ing"
                    okText={'确定'}
                    cancelText={'取消'}
                    visible={this.state.visible}
                    onOk={this.addRolehandleOk}
                    destroyOnClose={true}
                    onCancel={this.handleCancel}>
                    <Input addonBefore="创建的角色名称:" allowClear={true} onChange={this.inputContent}/>
                </Modal>
                <Modal
                    title="设置角色权限"
                    okText={'确定'}
                    cancelText={'取消'}
                    visible={this.state.RootVisible}
                    onOk={this.RootRolehandleOk}
                    destroyOnClose={true}
                    onCancel={this.RootRolehandleCancel}>
                    <Card title={`被授权角色名称： ${this.state.selectItem.name}`} bordered={false} style={{ width: 300 }}>
                        <TreeSelect
                            style={{width: 420}}
                            treeData={this.state.treeData}
                            value={this.state.value}
                            treeDefaultExpandAll={true}
                            size='large'
                            onChange={this.TreeSelectOnChange}
                            treeCheckable={true}
                            showCheckedStrategy={SHOW_PARENT}
                            placeholder={'请选择'}
                        ></TreeSelect>
                    </Card>
                </Modal>
            </div>
        )
    }
}
