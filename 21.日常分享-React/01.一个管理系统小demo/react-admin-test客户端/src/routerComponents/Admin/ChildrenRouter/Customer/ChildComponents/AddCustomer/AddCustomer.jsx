import React,{Component} from 'react'
import { Modal,Form,Input,message} from 'antd';
import PropTypes from 'prop-types'

import {requestAddCustomer} from '../../../../../../ajax/index'

const RegExpUNObject = /^[A-Za-z]{1}[A-Za-z0-9_-]{3,15}$/
const RegExpEmailObject = /^[a-z0-9]{1}[a-z0-9_-]{1,}@[a-z0-9]{1,}(\.[a-z]{2,})*\.[a-z]{2,}$/
const RegExpPhoneObject = /^1[3456789]\d{9}$/
const RegExpIdCardObject1 = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/
const RegExpIdCardObject2 = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{4}$/
export default class AddCustomer extends Component{
    FormRef = React.createRef();
    static propTypes = {
        addModalVisible: PropTypes.bool.isRequired,
        CloseModalVisible: PropTypes.func.isRequired,
        getCustomerList:PropTypes.func.isRequired,
    }
    handleOk = () =>{
        this.FormRef.current.validateFields()
            .then(async (success)=>{
                const {username,password,phone,email,idCard} = success
                const result = await requestAddCustomer({username,password,idCard,phone,email})
                if(result.code === 0){
                    message.success('添加成功')
                    this.props.CloseModalVisible()
                    const All = 'all'
                    this.props.getCustomerList({All})
                } else {
                    message.error('添加失败')
                }
            })
            .catch((error)=>{
                console.log(error)
            })

    }
    handleCancel = () =>{
        this.FormRef.current.resetFields()
        this.props.CloseModalVisible()
    }
    CheckUserName = (rule, value) =>{ // 账号验证
        if (!value) {
            return Promise.reject('账号必须输入');
        }else if (RegExpUNObject.test(value)) {
            return Promise.resolve();
        }else {
            return Promise.reject('账号必须是以字母开头，只能包含字母数字下划线和减号，4到16位');
        }
    }
    CheckCustomerPassWord = (rule, value) =>{// 密码验证
        if (!value) {
            return Promise.reject('密码必须输入');
        }else {
            return Promise.resolve();
        }
    }
    CheckCustomerEmail = (rule, value) =>{ // 邮箱验证
        if (!value) {
            return Promise.reject('邮箱必须输入');
        }else if (RegExpEmailObject.test(value)) {
            return Promise.resolve();
        }else {
            return Promise.reject('邮箱格式不正确');
        }
    }
    CheckCustomerPhone = (rule, value) =>{ // 手机号验证
        if (!value) {
            return Promise.reject('手机号必须输入');
        }else if (RegExpPhoneObject.test(value)) {
            return Promise.resolve();
        }else {
            return Promise.reject('手机号格式不正确');
        }
    }
    CheckCustomerIdCard = (rule, value) =>{ // 身份证验证
        if (!value) {
            return Promise.reject('身份证必须输入');
        }else if (RegExpIdCardObject1.test(value)||RegExpIdCardObject2.test(value)) {
            return Promise.resolve();
        }else {
            return Promise.reject('身份证格式不正确');
        }
    }
    render(){
        return(
            <div>
                <Modal
                    title="添加顾客"
                    visible={this.props.addModalVisible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}>

                    <Form
                        ref={this.FormRef}
                        labelAlign={'left'}
                        name="Customer">

                        <Form.Item
                            label="账号"
                            name="username"
                            rules={[{validator:this.CheckUserName}]}>
                            <Input placeholder="账号"/>
                        </Form.Item>

                        <Form.Item
                            label="密码"
                            name="password"
                            rules={[{validator:this.CheckCustomerPassWord}]}>
                            <Input.Password  placeholder="密码"/>
                        </Form.Item>

                        <Form.Item
                            label="邮箱"
                            name="email"
                            rules={[{validator:this.CheckCustomerEmail}]}>
                            <Input  placeholder="邮箱"/>
                        </Form.Item>

                        <Form.Item
                            label="手机号"
                            name="phone"
                            rules={[{validator:this.CheckCustomerPhone}]}>
                            <Input  placeholder="手机号"/>
                        </Form.Item>

                        <Form.Item
                            label="身份证号码"
                            name= 'idCard'
                            rules={[{validator:this.CheckCustomerIdCard}]}>
                            <Input  placeholder="身份证号码"/>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        )
    }
}
