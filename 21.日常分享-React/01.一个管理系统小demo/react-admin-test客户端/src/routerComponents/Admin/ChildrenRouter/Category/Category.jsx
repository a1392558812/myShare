import React, { Component } from 'react'
import { Button, Table, Spin, Modal, Form, Select, Input, message } from 'antd';
import { PlusSquareOutlined, RightSquareOutlined } from '@ant-design/icons';

import {
    requestCategoryList,
    requestCategoryListUpdate,
    requestAddCategoryList,
    requestCategoryRemove
} from '../../../../ajax/index'
import './category.less'

const { Column } = Table;
const { Option } = Select;
export default class Category extends Component {
    formRef = React.createRef();
    state = {
        nowSelectedId: '0',
        NowClickItem: {}, // 当前点击修改的（一级或者二级）项
        addInputName: '', // 添加分类的输入框项
        updateInputName: '', // 更新分类的输入框项
        addVisible: false, // 添加分类的模态框是否打开
        setVisible: false, // 更新分类的模态框是否打开
        loading: true,  //  是否在加载中
        ifChildrenShow: false, // 是否展示二级分类
        fatherArr: [],// 一级分类数据,
        childrenArr: [],//二级分类数据
        data: [],// 当前显示的数据
        categoryName: '',// 当前点击的一级列表名称
        categoryId: '',// 当前点击的一级列表id
    }
    componentDidMount() {
        this.setState({
            NowClickItem: {},
            addInputName: '',
            updateInputName: '',
            addVisible: false,
            setVisible: false,
        })
        this.getCategoryList()
    }
    getCategoryList = async () => {
        const result = await requestCategoryList("0")
        if (result.code === 0) {
            result.data.forEach((item, index) => {
                item.key = index
            })
            this.setState({
                data: result.data,
                fatherArr: result.data,
                loading: false,
                ifChildrenShow: false,
            })
        } else {
            message.error("~~~~(>_<)~~~~，请求失败了，请刷新重试")
        }
    }
    onChange = (pageNumber) => {
        console.log('Page: ', pageNumber);
    }
    getNextGradeCategorysArr = async (id) => {
        const result = await requestCategoryList(id)
        if (id !== "0" && id) {
            if (result.code === 0) {
                result.data.forEach((item, index) => {
                    item.key = index
                })
                console.log(id, result)
                this.setState({
                    data: result.data,
                    childrenArr: result.data,
                    ifChildrenShow: true,
                })
            } else {
                message.error("增加子项目失败了，请刷新重试")
            }
        } else {
            message.error("请输入要添加的项，亲（づ￣3￣）づ╭❤～")
        }

    }
    getCategoryRemove = async ({ categoryId }) => {
        const result = await requestCategoryRemove({ categoryId })
        if (result.code === 0) {
            message.success('删除分类成功')
            this.getCategoryList()
        } else if (result.code === 1) {
            message.error('网络出错了emmmm')
        } else if (result.code === 2) {
            message.error('当下分类下有图书，请修改当下图书分类')
        }
    }
    checkChildren = async (nowItem) => {
        await this.setState({
            nowSelectedId: nowItem._id,
            loading: true,
            categoryName: nowItem.name,
            categoryId: nowItem._id,
        })
        this.getNextGradeCategorysArr(this.state.categoryId)
        this.setState({
            loading: false,
        })
    }
    deleteChildren = async (nowItem) => {
        await this.setState({
            nowSelectedId: nowItem._id,
            loading: true,
            categoryName: nowItem.name,
            categoryId: nowItem._id,
        })
        const { categoryId } = this.state
        this.getCategoryRemove({ categoryId })
        console.log(this.state, "请求完毕")
        this.setState({
            loading: false,
        })
    }
    title = (ifChildrenShow) => {
        if (!ifChildrenShow) {
            return (<div className='category-header-list-static'><span>一级列表项</span></div>)
        } else {
            return (
                <div className='category-header-list-active'>
                    <Button type="primary" style={{ marginRight: 10, textAlign: "center" }} onClick={(function () {
                        this.setState({
                            data: this.state.fatherArr,
                            ifChildrenShow: false,
                        })
                    }).bind(this)}>一级列表项</Button>
                    <RightSquareOutlined />
                    <span>{this.state.categoryName}</span>
                </div>
            )
        }
    }
    addHandleOk = () => { // 添加分类按钮点击
        if (this.state.categoryId && this.state.ifChildrenShow) {
            this.setState({
                nowSelectedId: this.state.categoryId
            })
        }
        this.setState({
            addVisible: true,
        })
        console.log("添加分类按钮点击")
    }
    updateNowItem = async (nowItem) => { // 修改分类的点击按钮
        console.log(nowItem)
        await this.setState({
            NowClickItem: nowItem,
            setVisible: true,
        })
        console.log("修改分类的点击按钮")
    }
    handleCancel = () => { // 点击取消
        this.formRef.current.resetFields();
        console.log("模态框的取消按钮点击了")
        this.setState({
            nowSelectedId: "0",
            addInputName: '',
            updateInputName: '',
            addVisible: false,
            setVisible: false,
        })
    }
    selectOption = async (value) => { // 添加分类的下拉框函数
        await this.setState({
            nowSelectedId: value
        })
    }
    addModalOk = async () => {
        const { nowSelectedId, addInputName } = this.state
        console.log("添加分类的确认按钮点击了", "--", this.state.categoryId, "--", nowSelectedId)
        const categoryName = addInputName
        const grade = nowSelectedId
        if (categoryName && grade) {
            const result = await requestAddCategoryList({ categoryName, grade })
            if (result.code === 0) {
                this.setState({
                    nowSelectedId: '0',
                    addVisible: false
                })
                this.formRef.current.resetFields();
                this.getCategoryList()
            } else {
                message.error("添加分类失败，请刷新重试")
            }
        } else {
            message.error("请正确填写添加项")
        }
    }
    updateModalOk = async () => {
        console.log("修改分类的确认按钮点击了")
        const { NowClickItem, updateInputName } = this.state
        console.log(NowClickItem, updateInputName)
        // 效验数据
        if (updateInputName.trim()) {
            // 发送请求
            const categoryName = updateInputName
            const categoryId = NowClickItem._id
            this.setState({
                loading: true,
            })
            const result = await requestCategoryListUpdate({ categoryId, categoryName })
            if (result.code === 0) {
                console.log(result)
                this.handleCancel()  // 关闭模态框
                this.getCategoryList()// 重新显示列表
            } else {
                message.error("请求更新失败了，请刷新重试")
            }
            this.setState({
                loading: false,
            })
        } else {
            message.error("请输入要修改的分类名称")
        }
    }
    updateInputName = async (rule, value) => { // 修改分类的输入框监听
        if (value) {
            await this.setState({
                updateInputName: value
            })
            console.log("updateInputName", value)
            return Promise.reject();
        }
        value = ""
        return Promise.reject();
    }
    addInputName = async (rule, value) => { // 添加分类的输入框监听
        if (value) {
            await this.setState({
                addInputName: value
            })
            console.log("addInputName", value)
            return Promise.reject();
        }
        return Promise.reject();
    }
    render() {
        const { data, loading, ifChildrenShow } = this.state
        return (
            <div className='category'>
                <div className='category-header'>
                    <div className='category-header-wrap'>
                        <div className='category-header-list'>
                            {this.title(ifChildrenShow)}
                        </div>
                        <div className='category-header-add'>
                            <Button type="primary" onClick={this.addHandleOk}><PlusSquareOutlined />点击添加</Button>
                        </div>
                    </div>
                </div>
                <div className='category-line-wrap'>
                    <div className='category-line'></div>
                </div>
                <div className='category-content'>
                    <Spin spinning={loading}>
                        <Table dataSource={data} bordered={true}
                            pagination={{
                                defaultPageSize: 7,
                                showQuickJumper: true,
                            }}>
                            <Column title="图书种类" dataIndex="name" key="name" />
                            <Column title="操作" key="action"
                            className='Column-of-render'
                                render={(nowItem) => (
                                    <span>
                                        <Button type="primary" style={{ marginRight: 16 }} onClick={() => { this.updateNowItem(nowItem) }}>修改分类</Button>
                                        {ifChildrenShow ? null : (<Button style={{ marginRight: 30 }} type="primary" onClick={(function () {
                                            this.checkChildren(nowItem)
                                        }).bind(this)}>查看当前项分类</Button>)}
                                        {!ifChildrenShow ? null : (<Button style={{ marginRight: 30 }} type="primary" onClick={(function () {
                                            this.deleteChildren(nowItem)
                                        }).bind(this)}>删除当前项分类</Button>)}
                                    </span>
                                )}
                            />
                        </Table>
                    </Spin>
                </div>
                <Modal
                    title="修改分类"
                    visible={this.state.setVisible}
                    onOk={this.updateModalOk}
                    onCancel={this.handleCancel}
                >
                    <p>修改分类</p>
                    <Form
                        ref={this.formRef}
                        name="updateCategory"
                        initialValues={{ "updateCategoryItem": "" }}
                        onFinish={this.handleCancel}
                    >
                        <Form.Item
                            name="updateCategoryItem"
                            rules={[{ validator: this.updateInputName }]}>
                            <Input placeholder={this.state.NowClickItem.name} />
                        </Form.Item>
                    </Form>
                </Modal>
                <Modal
                    title="添加分类"
                    placeholder='一级分类'
                    visible={this.state.addVisible}
                    onOk={this.addModalOk}
                    onCancel={this.handleCancel}
                >
                    <p>分类级别</p>
                    <Select defaultValue="0"
                        value={this.state.nowSelectedId}
                        onChange={this.selectOption}
                        className='selectIt'>
                        <Option value="0">一级分类列表</Option>
                        {this.state.fatherArr.map((category, index) => {
                            return <Option key={index + 1} value={category._id}>{category.name}</Option>
                        })}
                    </Select><br /><br /><br /><br />
                    <p>分类名称</p>
                    <Form
                        name="setCategory"
                        ref={this.formRef}
                        initialValues={{ "addCategoryItem": "" }}
                    >
                        <Form.Item
                            name="addCategoryItem"
                            rules={[{ validator: this.addInputName }]}>
                            <Input placeholder={"请输入"} />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        )
    }
}
