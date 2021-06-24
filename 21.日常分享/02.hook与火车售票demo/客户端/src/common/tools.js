export const objToUrl = (obj={}) =>{
  let paramStr = ""
  Object.keys(obj).forEach(key => {
    paramStr += key + "=" +obj[key]+ "&"
  })
  if (paramStr) {
    paramStr = "?" + paramStr.substring(0,paramStr.length-1)
  }
  return paramStr
}