import React,{Component} from 'react'
import {Card,message} from 'antd'
import {requestUserList} from '../../../../ajax/index'
import ReactEcharts from 'echarts-for-react';

import './ChartForm01.less'
export default class ChartForm02 extends Component{
    state = {
        initXAxisData: [],// 初始xAxis数据
        initSeriesData:[]// 初始Series数据
    }
    componentDidMount() {
        this.getRequestAddUser()
    }
    getRequestAddUser = async () =>{
        const result = await requestUserList()
        if (result.code === 0) {
            const initXAxisData = []
            const initSeriesData = []
            result.data.users.forEach( user =>{
                initXAxisData.push(user.username)
                initSeriesData.push(user.salary)
            })
            this.setState({
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
                type: 'line',
                color:'skyblue',
                showBackground: true,
                backgroundStyle: {
                    color: 'rgba(251, 114, 153, 1)'
                }
            }]
        };
    }
    render(){
        return(
            <div className='ChartForm01'>
                <div className='ChartForm01-header-wrap'>
                    <div className='ChartForm01-header'>

                    </div>
                </div>
                <Card title="折线图" >
                    <ReactEcharts option={this.getOption()} />
                </Card>
            </div>
        )
    }
}
