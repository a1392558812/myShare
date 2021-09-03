// pages/detail/detail.js
const datas = require('../../datas/list-data.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detailObject: {},
    index:null,
    ifCollection: false,
    ifMusic: false,
  },
  handleShare(){ // 点击分享
    wx.showActionSheet({
      itemList:['分享到朋友圈','分享到QQ空间','分享到微博',]
    })
  },
  musicPlay() {
    // 处理音乐播放
    this.setData({
      ifMusic: !this.data.ifMusic
    })
    if (this.data.ifMusic){ // 播放音乐
      const {dataUrl,title} = this.data.detailObject.music
      wx.playBackgroundAudio({
        dataUrl,
        title,
      })
    } else {
      wx.pauseBackgroundAudio()
    }
    

  },
  toggleShow () {
    this.setData({
      ifCollection: !this.data.ifCollection
    })
    const title = this.data.ifCollection ? '奥利给成功' : 'Giao失败'
    // 提示用户收藏成功
    wx.showToast({
      title,
      icon: 'success'
    })
    // 缓存数据到本地
    wx.getStorage({
      key: 'ifCollection',
      success: (result) =>{
        console.log(result,'666')
        let targetObj = result.data
        targetObj[this.data.index] = this.data.ifCollection,
          wx.setStorage({
          key: 'ifCollection',
          data: targetObj,  
          success: () => {
            console.log('缓存成功')
          },
        })
      }
    })
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    const {index} = options
    const appDatas = getApp()
    this.setData({
      detailObject: datas.list_data[index],
      index
    })
    if (!wx.getStorageSync('ifCollection')) {
      wx.setStorageSync('ifCollection', {})
    }
    // 根据本地缓存的数据判断用户是否收藏文章
    if (wx.getStorageSync('ifCollection')[index]) {
      this.setData({
        ifCollection: true
      })
    }
    // 判断当前页面英语是否在播放
    if (appDatas.data.pageIndex===this.data.index && appDatas.data.isPlay) {
      this.setData({
        ifMusic: true,
      })
    }
    // 监听音乐🎵暂停
    wx.onBackgroundAudioPause(() =>{
      console.log('音乐🎵暂停')
      this.setData({
        ifMusic:false
      })
      appDatas.data.isPlay = false
      appDatas.data.pageIndex = this.data.index
    })
    // 监听音乐🎵播放
    wx.onBackgroundAudioPlay(() => {
      console.log('音乐🎵播放')
      this.setData({
        ifMusic: true
      })
      appDatas.data.isPlay = true
      appDatas.data.pageIndex = this.data.index
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})