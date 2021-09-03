import React,{Component} from 'react'
import {Card,message} from 'antd'
import {requestUserList} from '../../../../ajax/index'
import ReactEcharts from 'echarts-for-react';

import './ChartForm03.less'

export default class ChartForm03 extends Component{
    state = {
        initData:[]// 初始数据
    }
    componentDidMount() {
        this.getRequestAddUser()
    }
    getRequestAddUser = async () =>{
        const result = await requestUserList()
        if (result.code === 0) {
            const initData = []
            result.data.users.forEach( user =>{
                initData.push({
                    value:user.salary,
                    name:user.username,
                })
            })
            this.setState({
                initData
            })
        } else {
            message.error("请求出错了，请刷新重试")
        }
    }
    getOption = () =>{
        let option
        return option = {
            backgroundColor: '#2c343c',
            title: {
                text: '',
                left: 'center',
                top: 20,
                textStyle: {
                    color: '#ccc'
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b} : {c} ({d}%)'
            },

            visualMap: {
                show: false,
                min: 100,
                max: 1000,
                inRange: {
                    colorLightness: [0, 1]
                }
            },
            series: [
                {
                    name: '工资详情',
                    type: 'pie',
                    radius: '85%',
                    center: ['50%', '50%'],
                    data: this.state.initData.sort(function (a, b) { return a.value - b.value; }),
                    roseType: 'radius',
                    label: {
                        color: 'rgba(251, 144, 153, 1)'
                    },
                    labelLine: {
                        lineStyle: {
                            color: 'rgba(251, 144, 153, 1)'
                        },
                        smooth: 0.2,
                        length: 10,
                        length2: 20
                    },
                    itemStyle: {
                        color: '#c23531',
                        shadowBlur: 200,
                        shadowColor: 'rgba(251, 144, 153, 1)'
                    },

                    animationType: 'scale',
                    animationEasing: 'elasticOut',
                    animationDelay: function (idx) {
                        return Math.random() * 200;
                    }
                }
            ]
        };
    }

    render(){
        return(
            <div className='ChartForm03' style={{backgroundColor:'#2c343c'}}>
                <div className='ChartForm03-header-wrap'>
                    <div className='ChartForm03-header'>
                        <span style={{color:'#fff',marginRight:80,}}>饼图</span>
                        <span style={{color:'#fff'}}>工资预览占比</span>

                    </div>
                </div>
                <ReactEcharts option={this.getOption()} />
            </div>
        )
    }
}
