export const usernameRegex = /^[A-Za-z]{1}[A-Za-z0-9_-]{3,15}$/
export const passwordRegex = /(?=^.{6,16}$)(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*]).*$/
export const emailRegex = /^[a-z0-9]{1}[a-z0-9_-]{1,}@[a-z0-9]{1,}(\.[a-z]{2,})*\.[a-z]{2,}$/
export const phoneRegex = /^1[345678]{1}\d{9}$/
export const checkNameFun = (value) =>{
  if(value === ''){
    return {valid:false,message:'请输入名称'}
  }else if(value.indexOf(' ') !== -1){ /* categoryRegex.test(value) */
    return {valid:false,message:'名称不能包含空格'}
  }else if(value.length<2||value.length>15){
    return {valid:false,message:'名称长度最小为2，最大为15'}
  }else {
    return {valid:true}
  }
}
export const checkInputValue = (value) =>{
  console.log('tag的Value',value)
  if(!value){
    return {valid:true,message:'请输入参数'}
  }else if(value.indexOf(' ') !== -1){
    return {valid:false,message:'参数不能包含空格'}
  }else if(value.length<4||value.length>20){
    return {valid:false,message:'参数长度最小为4，最大为20'}
  }else {
    return {valid:true}
  }
}

