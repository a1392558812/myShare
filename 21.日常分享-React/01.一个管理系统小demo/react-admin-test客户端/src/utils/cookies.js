import store from 'store'
export const saveUserInfo = (user) => {
    store.set("userinfo",user)
}
export const readUserInfo = () =>{
    const userinfo = store.get("userinfo")
    return userinfo ? userinfo : {}
}
export const deleteUserInfo = () => {
    store.remove("userinfo")
}