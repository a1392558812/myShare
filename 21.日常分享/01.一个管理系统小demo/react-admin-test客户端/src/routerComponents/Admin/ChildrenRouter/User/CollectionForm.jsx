import React,{Component} from 'react'
import {Form,Input,Select} from 'antd'
import PropTypes from 'prop-types'


const RegExpUNObject = /^[A-Za-z]{1}[A-Za-z0-9_-]{3,15}$/
const RegExpPwdObject = /(?=^.{6,16}$)(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*]).*$/
const RegExpEmailObject = /^[a-z0-9]{1}[a-z0-9_-]{1,}@[a-z0-9]{1,}(\.[a-z]{2,})*\.[a-z]{2,}$/
const RegExpPhoneObject = /^1[3456789]\d{9}$/
const {Option} = Select
export default class CollectionForm extends Component{
    FormRef = React.createRef();
    static propTypes = {
       FormDate: PropTypes.func.isRequired,
       roleArr: PropTypes.array.isRequired,
       nowClickUserInfo: PropTypes.object
    }
    componentWillMount () {
        this.props.FormDate(this.FormRef)
    }
    CheckUserName = async (rule, value) => {
        if (!value) {
            return Promise.reject('账号必须输入');
        }else if (RegExpUNObject.test(value)) {
            return Promise.resolve();
        }else {
            return Promise.reject('账号必须是以字母开头，只能包含字母数字下划线和减号，4到16位');
        }
    }
    CheckUserPassWord = (rule, value) =>{
        if (!value) {
            return Promise.reject('密码必须输入');
        }else if (RegExpPwdObject.test(value)) {
            return Promise.resolve();
        }else {
            return Promise.reject('密码组成为6-16位,至少有一个数字，一个大写字母，一个小写字母和一个特殊字符，');
        }
    }
    CheckUserPhone = (rule, value) =>{
        if (!value) {
            return Promise.reject('手机号必须输入');
        }else if (RegExpPhoneObject.test(value)) {
            return Promise.resolve();
        }else {
            return Promise.reject('手机号格式不正确');
        }
    }
    CheckUserRole = (rule, value) =>{
        if (value) {
            return Promise.resolve();
        }
        return Promise.reject('必须设置角色');
    }
    CheckUserEmail = (rule, value) =>{
        if (!value) {
            return Promise.reject('邮箱号必须输入');
        }else if (RegExpEmailObject.test(value)) {
            return Promise.resolve();
        }else {
            return Promise.reject('邮箱格式不正确');
        }
    }
    roleChange = (value) =>{
        console.log(value)
    }
    render(){
        const {username,email,phone,role_id} = this.props.nowClickUserInfo
        return(
            <Form
                ref={this.FormRef}
                labelAlign={'left'}
                name="User"
                initialValues={{
                    remember: true,
                    ['username']: username,
                    ['email']: email,
                    ['phone']: phone,
                    ['role']: role_id,
                }}>
                <Form.Item
                    label="账号"
                    name="username"
                    rules={[{validator:this.CheckUserName}]}>
                    <Input placeholder="账号"/>
                </Form.Item>

                {this.props.nowClickUserInfo.password ? null :
                    <Form.Item
                        label="密码"
                        name="password"
                        rules={[{validator:this.CheckUserPassWord}]}>
                        <Input.Password  placeholder="密码"/>
                </Form.Item>}

                <Form.Item
                    label="邮箱"
                    name="email"
                    rules={[{validator:this.CheckUserEmail}]}>
                    <Input  placeholder="邮箱"/>
                </Form.Item>

                <Form.Item
                    label="手机号"
                    name="phone"
                    rules={[{validator:this.CheckUserPhone}]}>
                    <Input  placeholder="手机号"/>
                </Form.Item>

                <Form.Item
                    label="角色类型"
                    name="role"
                    rules={[{validator:this.CheckUserRole}]}>
                    <Select defaultValue={this.props.nowClickUserInfo.role_id} style={{ width: 120 }}  onChange={this.roleChange}>
                       {this.props.roleArr.map((item,index) =>{
                            return <Option value={item._id} key={index}>{item.name}</Option>
                        })}
                    </Select>
                </Form.Item>
            </Form>
        )
    }
}
