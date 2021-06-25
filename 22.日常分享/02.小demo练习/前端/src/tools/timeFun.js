export const timeFun = (timeNum) => {
  let dateStr = ''
  let timeStr = ''
  if (timeNum) {
    let time = new Date(timeNum)
    dateStr += time.getFullYear()+"年 "
    dateStr += time.getMonth()+1+"月"
    dateStr += time.getDate()+"日 "
    timeStr += time.getHours()+":"
    timeStr += time.getMinutes()+":"
    timeStr += time.getSeconds()
    return dateStr + " " + timeStr
  }
  return {dateStr:'时间格式出错了',timeStr:'时间格式出错了',}
}