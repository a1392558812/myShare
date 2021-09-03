import React,{Component} from 'react'
import {Redirect} from 'react-router-dom'
import {Form,Input,Button,message} from 'antd';
import {UserOutlined, LockOutlined} from '@ant-design/icons';
import {requestLogin} from '../../ajax/index'

import './Login.less'
import cache from '../../utils/cache'
import {saveUserInfo} from '../../utils/cookies'

const RegExpUNObject = /^[A-Za-z]{1}[A-Za-z0-9_-]{3,15}$/
const RegExpPwdObject = /(?=^.{6,16}$)(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*]).*$/
export default class Login extends Component {
    onFinish = async (values) => {
        const {username,password} = values
        const result = await requestLogin(username,password)
        console.log(result)
        if (result.code===0) {
            cache.user = result.data
            saveUserInfo(result.data)
            this.props.history.push('/')
        } else {
            message.error("错误详情:"+result.message, 3)
        }
    }
    onFinishFailed = (values) => {
        message.error("请填写正确的信息", 3)
        console.log('校验失败', values);
    }
    checkPwd = (rule, value) =>{
        if (!value) {
            return Promise.reject('密码必须输入');
        }else if (RegExpPwdObject.test(value)) {
            return Promise.resolve();
        }else {
            return Promise.reject('密码组成为6-16位,至少有一个数字，一个大写字母，一个小写字母和一个特殊字符，');
        }
    }
    checkUsername = (rule, value) =>{
        if (!value) {
            return Promise.reject('账号必须输入');
        }else if (RegExpUNObject.test(value)) {
            return Promise.resolve();
        }else {
            return Promise.reject('账号必须是以字母开头，只能包含字母数字下划线和减号，4到16位');
        }
    }
    render() {
        const {username} = cache.user
        if (username) {
            return <Redirect to='/'/>
        }
        return(
            <div className='login-wrap'>
                <div className='login-header'>
                    <h1>后台管理系统</h1>
                </div>
                <div className='login-content'>
                    <h2>用户登录</h2>
                    <Form name="normal_login"
                          className="login-form"
                          initialValues={{ remember: true }}
                          onFinish={this.onFinish}
                          onFinishFailed={this.onFinishFailed}>
                        <Form.Item name="username"
                                    rules={[{validator:this.checkUsername}]}>
                            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="账号"/>
                        </Form.Item>
                        <Form.Item name="password" rules={[
                            {validator:this.checkPwd}
                            ]}>
                            <Input prefix={<LockOutlined className="site-form-item-icon" />} type="password" placeholder="密码"/>
                        </Form.Item>
                        <Form.Item name="confirmPassword" rules={[
                            ({ getFieldValue }) => ({
                                validator(rule, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject('俩次密码不相同');
                                },
                            }),]}>
                            <Input prefix={<LockOutlined className="site-form-item-icon" />} type="password" placeholder="确认密码"/>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="login-form-button">登录</Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        )
    }
}
