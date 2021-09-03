// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    msg: '美食届里我老八',
    userInfo: {},
    ifShow: true,
  },
  goToNextPage () { // 点击跳转到list页面
    wx.switchTab({
      url:'/pages/list/list'
    })
  },
  /*  生命周期函数--监听页面加载 */
  onLoad: function (options) { // 执行一次
    // console.log('onLoad 页面加载完成',this)
    this.getUserInfo()
  },
  getUserInfo () {
    wx.getSetting({  // 判断用户是否授权
      success: (data) => {
        console.log('判断用户是否授权', data)
        if (data.authSetting['scope.userInfo']) { // 用户已经授权
          this.setData({
            ifShow: false,
          })
        } else { // 用户没有授权
          this.setData({
            ifShow: true,
          })
        }
      }
    }),
    wx.getUserInfo({ // 初始化工作，获取用户登录的信息
      success: (data) => { // 获取到用户信息
        // console.log(data)
        this.setData({ //更新data信息，对比react
          userInfo: data.userInfo
        })
      },
      fail: (data) => {
        console.log('获取用户信息失败', data)
      }
    })
  },
  callbackHandleUserInfo (data) {
    console.log("用户点击授权后的回调",data)
    // 判断用户点击的是否是允许
    if (data.detail.rawData) {
      // 当前用户点击的是允许，重新刷新此页面
      this.getUserInfo()
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { // 执行一次
    console.log('onReady 页面初次渲染完成')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () { // 可能执行不止一次
    console.log('onShowd 监听页面显示')
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('onHide 监听页面隐藏')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('onUnload 监听页面卸载')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log('onPullDownRefresh 监听用户下拉动作')
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('onReachBottom 页面上拉触底事件的处理函数')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log('onShareAppMessage 用户点击右上角分享')
  }
})