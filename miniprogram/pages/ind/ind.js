//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    height: 360
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getSystemInfo({
      success: res => {
        this.setData({ height: res.windowHeight });
      }
    });
  },
  goShow: function (ev) {
    wx.navigateTo({
      url: '../show/show'
    });
  },
  goRecognition: function (ev) {
    wx.navigateTo({
      url: '../recognition/recognition'
    });
  },


  //事件处理函数


  onShow: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    }
  },

  onLoad: function () {
    if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    }

  }
})
