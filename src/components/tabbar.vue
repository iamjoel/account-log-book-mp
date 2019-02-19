<template>
  <van-tabbar v-modela="activeIndex">
      <van-tabbar-item icon="edit" url="/pages/index/main">记一笔</van-tabbar-item>
      <van-tabbar-item icon="exchange-record" url="/pages/statistics/main">统计</van-tabbar-item>
      <van-tabbar-item icon="aim" url="/pages/data-center/main">数据中心</van-tabbar-item>
    </van-tabbar>
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
  methods: {
    
  }
}
</script>

<style scoped></style>