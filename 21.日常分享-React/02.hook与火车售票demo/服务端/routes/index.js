var express = require('express');
var router = express.Router();
const dayjs = require('dayjs')
const fs = require('fs')
const path = require('path')

/* GET home page. */
router.get('/getcitydata', function(req, res) {
  fs.readFile(path.join(__dirname, 'MockData/cities.json'),'utf-8',(err,data) =>{
    if(err){
      res.send({code:1,data:{message:'请求错误'}})
    }else{
      res.send({code:0,data:JSON.parse(data.toString())})
    }
  })
});
router.get('/getsearchdata',(req,res) =>{
  const { searchKey } = req.query;
  return res.send({
    code:0,
    data:{
        dataArr:[
          {key: '芜湖',display: '芜湖'},
          {key: '井冈山',display: '井冈山',},
          {key: '铁岭',display: '铁岭',}
        ],
        keyWord:searchKey,
      }
  });
})
router.get('/query',(req,res) =>{
  const response = require(path.join(__dirname, 'MockData/query.json'));
  response.dataMap.directTrainInfo.trains = response.dataMap.directTrainInfo.trains.reverse();
  res.send({code:0,data:response})
})
router.get('/ticket',(req,res) =>{
  const { data } = req.query;
  if(data){
    res.send({code:0,data:{
        detail: {
          departTimeStr: '07:15',
          arriveTimeStr: '11:47',
          arriveDate: dayjs(data).valueOf(),
          durationStr: '4小时32分'
        },
        candidates: [{
          type: '二等座',
          priceMsg: '443.5',
          ticketsLeft: '有票',
          channels: [{
            name: '快速预订',
            desc: '含40元出行保障 快速出票 迅捷无忧'
          }, {
            name: '普通预订',
            desc: '出票较慢，高峰期需要排队'
          }]
        }, {
          type: '一等座',
          priceMsg: '748.5',
          ticketsLeft: '有票',
          channels: [{
            name: '快速预订',
            desc: '含40元出行保障 快速出票 迅捷无忧'
          }, {
            name: '普通预订',
            desc: '出票较慢，高峰期需要排队'
          }]
        }, {
          type: '商务座',
          priceMsg: '1403.5',
          ticketsLeft: '5张',
          channels: [{
            name: '快速预订',
            desc: '含40元出行保障 快速出票 迅捷无忧'
          }, {
            name: '普通预订',
            desc: '出票较慢，高峰期需要排队'
          }]
        }]
      }})
  }else{
    res.send({code:1,data:{message:'服务器出错了'}})
  }


})
router.get('/schedule',(req,res) =>{
  res.send({code:0,data:[{
      station: '北京南',
      arriveTime: null,
      departTime: '07:20',
      stay: null,
    }, {
      station: '天津南',
      arriveTime: '07:54',
      departTime: '07:56',
      stay: 2,
    }, {
      station: '南京南',
      arriveTime: '11:51',
      departTime: '11:53',
      stay: 2,
    }, {
      station: '上海虹桥',
      arriveTime: '13:08',
      departTime: null,
      stay: null,
    }]})


})
router.get('/order',(req,res) =>{
  const { date } = req.query;
  res.send({code:0,data:{
      departTimeStr: '07:15',
      arriveTimeStr: '11:47',
      arriveDate: dayjs(date).valueOf(),
      durationStr: '4小时32分',
      price: 483.5,
    }})
})

module.exports = router;
