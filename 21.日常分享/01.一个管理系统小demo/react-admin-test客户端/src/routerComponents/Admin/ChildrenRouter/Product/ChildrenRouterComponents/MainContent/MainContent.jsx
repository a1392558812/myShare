import React,{Component} from 'react'
import {Card,Select,Button,Input,Table,Form,Spin,message} from 'antd'
import {PlusCircleOutlined} from '@ant-design/icons';

import './MainContent.less'
import {
    requestProductsList,
    requestProductsListAsName,
    requestProductsListAsDesc,
    requestUpdateCode} from '../../../../../../ajax/index'
const {Option} = Select
const { Search } = Input
const {Column} = Table;
export default class MainContent extends Component{
    formRef = React.createRef();
    state = {
        page:1,
        initChangePageNum:true,
        searchContent:'',
        nowSelect:'searchAsName',
        ifLoading:true,
        nowAjaxArr:[],
        nowList:[],
        total:1,
    }
    componentDidMount() {
        const pageNum = 1
        const pageSize = 3
        this.getProductsList({pageNum,pageSize})
        this.setState({
            ifLoading:false,
        })
    }
    getProductsList = async ({pageNum,pageSize}) =>{
        this.formRef.current.resetFields();
        await this.setState({
            ifLoading:true,
        })
        const result = await requestProductsList({pageNum,pageSize}) // 初始化获取页码
        console.log(result)
        if (result.code === 0 ) {
            result.data.list.map((item,index)=>{
                item.key = index
            })
            await this.setState({
                ifLoading:false,
                nowAjaxArr: result.data,
                total:result.data.total,
                nowList:result.data.list
            })
        }else {
            message.error("请求失败了，请刷新重试")
        }
    }
    getProductsListAsName = async ({pageNum,pageSize,productName}) =>{
        this.formRef.current.resetFields();
        await this.setState({
            ifLoading:true,
        })
        const result = await requestProductsListAsName({pageNum,pageSize,productName})
        if (result.code ===0 ) {
            result.data.list.map((item,index)=>{
                item.key = index
            })
            await this.setState({
                nowAjaxArr: result.data,
                total:result.data.total,
                nowList:result.data.list,
                ifLoading:false,
            })
        } else{
            message.error("请求出错了，~~~~(>_<)~~~~，请刷新")
        }
    }
    getProductsListAsDesc = async ({pageNum,pageSize,productDesc}) => {
        this.formRef.current.resetFields();
        await this.setState({
            ifLoading:true,
        })
        const result = await requestProductsListAsDesc({pageNum,pageSize,productDesc})
        if (result.code === 0 ) {
            result.data.list.map((item,index)=>{
                item.key = index
            })
            await this.setState({
                nowAjaxArr: result.data,
                total:result.data.total,
                nowList:result.data.list,
                ifLoading:false,
            })
        } else{
            message.error("请求出错了，~~~~(>_<)~~~~，请刷新")
        }
    }
    updateCode = async (record) => {
        const productId = record._id
        const status = record.status === 1 ? 2 : 1
        console.log(productId,status)
        console.log(record)
        const result = await requestUpdateCode({productId,status})
        if (result.code ===0 ) {
            message.success(`更新${record.name}商品成功`)
            const pageNum = this.state.page
            const pageSize = 3
            await this.setState({
                page:pageNum
            })
            if (this.state.initChangePageNum) {
                this.getProductsList({pageNum,pageSize})
            } else {
                if (this.state.nowSelect==='searchAsName') {
                    const productName = this.state.searchContent
                    this.getProductsListAsName({pageNum,pageSize,productName})
                } else {
                    const productDesc = this.state.searchContent
                    this.getProductsListAsDesc({pageNum,pageSize,productDesc})
                }
            }
        } else{
            message.error("更新失败，请刷新重试")
        }
    }
    selectedChange = async (value) =>{
        await this.setState({
            nowSelect:value,
        })
        console.log("selected-->",this.state.nowSelect)
    }
    selectInput = async (rule, value) =>{ // 添加分类的输入框监听
        console.log("添加分类的输入框监听",value)
        if (value) {
            await this.setState({
                searchContent:value
            })
            return Promise.reject();
        }
        return Promise.reject();
    }
    inputSearch = async (value) =>{
        await this.setState({
            searchContent:value,
        })
        if (this.state.searchContent){
            await this.setState({
                initChangePageNum:false,
                page:1,
            })
            console.log("点击搜索的值:",value,"---","将要搜索的值:",this.state.searchContent,"---","所选中的值",this.state.nowSelect)
            if (this.state.nowSelect === 'searchAsName') {
                const pageNum = 1
                const pageSize = 3
                const productName = this.state.searchContent
                this.getProductsListAsName({pageNum,pageSize,productName})
            }
            if (this.state.nowSelect==='searchAsContent'){
                const pageNum = 1
                const pageSize = 3
                const productDesc = this.state.searchContent
                this.getProductsListAsDesc({pageNum,pageSize,productDesc})
            }
        } else {
            message.error("请输入搜索内容")
        }
    }
    pageNumChange = async (page, pagesize) =>{
        const pageNum = page
        const pageSize = pagesize
        await this.setState({
            page:page
        })
        if (this.state.initChangePageNum) {
            this.getProductsList({pageNum,pageSize})
            console.log("发送了初始翻页的请求",page, pagesize)
        } else {
            if (this.state.nowSelect==='searchAsName') {
                console.log("发送了点击搜名称翻页的请求",page, pagesize)
                const productName = this.state.searchContent
                this.getProductsListAsName({pageNum,pageSize,productName})
            } else {
                console.log("发送了点击搜描述翻页的请求",page, pagesize)
                const productDesc = this.state.searchContent
                this.getProductsListAsDesc({pageNum,pageSize,productDesc})
            }
        }
        console.log(page, pagesize)
    }
    gotoDetail = (text, record, index) =>{
        console.log(text, record, index)
        this.props.history.push('/product/detail',{record, index})
    }
    gotoRevise = () => {
        this.props.history.push("/product/addupdate")
    }
    gotoUpdateRevise = (text, record, index) => {
        this.props.history.push("/product/addupdate",{record, index})
    }
    render(){
        console.log('重新渲染了')
        const {nowList} = this.state
        return(
            <div className='MainContent'>
                <div className='MainContent-header'>
                    <div className='MainContent-header-select'>
                        <Select defaultValue="searchAsName"
                                value = {this.state.nowSelect}
                                style={{ width: 180,marginRight: 10 }}
                                onChange={this.selectedChange}>
                            <Option value="searchAsName">按照名称搜索</Option>
                            <Option value="searchAsContent">按照内容搜索</Option>
                        </Select>
                        <Form
                            name="searchAddselect"
                            ref={this.formRef}
                            initialValues={{ "addCategoryItem": "" }}>
                            <Form.Item
                                name="searchAddselectItem"
                                rules={[{validator:this.selectInput}]}>
                                <Search
                                    placeholder="请输入需要搜索的内容"
                                    onSearch={(value) =>{this.inputSearch(value)} }
                                    style={{ width: 200 }}
                                />
                            </Form.Item>
                        </Form>
                    </div>
                    <div className='MainContent-header-add'>
                        <Button type='primary' onClick={this.gotoRevise}>
                            <PlusCircleOutlined/>
                            <span>添加商品</span>
                        </Button>
                    </div>
                </div>
                <div className='MainContent-line'></div>
                <div className='MainContent-main'>
                    <Card>
                        <Spin spinning={this.state.ifLoading}>
                            <Table dataSource={nowList}
                                    bordered={true}
                                     pagination={{
                                        defaultCurrent:1,
                                        current:(function () {
                                            return this.state.page
                                        }).bind(this)(),
                                        total:(function () {
                                            return this.state.total
                                        }).bind(this)(),
                                        onChange:this.pageNumChange,
                                        defaultPageSize:3,
                                        showQuickJumper:true,}}>
                                <Column title="名称" dataIndex="name" key="name" />
                                <Column title="描述" dataIndex="desc" key="desc" />
                                <Column title="价格(￥)" dataIndex="price" key="price" />
                                <Column title="状态" dataIndex="code" key="code"
                                         render={(text, record) => (
                                    <span>
                                        <Button type="primary" style={{marginBottom:20}} onClick={(function () {
                                            this.updateCode(record)
                                        }).bind(this)}>{record.status===1?"下架":"上架"}</Button><br/>
                                        <span>{record.status===1?"正在租借":"已经租尽"}</span>
                                    </span>
                                )}/>
                                <Column title="操作"
                                        dataIndex="action"
                                        key="action"
                                        render={(text, record, index) => (
                                            <span>
                                                 <Button type="primary" style={{marginBottom:20}} onClick={()=>{
                                                     this.gotoDetail(text, record, index)
                                                 }}>详情</Button><br/>
                                                 <Button type="primary" onClick={()=> {
                                                     this.gotoUpdateRevise(text, record, index)
                                                 }}>修改</Button>
                                            </span>
                                        )}/>
                            </Table>
                        </Spin>
                    </Card>

                </div>
            </div>
        )
    }
}
