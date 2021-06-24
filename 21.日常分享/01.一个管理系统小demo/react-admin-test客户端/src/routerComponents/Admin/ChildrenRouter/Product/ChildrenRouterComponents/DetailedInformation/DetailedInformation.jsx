import React,{Component} from 'react'
import {message} from 'antd'
import {ArrowLeftOutlined,ArrowRightOutlined} from '@ant-design/icons';

import {requestOnlyOneProduct} from '../../../../../../ajax/index'
import './DetailedInformation.less'

export default class DetailedInformation extends Component{
    state = {
        fatherProductName:'',
        childProductName:''
    }
    async componentDidMount() {
        const {record} = this.props.location.state
        const {categoryId,pCategoryId} = record
        if (pCategoryId==='0') {
            const result = await this.getCategory(categoryId)
            console.log(result)
            await this.setState({
                fatherProductName:result.name
           })
        }else{
            const fatherResult = await this.getCategory(pCategoryId)
            const childrResult = await this.getCategory(categoryId)
            console.log(fatherResult,childrResult)
            await this.setState({
                fatherProductName:fatherResult.name,
                childProductName:childrResult.name,
            })
        }
    }
    getCategory = async (categoryId) => {
        const result = await requestOnlyOneProduct(categoryId)
        if (result.code ===0 ) {
            console.log(result.data)
            return result.data
        }else {
            message.error("请求错误了，请刷新重试")
        }
    }
    createMarkup = (detail) => {
        return {__html: detail};
    }
    MyComponent = (detail) => {
        return <div dangerouslySetInnerHTML={this.createMarkup(detail)} />;
    }
    backTo = () => {
        this.props.history.goBack()
    }
    render(){
        const url = "http://localhost:5000/upload/"
        const {record, index} = this.props.location.state
        return(
            <div className='DetailedInformation'>
                <div className='DetailedInformation-wrap'>
                    <div className='DetailedInformation-header'>
                        <div className='DetailedInformation-header-title'>
                            <ArrowLeftOutlined
                                style={{marginRight:10,color:"#FB7299",cursor:"pointer"}}
                                onClick={this.backTo} />
                            <span>商品详情</span>
                        </div>
                    </div>
                    <div className='DetailedInformation-line'></div>
                    <div className='DetailedInformation-main'>
                        <div className='DetailedInformation-item DetailedInformation-name'>
                            <div className='DetailedInformation-name-title DetailedInformation-item-title'>商品名称：</div>
                            <div className='DetailedInformation-name-content'>{record.name}</div>
                        </div>
                        <div className='DetailedInformation-item DetailedInformation-desc'>
                            <div className='etailedInformation-desc-title DetailedInformation-item-title'>商品描述：</div>
                            <div className='etailedInformation-desc-content'>{record.desc}</div>
                        </div>
                        <div className='DetailedInformation-item DetailedInformation-price'>
                            <div className='DetailedInformation-price-title DetailedInformation-item-title'>商品价格：</div>
                            <div className='DetailedInformation-price-content'>￥{record.price}</div>
                        </div>
                        <div className='DetailedInformation-item DetailedInformation-category'>
                            <div className='DetailedInformation-category-title DetailedInformation-item-title'>所属分类：</div>
                            <div className='DetailedInformation-category-content'>
                                {this.state.fatherProductName}
                                {this.state.childProductName?<ArrowRightOutlined/>:null}
                                {this.state.childProductName?this.state.childProductName:null}
                            </div>
                        </div>
                        <div className='DetailedInformation-item DetailedInformation-img'>
                            <div className='DetailedInformation-img-title DetailedInformation-item-title'>商品图片：</div>
                            <div className='DetailedInformation-img-content'>
                                {record.imgs.map((img,index) => {
                                    return <img src={url+img} key={index} alt="图片" style={{width:150,height:150,marginRight:10}}/>
                                })}
                            </div>
                        </div>
                        <div className='DetailedInformation-item DetailedInformation-Info'>
                            <div className='DetailedInformation-Info-title DetailedInformation-item-title'>商品详情：</div>
                            <div className='DetailedInformation-Info-content'>{this.MyComponent(record.detail)}</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
