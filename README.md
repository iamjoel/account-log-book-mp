# 安全记账本 - 小程序版
数据不会被窃取的个人记账本。数据都存在本地，需要时，可以灵活导出。 


## 运行
1 安装依赖：  

1. `npm install`

推荐用[Yarn](https://yarnpkg.com/en/docs/install):
1. 安装 [Yarn](https://yarnpkg.com/en/docs/install)。
1. `yarn install`。

2 启动 `npm run dev`

3 将本项目添加到微信

## 注意点
### 微信小程序
不支持 `localStorage.getItem`, `localStorage.setItem`。 获取，设置本地缓存数据分别用 `wx.getStorageSync(string key)`, `wx.setStorageSync(string key, any data)` 。 设置的内容支持对象。


### mpvue
* 不支持 filter
* 不支持在 template 内使用 methods 中的函数。可以用计算属性代替。
* 需要在单文件中内联 js 和 css。

### Vant Webapp
* van-button 不支持 size="large" 。。。
* 不支持 `v-model`
* vant组件里明明触发了`click-left` 事件，但为什么不进入父组件绑定的 `click-left` 的回调呢？会不会是因为 `handleProxy` 原因?

组件中使用 Vant 组件，只能在用该组件的页面中用引入需要的 Vant 组件。

## 资源
* [Vant Weapp](https://youzan.github.io/vant-weapp/#/intro)
* [微信小程序 API](https://developers.weixin.qq.com/miniprogram/dev/api/)
* [微信小程序的配置](https://developers.weixin.qq.com/miniprogram/dev/framework/config.html)