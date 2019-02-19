<template>
  <div>
    <!-- <van-tabbar :active="activeIndex" @change="tabChange">
      <van-tabbar-item icon="edit" url="/pages/index/main">a记一笔{{activeIndex}}</van-tabbar-item>
      <van-tabbar-item icon="exchange-record" url="/pages/statistics/main">统计</van-tabbar-item>
      <van-tabbar-item icon="aim" url="/pages/data-center/main">数据中心</van-tabbar-item>
    </van-tabbar> -->

    <div class="ly ly-j footer">
      <a href="/pages/index/main">记一笔</a>
      <a href="/pages/statistics/main">统计</a>
      <a href="/pages/data-center/main">数据中心</a>
    </div>
  </div>
  
</template>

<script>
export default {
  props: {
    activeIndex: Number
  },
  data() {
    return {

    }  
  },
  mounted() {
    debugger
  },
  methods: {
    tabChange(index) {
      // 就是没有触发 change
      // debugger
      var urls = [
        '/pages/index/main',
        '/pages/statistics/main',
        '/pages/data-center/main',
      ]
      // debugger
      wx.navigateTo({
        url: urls[index]
      })
    }
  }
}
</script>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30px;
  line-height: 30px;
}
</style>