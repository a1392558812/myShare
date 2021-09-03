import ajax from './ajax'
import axios from 'axios'
import {message} from 'antd';

const BASEURL = ''
// 登录
export const requestLogin = (username,password) =>ajax(`${BASEURL}/login`,{username,password},'POST')
// 获取分类列表
export const requestCategoryList = (grade) =>ajax(`${BASEURL}/category/list`,{grade})
// 获取种类列表
export const requestAddCategoryList = ({categoryName,grade}) =>ajax(`${BASEURL}/category/add`,{categoryName,grade},"POST")
// 更新种类列表
export const requestCategoryListUpdate = ({categoryId,categoryName}) =>ajax(`${BASEURL}/category/update`,{categoryId,categoryName},"POST")
// 删除一个二级分类列表
export const requestCategoryRemove = ({categoryId}) => ajax(`${BASEURL}/category/delete`,{categoryId},"POST")
// 获取商品分页
export const requestProductsList = ({pageNum,pageSize}) =>ajax(`${BASEURL}/product/list`,{pageNum,pageSize})
// 根据商品名称获取分页
export const requestProductsListAsName = ({pageNum,pageSize,productName}) =>ajax(`${BASEURL}/product/search`,{pageNum,pageSize,productName})
// 根据商品描述获取分页
export const requestProductsListAsDesc = ({pageNum,pageSize,productDesc}) =>ajax(`${BASEURL}/product/search`,{pageNum,pageSize,productDesc})
// 根据分类ID获取分类
export const requestOnlyOneProduct = (categoryId) =>ajax(`${BASEURL}/category/info`,{categoryId})
// 更新某商品状态
export const requestUpdateCode = ({productId,status}) =>ajax(`${BASEURL}/product/updateStatus`,{productId,status},'POST')
// 删除图片
export const requestRemoveImage = (name) =>ajax(`${BASEURL}/image/delete`,{name},'POST')
// 添加商品
export const requestAddProduct = ({categoryId,pCategoryId,name,desc,price,detail,imgs}) =>ajax(`${BASEURL}/product/add`,{categoryId,pCategoryId,name,desc,price,detail,imgs},'POST')
// 更新商品
export const requestUpdateProduct = ({_id,categoryId,pCategoryId,name,desc,price,detail,imgs}) =>ajax(`${BASEURL}/product/update`,{_id,categoryId,pCategoryId,name,desc,price,detail,imgs},'POST')
// 获取角色列表
export const requestRoleList = () =>ajax(`${BASEURL}/role/list`)
// 添加角色
export const requestRoleAdd = (roleName) =>ajax(`${BASEURL}/role/add`,{roleName},'POST')
// 跟新角色
export const requestUpdateRole = ({_id,menus,auth_time,auth_name}) =>ajax(`${BASEURL}/role/update`,{_id,menus,auth_time,auth_name},'POST')
// 删除角色
export const deleteRole = ({_id}) =>ajax(`${BASEURL}/role/delete`,{_id},'POST')
// 添加用户
export const requestAddUser = ({username,password,phone,email,role_id}) =>ajax(`${BASEURL}/user/add`,{username,password,phone,email,role_id},"POST")
// 获取用户列表
export const requestUserList = () => ajax(`${BASEURL}/user/list`)
// 删除用户
export const requestRemoveUser = (userId) => ajax(`${BASEURL}/user/delete`,{userId},'POST')
// 更新用户
export const requestUpdateUser = ({_id,username,phone,email,role_id}) => ajax(`${BASEURL}/user/update`,{_id,username,phone,email,role_id},'POST')
// 更新用户工资
export const requestUpdateUserSalary = ({_id,salary}) =>ajax(`${BASEURL}/user/update`,{_id,salary},'POST')
// 获取顾客列表
export const requestCustomerList = ({status,All,username,}) =>ajax(`${BASEURL}/customer/list`,{status,All,username,},'GET')
// 添加顾客
export const requestAddCustomer = ({username,password,idCard,phone,email}) =>ajax(`${BASEURL}/customer/add`,{username,password,idCard,phone,email},'POST')
// 删除顾客
export const requestRemoveCustomer = (customerId) =>ajax(`${BASEURL}/customer/delete`,{customerId},'POST')
// 根据ID获取图书
export const requestProductsListAsCategoryId = ({pageNum,pageSize,categoryId}) => ajax(`${BASEURL}/product/search`,{pageNum,pageSize,categoryId})
// 跟新顾客租借状态
export const requestCustomerUpdateBorrow = ({_id,username,borrow}) => ajax(`${BASEURL}/customer/update`,{_id,username,borrow},'POST')
// 拉黑顾客
export const requestCustomerBlack = ({username,_id,status}) =>ajax(`${BASEURL}/customer/update`,{username,_id,status},'POST')
// 更新顾客信息
export const requestCustomerUpdate = ({_id,username,password,idCard,phone,email}) =>ajax(`${BASEURL}/customer/update`,{_id,username,password,idCard,phone,email},'POST')

/*
const xxx = async ({_id,username,borrow}) =>{
    const result = await requestCustomerUpdateBorrow({_id,username,borrow})
}
const _id = "5e7e2b6b931ca320c49400b8"
const username = 'customers0005'
let borrow = [
    {bookName: "西游记第一集详情01", bookId: "5e762da6384f6f0de4c27b47", bookCategoryId: "5e6e31ce53b55d1934449460", bookBorrowTime: 1544975057961},
    {bookName: "测试图书856", bookId: "5e7cb527241610189ce220dc", bookCategoryId: "5e6e31ce53b55d1934449460", bookBorrowTime: 1544975057961},
    {bookName: "西游记第一集详情01", bookId: "5e762da6384f6f0de4c27b47", bookCategoryId: "5e6e31ce53b55d1934449460", bookBorrowTime: 1544975057961},
    {bookName: "测试图书856", bookId: "5e7cb527241610189ce220dc", bookCategoryId: "5e6e31ce53b55d1934449460", bookBorrowTime: 1544975057961},
]
xxx({_id,username,borrow})
*/




export const requestwe = (url,data={})=>{
    return new Promise(function (resolve,reject) {
        let promise
        let paramStr = ""
        Object.keys(data).forEach(key => {
            paramStr+=key + "=" +data[key]+ "&"
        })
        if (paramStr) {
            paramStr = paramStr.substring(0,paramStr.length-1)
        }
        url = url + "?" + paramStr
        promise = axios.get(url)
        promise
            .then(function (response) {
                if (response.status === 200) {
                    resolve(response.data)
                } else {
                    message.error("天气获取失败了，请刷新重试")
                }
            })
            .catch(function () {
                message.error("啊哦！！！网络出错了，天气获取不到，请刷新重试")
            })
    })
}
export const getWeather = async (url,data) =>{
    return  await requestwe(url,data)
}


