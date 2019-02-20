<template>
  <div class="statistics-page main p-20rem">
    <van-cell-group>
      <van-cell
        title="时间"
        :value="activeDateLabel"
        is-link
        @click="isShowSelectTime = true"
      />
    </van-cell-group>
    <van-popup :show="isShowSelectTime" position="bottom">
      <van-picker
        show-toolbar
        title="时间"
        :columns="['本月', '上月']"
        @cancel="isShowSelectTime = false"
        @confirm="selectTimeChange"
      />
    </van-popup>

    <van-tabs 
      @change="dataViewChange"
      :active="activeDataViewIndex"
      type="card" class="mt-20rem" color="#67b836"
    >
      <van-tab title="概览" >
        <van-cell-group class="mt-15rem">
          <van-cell title="盈余" :value="surplus + '元'"/>
          <van-cell 
            title="支出" 
            :value="outMonthValue + '元'" 
            is-link
            @click="showClassifyType('out')"
          />
          <van-cell 
            title="收入" 
            :value="inMonthValue + '元'" 
            is-link
            @click="showClassifyType('in')"
          />
        </van-cell-group>
      </van-tab>
      <van-tab title="每日详情">
        <div class="ly ly-r mt-10rem">
          <van-button 
            type="primary" 
            plain
            size="mini"
            @click="isShowDetail = true"
          >
            明细
          </van-button>
          <van-popup :show="isShowDetail" position="right">
            <div class="full">
              <van-nav-bar
                left-arrow
                :title="activeDateLabel + '明细'"
                @click-left="hide('Detail')"
              />
              <table class="table">
                <thead class="ly">
                  <th>日期</th>
                  <th>金额</th>
                  <th>类别</th>
                  <th>注释</th>
                </thead>
                <tbody>
                  <tr v-for="(item, i) in activeMonthPlainData" :key="i" class="ly">
                    <td>{{days[i]}}</td>
                    <td
                      :class="[item.type === 'in' ? 'green' : 'red']"
                    >
                      {{(item.type === 'in' ? '+' : '-') + item.value}}
                    </td>
                    <td>{{item.classify.name}}</td>
                    <td>{{item.comment || ''}}</td>
                  </tr>
                </tbody>
              </table>
              
              <div class="ly ly-c mt-10">
                <van-button type="default" @click="hide('Detail')">返回</van-button>
              </div>

            </div>
          </van-popup>
        </div>
        <div class="chart-wrapper">
          <canvas id="detail-chart"></canvas>
        </div>
      </van-tab>
    </van-tabs>

    <van-popup :show="isShowOut" position="right">
      <div class="full">
        <van-nav-bar
          left-arrow
          title="支出"
          @click-left="isShowOut=false"
        />
        <div class="chart-wrapper">
          <canvas id="out-classify-chart"></canvas>
        </div>
      </div>
    </van-popup>

    <van-popup :show="isShowIn" position="right">
      <div class="full">
        <van-nav-bar
          left-arrow
          title="收入"
          @click-left="isShowIn=false"
        />
        <div class="chart-wrapper">
          <canvas id="in-classify-chart"></canvas>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import moment from 'moment'
import {inType, outType} from '@/dict.js'
import store from '@/store'


import F2 from '@antv/f2'
var Util = F2.Util;
var G = F2.G;
var Group = G.Group


import {getPlainMonthData, getMonthValue} from '@/utils/log-data-utils'

