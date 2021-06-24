import React,{Component} from 'react'
import {ArrowLeftOutlined,MoneyCollectOutlined,UploadOutlined } from '@ant-design/icons';
import {message,Form,Input,Cascader,Upload,Button} from 'antd'

import {
    requestCategoryList,
    requestRemoveImage,
    requestAddProduct,
    requestUpdateProduct
} from '../../../../../../ajax/index'
import RichTextEditor from './RichTextEditor/RichTextEditor'
import './Revise.less'

const {TextArea} = Input;
export default class Revise extends Component{
    formRef = React.createRef();
    state = {
        initDetail:'',
        RichTextEditor:"",
        initImages:[],
        fileList:[],
        options:[],
        transmitData:{}
    }
    constructor (props) {
        super(props)
        this.RichTextEditor = React.createRef()
    }
    async UNSAFE_componentWillMount () {
        const {state} = this.props.location
        if (state) {
            const {record, index} = state
            await this.setState({
                transmitData:record
            })
            console.log(record, index)
        }
    }
    async componentDidMount() {
        const result = await requestCategoryList('0')
        if (result.code ===0 ){
            let options = result.data
            console.log(options)
            options.map((item,index) => {
                item.label = item.name
                item.value = item._id
                item.isLeaf = false
                item.key = index
            })
            await this.setState({
                options
            })
            console.log(options)
        } else {
            message.error("请求出错了，请刷新重试")
        }
        await this.initGetChild()
        console.log("初始化的imageArr",this.state.initImages)
    }
    onChange = (value, selectedOption) => {
        console.log("onChange--->",value, selectedOption);
    };
    loadData = async (selectedOption) => {
        const targetOption = selectedOption[0]
        targetOption.loading = true;
        const grade  = targetOption._id
        console.log("loadData--->",targetOption,"---",grade)
        const result = await requestCategoryList(grade)
        if (result.code ===0 ) {
            targetOption.loading = false;
            if (result.data.length > 0) {
                let childOption = result.data
                childOption.map((item,index) =>{
                    item.label = item.name
                    item.value = item._id
                })
                targetOption.children = [...childOption]
            } else {
                targetOption.isLeaf=true
            }
            await this.setState({
                options:[...this.state.options]
            })
        } else {
            message.error("请求出错了，请刷新下试试")
        }
    }
    ReviseProductNameRequired = (rule,value) =>{
        if (value) {
            console.log(value)
            return Promise.resolve('777');
        }
        return Promise.reject('请输入名称');
    }
    ReviseProductDescRequired = (rule,value) =>{
        if (value) {
            console.log(value)
            return Promise.resolve('777');
        }
        return Promise.reject('请输入描述');
    }
    ReviseProductPriceRequired = (rule,value) => {
        if (value>0) {
            console.log(value)
            return Promise.resolve();
        } else {
            return Promise.reject('价格不能少于0元');
        }
        return Promise.reject('请输入价格');
    }
    ReviseProductCategoryRequired = (rule,value) => {
        if (value) {
            console.log(value)
            return Promise.resolve('777');
        }
        return Promise.reject('请选择种类');
    }
    ReviseProductInfo = async () => {
        const result = this.RichTextEditor.current.sendData()
        this.setState({
            RichTextEditor:result
        })
        console.log(result)
        return Promise.resolve( message.success('成功了'));
    }
    onFinish = async (value) => {
        const name = value.ReviseProductName
        const price = value.ReviseProductPrice
        const SelectArr =value.ReviseProductCategory
        const desc = value.ReviseProductDesc
        const detail = this.state.RichTextEditor
        const imgs = []
        this.state.fileList.map(imgObj =>{
            imgs.push(imgObj.name)
        })
        let pCategoryId
        let categoryId
        if (SelectArr.length===2) {
            pCategoryId = SelectArr[0]
            categoryId = SelectArr[1]
        } else {
            pCategoryId = '0'
            categoryId = SelectArr[0]
        }
        let result
        console.log(imgs)
        if (this.state.transmitData._id) {
            const _id = this.state.transmitData._id
            result = await this.UpdateProduct({_id,categoryId,pCategoryId,name,desc,price,detail,imgs})
        } else {
            result = await this.AddProduct({categoryId,pCategoryId,name,desc,price,detail,imgs})
        }
        if (result.code === 0 ){
            if (this.state.transmitData._id) {
                message.success("更新成功了");
            } else {
                message.success("添加成功了");
            }
            this.props.history.replace('http://localhost:3000/product')
        } else {
            return Promise.reject(message.error("失败了，请刷新重试"));
        }
    }
    UpdateProduct = async ({_id,categoryId,pCategoryId,name,desc,price,detail,imgs}) => {
        const result = await requestUpdateProduct({_id,categoryId,pCategoryId,name,desc,price,detail,imgs})
        return result
    }
    AddProduct = async ({categoryId,pCategoryId,name,desc,price,detail,imgs}) =>{
        const result = await requestAddProduct({categoryId,pCategoryId,name,desc,price,detail,imgs})
        return result
    }
    onFinishFailed = (errorInfo) => {
        console.log("提交失败请求",errorInfo)

        return Promise.resolve( message.error('请求失败，请确认是否有必填项未填写'));
    }
    gotoProduct = () => {
        this.props.history.goBack()
    }
    initGetChild = async () => {
        const {categoryId,pCategoryId,imgs,detail} = this.state.transmitData
        if (categoryId && pCategoryId) {
            if (pCategoryId !== '0') {
                const result = await requestCategoryList(pCategoryId)
                if (result.code ===0){
                    let childOption = result.data
                    childOption.map((item,index) =>{
                        item.label = item.name
                        item.value = item._id
                    })
                    const fatherOption = this.state.options.find(option=>{
                        return option.value === pCategoryId
                    })
                    fatherOption.children = childOption
                    await this.setState({
                        options:[...this.state.options]
                    })
                } else{
                    message.error("加载失败了")
                }
            }
        }
        if (imgs!== [] && imgs) {
            let imagesArr = []
            imgs.forEach((item,index) => {
                let imageObj = {}
                imageObj.uid = -index
                imageObj.name = imgs[index].toString()
                imageObj.status = 'done'
                imageObj.url = 'http://localhost:5000/upload/'+imgs[index].toString()
                imagesArr.push(imageObj)
            })
            await this.setState({
                initImages:imagesArr,
                fileList:imagesArr
            })
        } else {
            await this.setState({
                initImages:[],
                fileList:[]
            })
        }

    }
    beSureSelectArr = () => {
        console.log(this.state.transmitData)
        const {categoryId,pCategoryId} = this.state.transmitData
        let SelectedOptionValueArr = []
        if (categoryId && pCategoryId) {
            if (pCategoryId === '0') {
                SelectedOptionValueArr = [categoryId]
            } else {
                SelectedOptionValueArr = [pCategoryId,categoryId]
            }
        }
        return SelectedOptionValueArr
    }
    upLoadImages = async (filesObject) => {
        if (filesObject) {
            if (filesObject.file.status==='done') {
                console.log(filesObject)
                const {response} = filesObject.file
                if(response.status === 0){
                    const {name,url} = response.data
                    console.log(name,url)
                    filesObject.fileList[filesObject.fileList.length-1].name = name
                    filesObject.fileList[filesObject.fileList.length-1].url = url
                    message.success("上传成功")
                    console.log("上传成功",response)
                    this.setState({
                        initImages: [...filesObject.fileList],
                        fileList: [...filesObject.fileList]
                    })
                }
            } else if (filesObject.file.status==='removed') {
                const result = await requestRemoveImage (filesObject.file.name)
                if (result.code === 0) {
                    message.success("删除成功")
                    let newFileList = []
                    filesObject.fileList.forEach((item) => {
                        if (item.name !==filesObject.file.name) {
                            newFileList.push(item)
                        }
                    })
                    this.setState({
                        initImages: newFileList,
                        fileList: newFileList
                    })
                }
            }
            await this.setState({
                initImages: [...filesObject.fileList],
                fileList:  [...filesObject.fileList]
            })
            console.log(this.state.fileList)
        }
    }
    render(){
        const {detail} = this.state.transmitData
        console.log("渲染了emmm")
        return(
            <div className="Revise">
                <div className="Revise-header-wrap">
                    <div className="Revise-header">
                        <ArrowLeftOutlined
                            style={{marginRight:10,color:"#FB7299",cursor:"pointer"}}
                            onClick={this.gotoProduct}/>
                        {this.state.transmitData.name? <span>修改商品</span>:<span>添加商品</span>}
                    </div>
                </div>
                <div className='Revise-line-wrap'>
                    <div className='Revise-line'></div>
                </div>
                <div className='Revise-main' style={{paddingTop:60}}>
                    <Form
                        labelCol={{span: 3}}
                        wrapperCol={{ span: 9 }}
                        initialValues={
                            {   remember: true,
                                ['ReviseProductName']: this.state.transmitData.name,
                                ['ReviseProductDesc']: this.state.transmitData.desc,
                                ['ReviseProductPrice']: this.state.transmitData.price,
                                ['ReviseProductCategory']: this.beSureSelectArr(),
                                ['ReviseProductName']: this.state.transmitData.name,
                            }}
                        name="ReviseCategory"
                        onFinish={this.onFinish}
                        onFinishFailed = {this.onFinishFailed}
                        ref={this.formRef}>
                        <Form.Item
                            label="商品名称"
                            name="ReviseProductName"
                            rules={[{validator : this.ReviseProductNameRequired,required: true,}]}>
                            <Input  placeholder={"请输入"}/>
                        </Form.Item>
                        <Form.Item
                            label="商品描述"
                            name="ReviseProductDesc"
                            rules={[{validator:this.ReviseProductDescRequired,required: true,}]}>
                            <TextArea placeholder={"请输入"} rows={6}/>
                        </Form.Item>
                        <Form.Item
                            label="价格(￥)"
                            name="ReviseProductPrice"
                            rules={[{validator:this.ReviseProductPriceRequired,required: true,}]}>
                            <Input type='number'
                                    placeholder={"请输入"}
                                    addonAfter={<MoneyCollectOutlined/> }
                                   />
                        </Form.Item>
                        <Form.Item
                            label="商品分类"
                            name="ReviseProductCategory"
                            rules={[{validator:this.ReviseProductCategoryRequired,required: true,}]}>
                            <Cascader
                                placeholder={'ԅ(¯﹃¯ԅ)奥利给'}
                                options={this.state.options}
                                loadData={this.loadData}
                                onChange={this.onChange}
                                changeOnSelect
                            />
                        </Form.Item>
                        <Form.Item
                            label="商品图片"
                            name="ReviseProductImages">
                            <Upload
                                action={'/image/upload'}
                                accept={'image/*'}
                                onChange={this.upLoadImages}
                                name={'image'}
                                disabled={this.state.fileList.length>4 ? true : false}
                                onRemove
                                listType={'picture'}
                                fileList={this.state.fileList}>
                                {this.state.fileList.length>4 ? <span>最多可上传5张！！！</span> :<Button><UploadOutlined /> 请上传图片</Button>}
                            </Upload>
                        </Form.Item>
                        <Form.Item
                            label="商品详情"
                            name="ReviseProductInfo"
                            rules={[{validator : this.ReviseProductInfo}]}>
                            <RichTextEditor ref={this.RichTextEditor} initDetail={detail}></RichTextEditor>
                        </Form.Item>
                        <Button type='primary' htmlType="submit" style={{marginLeft:120}}>提交上传</Button>
                    </Form>
                </div>
            </div>
        )
    }
}
