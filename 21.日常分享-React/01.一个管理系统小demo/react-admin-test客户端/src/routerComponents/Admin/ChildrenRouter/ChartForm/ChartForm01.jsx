import React,{Component} from 'react'
import {Card,message,Modal,Input} from 'antd'
import {MoneyCollectOutlined} from '@ant-design/icons';
import {requestUserList,requestUpdateUserSalary} from '../../../../ajax/index'
import ReactEcharts from 'echarts-for-react';

import './ChartForm01.less'
export default class ChartForm01 extends Component{
    state = {
        roleId:[],
        rolesObj:{}, // role_id  :name
        idArr:[],
        nowSelect:{}, // 当前双击所选的项
        initXAxisData: [],// 初始xAxis数据
        initSeriesData:[],// 初始Series数据
        visible:false, //模态框关闭按钮
        inputValue:0
    }
    getRequestUpdateUserSalary =async ({_id,salary}) =>{
        const result = await requestUpdateUserSalary({_id,salary})
        if (result.code === 0) {
            message.success("更新成功")
            this.setState({
                visible: false,
                inputValue:0
            });
            this.getRequestUserList()
        }else {
            message.error("更新失败")
        }
    }
    componentDidMount() {
        this.getRequestUserList()
    }
    getRequestUserList = async () =>{
        const result = await requestUserList()
        if (result.code === 0) {
            const idArr = []
            const initXAxisData = []
            const initSeriesData = []
            console.log(result.data)
            let rolesObj = {}
            let roleId = []
            result.data.roles.forEach((role) =>{
                rolesObj[role._id] = role.name
            })
            result.data.users.forEach( user =>{
                roleId.push(user.role_id)
                idArr.push(user._id)
                initXAxisData.push(user.username)
                initSeriesData.push(user.salary)
            })
            this.setState({
                roleId,
                rolesObj,
                idArr,
                initXAxisData,
                initSeriesData
            })
        } else {
            message.error("请求出错了，请刷新重试")
        }
    }
    getOption = () =>{
        let option
        return option = {
            title: {
                text: '工资详情'
            },
            tooltip: {},
            xAxis: {
                type: 'category',
                data: this.state.initXAxisData
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: this.state.initSeriesData,
                type: 'bar',
                color:'skyblue',
                showBackground: true,
                backgroundStyle: {
                    color: 'rgba(251, 114, 153, 1)'
                }
            }]
        };
    }
    onEvents =()=> {
        return {
            'dblclick': (params) => {
                console.log(params,params.name,params.value)
                this.setState({
                    nowSelect:params,
                    visible:true
                })
           },
        }
    };
    handleOk = () => {
        const _id = this.state.idArr[this.state.nowSelect.dataIndex]
        const salary = this.state.inputValue
        if (salary<=0) {
            message.error("工资不能为0")
        }else{
            this.getRequestUpdateUserSalary({_id,salary})
            console.log(this.state.nowSelect,this.state.inputValue,_id)
        }
    };
    handleCancel = (e) => {
        console.log(e);
        this.setState({
            visible: false,
            inputValue:0
        });
    }
    valueChange = async (e) =>{
        console.log(e.target.value)
        if (e.target.value<0) {
            await this.setState({
                inputValue:0
            })
            message.error("工资不能为0")
        }else{
            await this.setState({
                inputValue:e.target.value
            })
        }
    }
    render(){
        const index = this.state.nowSelect.dataIndex
        const _id = this.state.roleId[index]
        const name = this.state.rolesObj[_id]
        return(
            <div className='ChartForm01'>
                <div className='ChartForm01-header-wrap'>
                    <div className='ChartForm01-header'>
                        <span>双击蓝色区域可以修改工资</span>
                    </div>
                </div>
                <Card title="柱状图" >
                    <ReactEcharts
                        option={this.getOption()}
                        onEvents={this.onEvents()}/>
                </Card>
                <Modal
                    title="修改工资"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                    <p>名称：{this.state.nowSelect.name}</p>
                    <p>职位：{name}</p>
                    <p>当前工资：{this.state.nowSelect.value}元</p>
                    <div className='Modal-flex'>
                        <span className='Modal-changeSalary'>修改工资：</span>
                        <Input
                            type='number'
                            value={this.state.inputValue}
                            onChange={this.valueChange}
                            addonAfter={<MoneyCollectOutlined/> }/>
                    </div>
                </Modal>
            </div>
        )
    }
}