export default {
  data() {
    return {
      isShowSelectTime: false,
      isShowOut: false,
      isShowIn: false,
      currDate: moment(),
      prevMonthDate: moment().add('month', -1),
      activeDate: moment(), // 当前统计是时间
      activeDateLabel: '本月',
      activeMonthPlainData: [],
      days: [],
      activeDataViewIndex: 0,
      isShowDetail: true,
      outMonthValue: 0,
      inMonthValue: 0,
    }
  },
  computed: {
    surplus() { // 盈余
      var res = this.inMonthValue - this.outMonthValue
      if(res > 0) {
        res = '+' + res
      }
      return res
    }
  },
  mounted() {
    this.updateSummary() // 收入，支出的概览
  },
  methods: {
    padZero(num) {
      return parseInt(num, 10) < 10 ? `0${num}` : num
    },
    hide(type) {
      // debugger 为什么无效呢
      this[`isShow${type}`] = false
    },
    selectTimeChange(value, index) {
      this.activeDate = index === 0 ? this.currDate : this.prevMonthDate
      this.activeDateLabel = index === 0 ? '本月' : '上月'

      this.updateSummary()
      if(this.activeDataViewIndex === 1) {
        this.renderDailyChart()
      }
      this.isShowSelectTime = false
    },
    dataViewChange(index, tabName) {
      if(tabName === '每日详情') {
        this.renderDailyChart()
      }
    },
    showClassifyType(type) {
      if(type === 'in') {
        this.isShowIn = true
        this.renderClassifyChart('in')
      } else {
        this.isShowOut = true
        this.renderClassifyChart('out')
      }
    },
    // 按类型分类的饼图
    renderClassifyChart(type) {
      var activeType = type === 'in' ? inType : outType
      var activeMonthData = this.activeMonthPlainData.filter(item => item.type === type)

      
      var allTotal = 0
      var data = activeType
        .map(type => {
          var total = 0
          activeMonthData.forEach(itemLog => {
            if(itemLog.classify.id === type.id) {
              total += itemLog.value
              allTotal += itemLog.value
            }
          })
          return {
            name: type.name,
            total,
            a: '1'
          }
        })
        .filter(item => {
          return item.total !== 0
        })
      
      this.$nextTick(() => {
        var chart = new F2.Chart({
          id: `${type}-classify-chart`,
          pixelRatio: window.devicePixelRatio
        })

        chart.source(data) // 载入数据
        var lastClickedShape

        chart.legend({
          position: 'bottom',
          offsetY: -5,
          marker: 'square',
          align: 'center',
          onClick: function onClick(ev) {
            var clickedItem = ev.clickedItem;
            var dataValue = clickedItem.get('dataValue');
            var canvas = chart.get('canvas');
            var coord = chart.get('coord');
            var geom = chart.get('geoms')[0];
            var container = geom.get('container');
            var shapes = geom.get('shapes'); // 只有带精细动画的 geom 才有 shapes 这个属性

            var clickedShape;
            // 找到被点击的 shape
            Util.each(shapes, function(shape) {
              var origin = shape.get('origin');
              if (origin && origin._origin.name === dataValue) {
                clickedShape = shape;
                return false;
              }
            });

            if (lastClickedShape) {
              lastClickedShape.animate().to({
                attrs: {
                  lineWidth: 0
                },
                duration: 200
              }).onStart(function() {
                if (lastClickedShape.label) {
                  lastClickedShape.label.hide();
                }
              }).onEnd(function() {
                lastClickedShape.set('selected', false);
              });
            }

            if (clickedShape.get('selected')) {
              clickedShape.animate().to({
                attrs: {
                  lineWidth: 0
                },
                duration: 200
              }).onStart(function() {
                if (clickedShape.label) {
                  clickedShape.label.hide();
                }
              }).onEnd(function() {
                clickedShape.set('selected', false);
              });
            } else {
              var color = clickedShape.attr('fill');
              clickedShape.animate().to({
                attrs: {
                  lineWidth: 5
                },
                duration: 350,
                easing: 'bounceOut'
              }).onStart(function() {
                clickedShape.attr('stroke', color);
                clickedShape.set('zIndex', 1);
                container.sort();
              }).onEnd(function() {
                clickedShape.set('selected', true);
                clickedShape.set('zIndex', 0);
                container.sort();
                lastClickedShape = clickedShape;
                if (clickedShape.label) {
                  clickedShape.label.show();
                } else {
                  drawLabel(clickedShape, coord, canvas);
                }
                canvas.draw();
              });
            }
          }
        })

        chart.coord('polar', {
          transposed: true,
          innerRadius: 0.7,
          radius: 1.5
        })

        chart.axis(false);
        chart.tooltip(false)

        chart
          .interval()
          .position('a*total').color('name', ['#1890FF', '#13C2C2', '#2FC25B', '#FACC14', '#F04864', '#8543E0'])
          .adjust('stack');

        chart.guide().text({
          position: ['50%', '50%'],
          content: allTotal + '元',
          style: {
            fontSize: 20
          }
        })
        chart.render();
      })
    },
    // 每天的折线图
    renderDailyChart() {
      var vm = this
      var data = []
      var preStr = `${this.activeDate.year()}/${this.activeDate.month() + 1}\/`
      var activeDaysInMonth = this.activeDate.daysInMonth()
      for (var day = 1; day <= activeDaysInMonth; day++) {
        data[day] = {
          time: preStr + (day < 10 ? `0${day}` : `${day}`),
          value: getDayTotalValue(day, 'in'),
          type: '收入'
        }
        data[day + activeDaysInMonth] = {
          time: preStr + (day < 10 ? `0${day}` : `${day}`),
          value: getDayTotalValue(day, 'out'),
          type: '支出'
        }
      }
      
      function getDayTotalValue(day, type) {
        var total = 0
        vm.activeMonthPlainData
          .filter(item => item.day == day)
          .forEach(item => {
            if(item.type === type) {
              total += item.value
            }
          })
        return total
      }

      data.shift() // 去掉第一条空的
      
      this.$nextTick(() => {
        this.$nextTick(() => { // tab 内容的变化，是两次
          var chart = new F2.Chart({
            id: 'detail-chart',
            pixelRatio: window.devicePixelRatio
          });
          chart.source(data, {
            time: {
              type: 'timeCat',
              // tickCount: 3,
              mask: 'D',
              range: [0, 1]
            },
            value: {
              // tickCount: 3,
              formatter: function formatter(ivalue) {
                return ivalue
              }
            }
          });
          chart.axis('time', {
            line: null,
            label: function label(text, index, total) {
              var textCfg = {};
              if (index === 0) {
                textCfg.textAlign = 'left';
              } else if (index === total - 1) {
                textCfg.textAlign = 'right';
              }
              return textCfg;
            }
          });
          chart.axis('tem', {
            grid: function grid(text) {
              if (text === '0%') {
                return {
                  lineDash: null,
                  lineWidth: 1
                };
              }
            }
          });
          chart.legend({
            position: 'bottom',
            offsetY: -5
          });
          chart.tooltip({
            showCrosshairs: true,
            showItemMarker: false,
            onShow: function onShow(ev) {
              var items = ev.items;
              items[0].name = `${items[0].origin.time} ${items[0].name}`
              items[0].value = `${items[0].value}元`
              items[1].value = `${items[1].value}元`
            }
          })
          chart.line().position('time*value').color('type').shape('type', function(type) {
            if (type === '支出') {
              return 'line';
            }
            if (type === '收入') {
              return 'dash';
            }
          });

          chart.render();
        })
      })
    },
    updateSummary() {
      var year = this.activeDate.year()
      var month = this.activeDate.month() + 1
      this.activeMonthPlainData = getPlainMonthData(store.state.log, year, month)
      this.days = this.activeMonthPlainData.map(item => this.padZero(item.day))
      this.outMonthValue = getMonthValue(this.activeMonthPlainData, 'out')
      this.inMonthValue = getMonthValue(this.activeMonthPlainData, 'in')
    }
  }
}

