//index.js
// 引入腾讯地图SDK核心类
//var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
// 实例化API核心类
//var demo = new QQMapWX({
 // key: 'QOPBZ-H3PRD-NNH4S-PGYMU-XJUOT-3XF5W' // 必填
//});
const db = wx.cloud.database()
const _ = db.command
const app = getApp()
var page = undefined;
var doommList = [];
var i = 0;
//设置数组
class Doomm {
  constructor(text, top, time, color, avatarUrl) {
    this.text = text;
    this.top = top;
    this.time = time;
    this.color = color;
    this.avatarUrl = avatarUrl;
    this.display = true;
    let that = this;
    setTimeout(function() {
      doommList.splice(doommList.indexOf(that), 1);
      page.setData({
        doommData: doommList,
      })
    }, this.time * 10000)
  }
}
//随机颜色
function getRandomColor() {
  let rgb = []
  for (let i = 0; i < 3; ++i) {
    let color = Math.floor(Math.random() * 256).toString(16)
    color = color.length == 1 ? '0' + color : color
    rgb.push(color)
  }
  return '#' + rgb.join('')
}
Page({
  data: {
    doommData: [],
    usrdoommData: [],
    Interval: '',
    danmuinfo: '',
    senddisabled: true,
    placeholderinfo: '说点什么吧...',
    GotUserInfohidden: false, //设置登陆button隐藏
    //city: '', //用户所在城市
    //add: '', //用户地点,
    danmuzhi: '' //弹幕值
  },
  onLoad: function() {
    page = this;
    wx.showShareMenu({
      withShareTicket: true
    })
    //获取用户坐标
    /*
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        console.log(res)
        var latitude = res.latitude
        var longitude = res.longitude
        var speed = res.speed
        var accuracy = res.accuracy
        // 调用接口反编译地点信息
        demo.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function(res) {
            //console.log(res.result.ad_info.city);
            page.setData({
              add: res.result,
              city: res.result.ad_info.city
            })
          },
          fail: function(res) {
            console.log(res);
          },
          complete: function(res) {
            console.log(res);
          }
        });
      },
      fail: function(res) {
        console.log(res);
        wx.showToast({
          title: '请使用位置访问！',
          icon: 'loading',
          duration: 2000
        })
      },

    })
    */
    wx.cloud.callFunction({
      // 云函数名称
      name: 'login',
    }).then(res => {
      wx.setStorageSync("openid", res.result.openid)
    }).catch(console.error)

    //判断用户是否登陆
    if (wx.getStorageSync('GotUserInfo') == true) {
      page.setData({
        GotUserInfohidden: true
      })
    }
    db.collection('doommData').get().then(res => {
      // res.data 包含该记录的数据
      page.setData({
        danmu: res.data,
      })
      var arr = []
      var i = 0;
      //定时一个一个push弹幕信息
      page.data.Interval = setInterval(function() {
        if (i < page.data.danmu.length) {
          i++;
          arr.push(page.data.danmu[i])
          page.setData({
            doommData: arr,
          })
        } else {
          i = 0;
          db.collection('doommData').get().then(res => {
            // res.data 包含该记录的数据
            page.setData({
              danmu: res.data,
            })
          })
        }
      }, 1500)
    })
  },
  //发送弹幕祝福
  bindbt: function(e) {
    console.log(e.detail.value)
    //当input失去焦点则调用函数发送
    this.setData({
      danmuinfo: e.detail.value
    })
    if (0 < this.data.danmuinfo.length & this.data.danmuinfo.length <= 15) {
      this.setData({
        senddisabled: false
      })
      this.send();
    } else {
      this.setData({
        senddisabled: true
      })
      wx.showToast({
        title: '请输入15个字以内',
        icon: 'none',
        duration: 2000
      })
    }
  },
  send: function(e) {
    var that = this;
    //如果弹幕不为空则将弹幕祝福push数组并赋给usrdoommData，显示用户当前发送弹幕祝福信息
    if (that.data.danmuinfo !== '') {
      doommList.push(new Doomm(wx.getStorageSync('UserInfo').nickName +"  "+  that.data.danmuinfo, Math.ceil(Math.random() * 100), Math.ceil((Math.random() * 2) + 15), '#000000', wx.getStorageSync('UserInfo').avatarUrl));
      that.setData({
        usrdoommData: doommList,
      })
      let data = {
        openid: wx.getStorageSync("openid"),
        color: getRandomColor(),
        display: true,
        text: wx.getStorageSync('UserInfo').nickName  +"  "+ that.data.danmuinfo,
        time: Math.ceil((Math.random() * 2) + 15),
        top: Math.ceil(Math.random() * 100),
        switch: true,
        //city: JSON.stringify(that.data.add),
        name: wx.getStorageSync('UserInfo').nickName,
        avatarUrl: wx.getStorageSync('UserInfo').avatarUrl
      }
      db.collection('doommData').add({
        data: data,
        success(res) {
          wx.showToast({
            //title: '祝福成功',
            //icon: 'success',
            //duration: 2000
          })
          that.setData({
            senddisabled: true,
            danmuzhi: ''
          })
        }
      })
    }
  },
  //用户授权登陆微信
  onGotUserInfo: function(e) {
    var that = this
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
    if (e.detail.errMsg == 'getUserInfo:ok') {
      wx.setStorageSync('UserInfo', e.detail.userInfo)
      wx.setStorageSync('GotUserInfo', true)
      that.setData({
        GotUserInfohidden: true
      })

    } else {
      this.setData({
        GotUserInfohidden: false
      })
      wx.showToast({
        title: '请登陆！',
        icon: 'loading',
        duration: 2000
      })
    }


  },
  //卸载该页面停止计数
  onUnload() {
    clearTimeout(this.data.Interval);
    console.log("停止计数器");
    this.setData({
      usrdoommData: [],
      danmu: []
    })
    console.log(this.data.doommList)
  },

})