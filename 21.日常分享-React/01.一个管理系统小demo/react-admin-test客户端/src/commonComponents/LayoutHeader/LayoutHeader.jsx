import React,{Component} from 'react'
import {CaretDownOutlined,ExclamationCircleOutlined} from '@ant-design/icons';
import {Popover,Button,Modal, message} from 'antd';
import {withRouter} from 'react-router-dom'

import './LayoutHeader.less'
import {menuArr} from '../LayoutSider/SetMenu/SetMenu'
import {getWeather} from '../../ajax/index'
import cache from '../../utils/cache'
import {deleteUserInfo} from '../../utils/cookies'
const {confirm} = Modal;

const url = 'https://www.tianqiapi.com/api'
const data = {
    version: "v6",
    appid: 16172681,
    appsecret: "ZCv9zWbM"}
const timer = () =>{
    let dateStr = ''
    let timeStr = ''
    dateStr += new Date().getFullYear()+"年"
    dateStr += new Date().getMonth()+1+"月"
    dateStr += new Date().getDate()+"日"
    timeStr += new Date().getHours()+":"
    timeStr += new Date().getMinutes()+":"
    timeStr += new Date().getSeconds()
    return {timeStr,dateStr}
}
const getHeaderTitle = (menuArray,nowPath) =>{
    let title
    menuArray.forEach(menu =>{
        if (!menu.child) {
            if (menu.path===nowPath) {
                title =  menu.title
            }else if (menu.path==='/managecustomer' && nowPath.search('/managecustomer')=== 0) {
                title =  menu.title
            }
        }
        else if (menu.child) {
            menu.child.forEach(item => {
                if (item.path===nowPath) {
                    title = item.title
                }else if (nowPath.search(item.path)===0) {
                    title = item.title
                }
            })
        }
    })
    return title
}
class LayoutHeader extends Component{
    state = {
        nowTime:timer(),
        weather:'',
        city:"",
        air_tips:"",
        update_time:"",
    }
    componentWillUnmount(){
        clearInterval(this.updateTime)
    }
    async componentDidMount() {
        const weather = await getWeather(url,data)
        this.updateTime = setInterval(() =>{
            this.setState({
                nowTime:timer(),
            })
        },1000)
        this.setState({
            weather: weather.wea,
            city:weather.city,
            air_tips:weather.air_tips,
            update_time:weather.update_time,
        })
    }
    showConfirm = () => {
        const the = this
        confirm({
            title: '确定要退出登录么？',
            icon: <ExclamationCircleOutlined />,
            content: '退出登录后将无法再继续使用页面，确定要退出么',
            onOk(){
                deleteUserInfo()
                cache.user = {}
                the.props.history.replace('/')
                message.warning('已退出登录')
            },
            onCancel() {
                console.log('取消');
            },
        });
    }
    render(){
        const {nowTime,weather,city,air_tips,update_time} = this.state
        const {user,nowPath} = cache
        return(
            <div className='LayoutHeader'>
                <div className='LayoutHeader-top'>
                    <div className='LayoutHeader-top-content'>
                        <div className='LayoutHeader-top-content-desc'>你好,{user.username}</div>
                        <div className='LayoutHeader-top-content-desc LayoutHeader-top-content-logout'>
                            <Button type="primary" onClick={this.showConfirm}>退出登录</Button>
                        </div>
                    </div>
                </div>
                <div className='LayoutHeader-line'></div>
                <div className='LayoutHeader-bottom'>
                    <div className='LayoutHeader-bottom-title'>{getHeaderTitle(menuArr,nowPath)}</div>
                    <div className='LayoutHeader-bottom-content'>
                        <div className='LayoutHeader-bottom-content-time' style={{marginRight:20}}>{nowTime.dateStr}  {nowTime.timeStr}</div>
                        <div className='LayoutHeader-bottom-content-weather'>
                            <Popover content={(
                                <div>
                                    <p>城市：{city}</p>
                                    <p>天气建议：{air_tips}</p>
                                    <p>更新时间：{update_time}</p>
                                 </div>
                            )} title="天气详情">
                                <Button>{weather}</Button>
                            </Popover>
                        </div>
                    </div>
                </div>
                <div className='LayoutHeader-triangle'>
                    <CaretDownOutlined />
                </div>
            </div>
        )
    }
}
export default withRouter(LayoutHeader)


