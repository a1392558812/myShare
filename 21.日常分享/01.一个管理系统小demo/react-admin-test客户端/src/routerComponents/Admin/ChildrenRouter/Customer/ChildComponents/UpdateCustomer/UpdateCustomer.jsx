import React,{Component} from 'react'
import { Modal, Button ,Form,Input,message,Card} from 'antd';
import PropTypes from 'prop-types'

import {requestCustomerUpdate} from "../../../../../../ajax";

export default class UpdateCustomer extends Component{
    FormRef = React.createRef();
    state = {
        ifShowPassword:false,
    }
    static propTypes = {
        initCustomerData:PropTypes.object.isRequired,
        updateModalVisible: PropTypes.bool.isRequired,
        CloseModalVisible: PropTypes.func.isRequired,
        getCustomerList:PropTypes.func.isRequired,
    }
    handleCancel = () =>{
        this.props.CloseModalVisible()
    }
    getCustomerUpdate = async ({_id,username,password,idCard,phone,email}) =>{
        const result = await requestCustomerUpdate({_id,username,password,idCard,phone,email})
        if (result.code ===0) {
            message.success("更新成功")
            const All = 'all'
            this.props.getCustomerList({All})

            this.props.CloseModalVisible()
        } else {
            message.error("更新失败")
        }
    }
    handleOk = () =>{
        this.FormRef.current.validateFields()
            .then(async (success)=>{
                const _id = this.props.initCustomerData._id
                if (this.state.ifShowPassword) {
                    const {username,password,idCard,phone,email} = success
                    this.getCustomerUpdate({_id,username,password,idCard,phone,email})
                    console.log(success,_id)
                } else{
                    const {username,idCard,phone,email} = success
                    this.getCustomerUpdate({_id,username,idCard,phone,email})
                    console.log(success,_id)
                }
            })
            .catch((error)=>{
                console.log(error)
            })
        this.props.CloseModalVisible()
    }
    changePassword = async () =>{
        const flag = !this.state.ifShowPassword
        await this.setState({
            ifShowPassword:flag,
        })
    }
    render(){
        const initCustomerData = this.props.initCustomerData
        const borrow = initCustomerData.borrow?initCustomerData.borrow : []
        console.log(initCustomerData,borrow)
        return(
            <div>
                <Modal
                    title="修改顾客"
                    destroyOnClose={true}
                    visible={this.props.updateModalVisible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}>

                    <Form
                        ref={this.FormRef}
                        labelAlign={'left'}
                        name="Customer"
                        initialValues={
                        {   remember: true,
                            ['username']: initCustomerData.username,
                            ['email']: initCustomerData.email,
                            ['phone']: initCustomerData.phone,
                            ['idCard']: initCustomerData.idCard,
                            ['password']:'123123'
                        }}>

                        <Form.Item
                            label="账号"
                            name="username"
                            rules={[{validator:this.CheckUserName}]}>
                            <Input placeholder="账号"/>
                        </Form.Item>

                        <Form.Item
                            style={{display:this.state.ifShowPassword?"flex":"none"}}
                            label="密码"
                            name="password"
                            rules={[{validator:this.CheckCustomerPassWord}]}>
                            <Input placeholder="密码"/>
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

                        <Button
                            type="primary"
                            style={{marginBottom:20}}
                            danger onClick={this.changePassword} >
                            是否修改密码
                        </Button>
                    </Form>
                </Modal>
            </div>
        )
    }
}
