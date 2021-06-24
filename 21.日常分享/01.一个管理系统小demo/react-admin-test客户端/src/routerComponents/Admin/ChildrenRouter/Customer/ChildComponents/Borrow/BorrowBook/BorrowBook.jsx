import React, { Component } from 'react'
import { message, Table, Button, Card } from 'antd'


import BeSelectCustomers from '../BeSelectCustomers'
import ErrorImage from './timg.jfif'
import {
    requestProductsListAsCategoryId,
    requestCustomerUpdateBorrow,
    requestCustomerList
} from '../../../../../../../ajax/index'
import './BorrowBook.less'

const { Column } = Table
const url = ""
export default class BorrowBook extends Component {
    state = {
        page: 1,
        total: 1,
        dataSource: [], // 图书列表
        record: {},
        Customer: {},
        data: [],
        ifOutTime: false
    }
    async componentWillMount() {
        const { record, Customer } = BeSelectCustomers.BeSelectCustomers
        if (record && Customer) {
            await this.setState({
                record,
                Customer
            })
            console.log(Customer, '666666666666')
            const nowTime = new Date().getTime()
            Customer.borrow.forEach(async (item, index) => {
                if ((nowTime - (+item.bookBorrowTime)) > 86400000 * 3) {
                    await this.setState({
                        ifOutTime: true
                    })
                }
            })
        } else {
            this.props.history.replace('/managecustomer')
        }
    }
    componentDidMount() {
        const pageNum = 1
        const pageSize = 3
        const categoryId = this.state.record._id
        console.log({ pageNum, pageSize, categoryId })
        this.getProductList({ pageNum, pageSize, categoryId })
    }
    getProductList = async ({ pageNum, pageSize, categoryId }) => {
        const result = await requestProductsListAsCategoryId({ pageNum, pageSize, categoryId })
        console.log(result)
        if (result.code === 0) {
            console.log(result)
            let dataSource = []
            result.data.list.forEach((item, index) => {
                item.key = index
                dataSource.push(item)
            })
            await this.setState({
                dataSource,
                total: result.data.total
            })
        } else {
            message.error("请求失败了，请刷新重试")
        }
    }
    borrowBook = (record) => {
        console.log(record)
        console.log(this.state.Customer.status)
        if (this.state.Customer.status === 0) {
            if (this.state.Customer.borrow.length < 4) {
                if (!this.state.ifOutTime) {
                    const bookName = record.name
                    const bookId = record._id
                    const bookCategoryId = record.categoryId
                    const bookBorrowTime = new Date().getTime()
                    const borrow = [...this.state.Customer.borrow, { bookName, bookId, bookCategoryId, bookBorrowTime }]
                    const { username, _id } = this.state.Customer
                    console.log(borrow, username, _id)
                    this.getUpdateCustomerBorrow({ borrow, username, _id })
                } else {
                    message.warning('该用户有未归还的图书，请先归还图书')
                }
            } else {
                message.warning('该用户已租借4本图书了，无法再租借')
            }
            console.log(record)
        } else {
            message.warning('该用户已被拉黑')
        }
    }
    getUpdateCustomerBorrow = async ({ _id, username, borrow }) => {
        const result = await requestCustomerUpdateBorrow({ _id, username, borrow })
        if (result.code === 0) {
            await this.setState({
                Customer: { ...result.data }
            })
            BeSelectCustomers.BeSelectCustomers.Customer = result.data
            message.success("租借成功")
        }
    }
    getCustomerList = async () => {
        const result = await requestCustomerList()
        if (result.code !== 0) {
            this.props.history.replace('/managecustomer')
        }
    }
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }
    backTo = () => {
        BeSelectCustomers.BeSelectCustomers = this.state.Customer
        this.props.history.goBack()
    }
    pageNumChange = async (page, pagesize) => {
        const pageNum = page
        const pageSize = pagesize
        await this.setState({
            page: page
        })
        const categoryId = this.state.record._id
        this.getProductList({ pageNum, pageSize, categoryId })
        console.log("发送了初始翻页的请求", page, pagesize)
        console.log(page, pagesize)
    }
    render() {
        console.log(this.state.dataSource, "????")
        return (
            <div className='BorrowBook'>
                <div className='BorrowBook-header-wrap'>
                    <div className='BorrowBook-header'>
                        <Button onClick={this.backTo}>返回</Button>
                    </div>
                </div>
                <Card className='BorrowBook-main'>
                    <Table
                        bordered={true}
                        dataSource={this.state.dataSource}
                        pagination={{
                            defaultCurrent: 1,
                            current: (function () {
                                return this.state.page
                            }).bind(this)(),
                            total: (function () {
                                return this.state.total
                            }).bind(this)(),
                            onChange: this.pageNumChange,
                            defaultPageSize: 3,
                            showQuickJumper: true,
                        }}>
                        <Column title="图书图片" dataIndex="image" width={200} key="image" render={
                            (text, record) => (
                                <img
                                    style={{ width: 150, height: 150 }}
                                    src={record.imgs[0] ? "http://localhost:5000/upload/" + record.imgs[0] : ErrorImage}
                                    alt={record.name} />
                            )
                        } />
                        <Column title="图书名称" dataIndex="name" key="name" width={100} />
                        <Column title="图书描述" dataIndex="desc" key="desc" />
                        <Column title="图书价格" dataIndex="price" key="price" width={50} />
                        <Column title="操作" dataIndex="action" key="action" render={(text, record) => (
                            record.status === 1 ?
                                <Button onClick={() => {
                                    this.borrowBook(record)
                                }}>租借</Button> : <Button>已下架</Button>
                        )} />
                    </Table>
                </Card>
            </div>
        )
    }
}