function drawLabel(shape, coord, canvas) {
  var center = coord.center;
  var origin = shape.get('origin');
  var points = origin.points;
  var x1 = (points[2].x - points[1].x) * 0.75 + points[1].x;
  var x2 = (points[2].x - points[1].x) * 1.8 + points[1].x;
  var y = (points[0].y + points[1].y) / 2;
  var point1 = coord.convertPoint({
    x: x1,
    y: y
  });
  var point2 = coord.convertPoint({
    x: x2,
    y: y
  });

  var group = new Group();
  group.addShape('Line', {
    attrs: {
      x1: point1.x,
      y1: point1.y,
      x2: point2.x,
      y2: point2.y,
      lineDash: [0, 2, 2],
      stroke: '#808080'
    }
  });
  var text = group.addShape('Text', {
    attrs: {
      x: point2.x,
      y: point2.y,
      text: origin._origin.name + '  ' + origin._origin.total + ' 元',
      fill: '#808080',
      textAlign: 'start',
      textBaseline: 'bottom'
    }
  });
  var textWidth = text.getBBox().width;
  var baseLine = group.addShape('Line', {
    attrs: {
      x1: point2.x,
      y1: point2.y,
      x2: point2.x,
      y2: point2.y,
      stroke: '#808080'
    }
  });
  if (point2.x > center.x) {
    baseLine.attr('x2', point2.x + textWidth);
  } else if (point2.x < center.x) {
    text.attr('textAlign', 'end');
    baseLine.attr('x2', point2.x - textWidth);
  } else {
    text.attr('textAlign', 'center');
    text.attr('textBaseline', 'top');
  }
  canvas.add(group);
  shape.label = group;
}
</script>

<style src="css-utils-collection"></style>
<style>
  .statistics-page .van-tabs__nav--card {
    margin: 0;
  }
</style>
<style scoped src="./style.css"></style>