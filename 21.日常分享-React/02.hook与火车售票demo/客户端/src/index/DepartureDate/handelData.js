export const formatFun = (timeStr=Date.now()) =>{
  const target = new Date(timeStr)
  target.setHours(0)
  target.setMinutes(0)
  target.setSeconds(0)
  target.setMilliseconds(0)
  return target.getTime()
}
export const  getWeek = (date) => {
  console.log(date)
  var week;
  if(date.getDay() === 0) week = "星期日"
  if(date.getDay() === 1) week = "星期一"
  if(date.getDay() === 2) week = "星期二"
  if(date.getDay() === 3) week = "星期三"
  if(date.getDay() === 4) week = "星期四"
  if(date.getDay() === 5) week = "星期五"
  if(date.getDay() === 6) week = "星期六"
  return week;
}