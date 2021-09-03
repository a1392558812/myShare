import { formatFun } from '../index/DepartureDate/handelData'

export const initQueryState = {
  searchParsed:false, // 是否完成解析地址栏参数from，to，departTime，ifHighSpeed
  from:'',// 始发站
  to:'', // 终点站
  departTime:formatFun(), // 出发日期
  ifHighSpeed:false, // 是否选择了高铁
  trainList:[],// 火车列表
  orderType: 1, // 1表示出发早到晚，2表示耗时短到长
  onlyWatchHadTickets:false, // 只看有票
  ticketsTypesArr:[],// 所有的备选项
  checkedTicketsTypes:{}, // 选中的备选项
  trainTypesArr:[] ,// 车次类型
  checkedTrainTypes:{}, // 选中的车次类型
  startStations:[], // 出发车站
  checkedStartStations:{},// 选中的出发车站
  endStations:[], // 到达车站
  checkedEndStations:{},// 选中的到达车站
  earliestStartTime:0, // 最早出发时间
  latestStartTime:24, // 最晚出发时间
  earliestEndTime:0, // 最早到达时间
  latestEndTime:24, // 最晚到达时间
  ifOpenCompScrModel:false, //综合筛选浮层的打开与隐藏
}
export const initState = {
  from:'北京', // 始发站
  to:'老八的饭店', // 终点站
  ifOpenCityModal:false,  // 是否打开选择城市的模态框浮层
  nowSelectedCityLeft:false,  // 当打开选择城市的模态框浮层，选中城市后填到from还是to
  cityData:{}, // 相关的城市数据，异步加载
  ifLoadingCityData:false, // 是否正在加载城市数据
  ifOpenDateModal:false, // 是否打开日期的模态框
  ifSelectedHighSpeed:false, // 是否选择的高铁
  departTime:Date.now()
}
export const initTicketState = {
  departDate:Date.now(), // 出发日期
  arriveDate:Date.now(), // 到达日期
  departTimeStr:'0', // 出发时间
  arriveTimeStr:'0', // 到达时间
  departStation:'', // 出发车站
  arriveStation:'', // 到达车站
  trainNumber:'', //车次
  durationStr:'0', // 运行时间
  tickets:[], // 座次与出票渠道
  isScheduleVisible:false, // 时刻表的浮层显示
  ifSearchParsed:false, //是否完成解析URL
}
export const initOrderDate = {
  trainNumber:0, // 车次
  departStation: '',// 出发车站
  arriveStation: '', // 到达车站
  seatType:'', // 座次类型
  departDate: Date.now() ,// 出发日期
  arriveDate: Date.now() ,// 到达日期
  departTimeStr:'', // 出发时间的字符串
  arriveTimeStr:'',// 到达时间的字符串
  durationStr: '', //行程时间
  price:0, // 票价
  passengers:[],//乘客信息
  menu:{}, // 弹出菜单
  isMenuVisible:false, // 菜单是否可见
  searchParsed: false, // url解析参数是否解析完成
}