<template>
  <div class="main p-20rem">
    <div class="summary">
      <div class="date">今日<span> {{todayStr}}</span></div>
      <div class="ly">
        <div class="lyi-f ly ly-j ly-m mr-20rem">
          <span>支出:</span> 
          <span class="ly ly-m">￥<strong>{{outValue}}</strong> 元</span>
        </div>
        <div class="lyi-f ly ly-j ly-m">
          <span>收入:</span>
          <span class="ly ly-m">￥<strong>{{inValue}}</strong> 元</span>
        </div>
      </div>
    </div>
    <div class="ly ly-j mt-10rem">
      <van-button
        class="mb-10rem mr-20rem op-btn"
        type="primary"
        size="large"
        round
        @click="show('out')"
        style="flex-grow:1;"
      >
        记一笔支出
      </van-button>

      <van-button
        class="mb-10rem op-btn"
        type="primary"
        size="large"
        round
        plain
        @click="show('in')"
        style="flex-grow:1;"
        >
        记一笔收入
      </van-button>
    </div>

    <!-- 支出弹出 -->
    <van-popup :show="isShowOut" position="top">
      <van-nav-bar
        title="记一笔支出"
      />
      
      <div class="mh-20">
        <h2 class="title">类别</h2>
        <choose-type 
          type="out"
          v-model="curr.classify"
          ref="chooseOutType"
        />
      </div>
      
      <div class="mh-20">
        <h2 class="title">金额</h2>
          <van-field
            @change="moneyChange"
            placeholder="请输入金额"
            type="number"
            required
          >
            <div slot="button">元</div>
          </van-field>
      </div>
      
      <div class="mh-20">
        <h2 class="title">备注</h2>
          <van-field
            v-model="curr.comment"
            type="textarea"
            placeholder="请输入备注"
          >
          </van-field>
      </div>
      
      <div class="m-20 ly">
        <van-button size="large" round @click="isShowOut=false" class="mr-10rem" style="flex-grow:1;">取消</van-button>
        <van-button size="large" type="primary" round @click="save" style="flex-grow:1;">保存</van-button>
      </div>
    </van-popup>
    
    <!-- 收入弹出 -->
    <van-popup :show="isShowIn" position="top">
      <van-nav-bar
        title="记一笔收入"
      />
      
      <div class="mh-20">
        <h2 class="title">类别</h2>
        <choose-type 
          type="in"
          v-model="curr.classify"
          ref="chooseInType"
        />
      </div>
      
      <div class="mh-20">
        <h2 class="title">金额</h2>
          <van-field
            @change="moneyChange"
            placeholder="请输入金额"
            type="number"
            required
          >
            <div slot="button">元</div>
          </van-field>
      </div>
      
      <div class="mh-20">
        <h2 class="title">备注</h2>
          <van-field
            v-model="curr.comment"
            type="textarea"
            placeholder="请输入备注"
          >
          </van-field>
      </div>
      
      <div class="m-20 ly">
        <van-button size="large" round @click="isShowIn=false" class="mr-10rem" style="flex-grow:1;">取消</van-button>
        <van-button size="large" type="primary" round @click="save" style="flex-grow:1;">保存</van-button>
      </div>
    </van-popup>
    
    <van-toast id="van-toast" />
    <tabbar :active-index="0" />
  </div>
</template>

<script>

import moment from 'moment'
import Toast from '@/../static/vant/toast/toast'
import ChooseType from '@/components/choose-type'
import tabbar from '@/components/tabbar'
import {inType, outType} from '@/dict.js'
import store from '@/store'

var logItemTemplate = { // 每一笔记录的模板
  type: null,
  classify: {},
  value: null,
  comment: null
}

const today = moment()
const year = today.year()
const month = today.month() + 1
const day = today.date()

export default {
  components: {
    ChooseType,
    tabbar
  },
  data() {
    return {
      today,
      isShowOut: false,
      isShowIn: false,
      outValue: 0,
      inValue: 0,
      curr: { // 当前记录的这笔
        ...logItemTemplate
      },
    }
  },
  computed: {
    todayStr() {
      return moment(this.today).format('YYYY年MM月DD日')
    }
  },
  mounted() {
    store.commit('initTodayItem')
    this.updateTodayValue()
  },
  methods: {
    getTodayData() {
      var log = store.state.log

      if(log && log[year] && log[year][month] && log[year][month][day]) {
        return log[year][month][day]
      } else {
        return false
      }
    },
    getTodayValue(type) {
      var todayData = this.getTodayData()
      if (!todayData) {
        return 0
      }

      var res = 0
      todayData
        .filter(item => item.type === type)
        .forEach(item => {
          var value = parseFloat(item.value)
          if(!isNaN(value)) {
            res += value
          }
        })
      return res
    },
    updateTodayValue() {
      this.outValue = this.getTodayValue('out')
      this.inValue = this.getTodayValue('in')
    },
    show(type) {
      this.curr = { // 重置之前的
        ...logItemTemplate,
        type,
        classify: type === 'in' ? inType[0] : outType[0] // 默认选中第一个
      }
      
      if(type === 'in') {
        this.isShowIn = true
      } else {
        this.isShowOut = true
      }

      // 设置组件的初始化状态
      this.$nextTick(() => {
        if(type === 'in') {
          this.$refs.chooseInType.update(this.curr.classify)
        } else {
          this.$refs.chooseOutType.update(this.curr.classify)
        }
      })
    },
    moneyChange(event) {
      this.curr.value = event.mp.detail
    },
    valid(item) {
      var errMsg = null
      if(!item.value) {
        errMsg = '请输入金额'
      }
      if(errMsg) {
        Toast(errMsg)
        return false
      } else {
        return true
      }
    },
    save() {
      if(!this.valid(this.curr)) {
        return
      }
      store.commit('addItem', {
        date: today,
        payload: {...this.curr}
      })
      this.updateTodayValue()

      if(this.curr.type === 'in') {
        this.isShowIn = false
      } else {
        this.isShowOut = false
      }
    }
  }
}
</script>

<style src="css-utils-collection"></style>
<style scoped src="./style.css"></style>