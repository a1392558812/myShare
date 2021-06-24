import React,{Component} from 'react'
import {Link,withRouter} from 'react-router-dom'
import {Menu,Layout} from 'antd';
import {readUserInfo} from '../../utils/cookies'
import {
    ApartmentOutlined,
    PieChartOutlined,
    UserSwitchOutlined,
    TeamOutlined,
    AppstoreAddOutlined,
    SettingFilled,
    TableOutlined,
    DatabaseOutlined,
} from '@ant-design/icons';

import {menuArr} from './SetMenu/SetMenu'
import cache from "../../utils/cache"

import './LayoutSider.less'

const {Sider} = Layout;
const {SubMenu} = Menu;

class LayoutSider extends Component{
    selectElement = (icon) =>{
        switch (icon) {
            case 'PieChartOutlined':
                return  <PieChartOutlined/>
            case 'DatabaseOutlined':
                return  <DatabaseOutlined />
            case 'UserSwitchOutlined':
                return  <UserSwitchOutlined/>
            case 'TeamOutlined':
                return  <TeamOutlined/>
            case 'AppstoreAddOutlined':
                return  <AppstoreAddOutlined/>
            case 'SettingFilled':
                return  <SettingFilled/>
            case 'ApartmentOutlined':
                return  <ApartmentOutlined/>
            case 'TableOutlined':
                return  <TableOutlined/>
             default:
                return <UserSwitchOutlined/>
        }
    }
    createElement = (menuArr,pathname) =>{
        if (pathname==='/'){
            pathname = '/home'
        } else if (pathname.search('/product')===0) {
            pathname = '/product'
        } else if (pathname.search('/managecustomer')===0) {
            pathname = '/managecustomer'
        }
        return menuArr.map(menu =>{
                /* 无子项菜单 */
                if (!menu.child) {
                    if (this.userinfo.username==='admin001' || this.willShowMenus[menu.path]) {
                        if (menu.path === pathname) {
                            this.key= menu.key
                        }
                        return (
                            <Menu.Item key={menu.key}>
                                <Link to={menu.path}>
                                    {this.selectElement(menu.icon)}
                                    <span>{menu.title}</span>
                                </Link>
                            </Menu.Item>
                        )
                    }
                } else {
                     /* 有子项菜单 */
                    const child = menu.child.find(child =>{
                        if (child.path === pathname) {
                          console.log(pathname)
                            if (pathname==='/product') {
                                this.key= child.key
                                console.log(pathname,this.key)
                                return  child
                            }
                            this.key= menu.key
                            return  child
                        }
                    })
                    /* 如果当前父级选中，打开 */
                    if (child) {
                        this.openKey = menu.key
                    }
                    /*  此个子菜单是否显示 */
                    let flag
                    if (this.userinfo.username === 'admin001') {
                        flag = true
                    } else {
                        flag = menu.child.find((item) =>{
                          console.log(item)
                            if (this.willShowMenus[item.path]){
                                console.log(item.path)
                                return true
                            }
                        })
                    }
                    console.log(flag)
                    return (
                        flag? <SubMenu key={menu.key} title={
                             <span>{this.selectElement(menu.icon)}
                                 <span>{menu.title}</span>
                                 </span>}>
                            {
                                menu.child.map(m =>{
                                    if (this.willShowMenus[m.path] || this.userinfo.username === 'admin001') {
                                        return(
                                            <Menu.Item key={m.key}>
                                                <Link to={m.path}>
                                                    {this.selectElement(m.icon)}
                                                    <span>{m.title}</span>
                                                </Link>
                                            </Menu.Item>
                                        )
                                    }
                                })
                            }
                        </SubMenu> : null
                    )
                }
        })
    }
    async UNSAFE_componentWillMount () {
        this.willShowMenus = {}
        const {pathname} = this.props.location
        console.log(pathname)
        cache.nowPath = pathname
        const userinfo = readUserInfo()
        this.userinfo = userinfo
        /* 所拥有额权限列表 */
        userinfo.role.menus.forEach((item) =>{
            this.willShowMenus[item] = item
        })
        console.log(this.willShowMenus,this.userinfo)
        this.ElementNode = this.createElement(menuArr,pathname)
    }
    render(){
        const {pathname} = this.props.location
        cache.nowPath = pathname
        return(
          <Sider className='LayoutSider'>
              <Link to='/' className='LayoutSider-header'>
                  <h2>图书后台</h2>
                  <h2>管理系统</h2>
              </Link>
              <Menu defaultSelectedKeys={[this.key]}
                    defaultOpenKeys={[this.openKey]}
                    mode="inline"
                    theme="dark">
                  {this.ElementNode}
              </Menu>
           </Sider>
        )
    }
}
export default withRouter(LayoutSider)