<template>
  <div class="dashboard-container" >
    <!-- 顶部标题区 -->
    <div class="dashboard-header">
			<img src="@/assets/img/up.png" class="header-bg" alt="header-bg" />
			<div class="header-title">运输机孪生平台</div>
		</div>


    <!-- 主体内容区 -->
    <div class="dashboard-main">
      <!-- 中央3D区域 - 布满整个页面 -->
      <div class="center-panel">
        <iframe
          src="/Belt/index.html"
          style="width:100%; height:100%; border:none; background:transparent; overflow:hidden;"
          allowfullscreen
          scrolling="no"
        ></iframe>
      </div>

      <!-- 左侧数据区 - 透明浮层 -->
      <div class="left-panel">
        <!-- 智慧园区数据展示 -->
        <div class="panel-section1">
          <div class="section-title1">
            <span class="title-text">运输机运行情况</span>
            <div class="title-line"></div>
          </div>

          <!-- 数据卡片组 -->
          <div class="data-cards">
            <div class="data-card">
              <div class="card-icon">🏢</div>
              <div class="card-content">
                <div class="card-value">130</div>
                <div class="card-label">运输机总数</div>
                <!-- <div class="card-unit">+2
                  <n-icon size="16">
                  <ArrowUpOutlined/>
                </n-icon>
                </div> -->
              </div>
            </div>
            <div class="data-card">
              <div class="card-icon">🏢</div>
              <div class="card-content">
                <div class="card-value">13</div>
                <div class="card-label">在线设备</div>
                <!-- <div class="card-unit">+1
                   <n-icon size="16">
                     <ArrowUpOutlined/>
                   </n-icon>
                </div> -->
              </div>
            </div>
            <div class="data-card">
              <div class="card-icon">🏢</div>
              <div class="card-content">
                <div class="card-value">4</div>
                <div class="card-label">告警数量</div>
                <!-- <div class="card-unit">平方米</div> -->
              </div>
            </div>
            <div class="data-card">
              <div class="card-icon">🏢</div>
              <div class="card-content">
                <div class="card-value">94.2%</div>
                <div class="card-label">运行效率</div>
                <!-- <div class="card-unit"></div> -->
              </div>
            </div>
          </div>
        </div>

        <!-- 智慧园区数据展示 -->
        <div class="panel-section1">
          <div class="section-title">
            <span class="title-text">运输机健康状态</span>
            <div class="title-line"></div>
          </div>

          <!-- 进度条数据 -->
          <div class="progress-data">
            <div class="progress-item">
              <div class="progress-label">主电机系统</div>
              <div class="progress-bar">
                <div class="progress-fill green" style="width: 92%"></div>
              </div>
              <div class="progress-value">92%</div>
            </div>
            <div class="progress-item">
              <div class="progress-label">制动系统</div>
              <div class="progress-bar">
                <div class="progress-fill green" style="width: 88%"></div>
              </div>
              <div class="progress-value">88%</div>
            </div>
            <div class="progress-item">
              <div class="progress-label">钢丝绳状态</div>
              <div class="progress-bar">
                <div class="progress-fill yellow" style="width: 85%"></div>
              </div>
              <div class="progress-value">85%</div>
            </div>
            <div class="progress-item">
              <div class="progress-label">液压系统</div>
              <div class="progress-bar">
                <div class="progress-fill green" style="width: 90%"></div>
              </div>
              <div class="progress-value">90%</div>
            </div>
            <div class="progress-item">
              <div class="progress-label">控制系统</div>
              <div class="progress-bar">
                <div class="progress-fill green" style="width: 95%"></div>
              </div>
              <div class="progress-value">95%</div>
            </div>
            <div class="progress-item">
              <div class="progress-label">安全保护系统</div>
              <div class="progress-bar">
                <div class="progress-fill green" style="width: 98%"></div>
              </div>
              <div class="progress-value">98%</div>
            </div>
          </div>
        </div>

        <!-- 智慧园区数据展示 - 圆形图表 -->
         <!-- 运输机运行数据统计 -->
        <div class="panel-section1">
          <div class="section-title">
            <span class="title-text">运输机运行数据统计</span>
            <div class="title-line"></div>
          </div>

          <div class="circle-charts">
            <div class="circle-chart">
              <div class="chart-circle">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" class="chart-bg"/>
                  <circle cx="50" cy="50" r="40" class="chart-fg" stroke-dasharray="251.2" stroke-dashoffset="62.8"/>
                </svg>
                <div class="chart-value">156</div>
              </div>
              <div class="chart-labels">
                <div class="chart-label">今日提升次数</div>
                <div class="chart-data">
                  <div>提升高度: 680m</div>
                  <div>载重: 12吨/次</div>
                </div>
              </div>
            </div>
            <div class="circle-chart">
              <div class="chart-circle">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" class="chart-bg"/>
                  <circle cx="50" cy="50" r="40" class="chart-fg" stroke-dasharray="251.2" stroke-dashoffset="37.68"/>
                </svg>
                <div class="chart-value">94.7%</div>
              </div>
              <div class="chart-labels">
                <div class="chart-label">运行效率</div>
                <div class="chart-data">
                  <div>故障次数: 0</div>
                  <div>可用率: 98.5%</div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>

      <!-- 右侧数据区 - 透明浮层 -->
      <div class="right-panel">
        <!-- 智慧园区数据展示 -->
        <div class="panel-section1">
          <div class="section-title1">
            <span class="title-text">环境监控</span>
            <div class="title-line"></div>
          </div>


          <div class="env-cards">
            <div class="env-card">
              <img class="env-icon" src="@/assets/img/wen.png" alt="温度">
              <div class="env-content">
                <div class="env-value">28℃</div>
                <div class="env-label">井下温度</div>
                <div class="env-unit green">正常范围</div>
              </div>
            </div>
            <div class="env-card">
              <img class="env-icon" src="@/assets/img/feng.png" alt="风速">
              <div class="env-content">
                <div class="env-value">2.3m/s</div>
                <div class="env-label">风速</div>
                <div class="env-unit green">正常范围</div>
              </div>
            </div>
            <div class="env-card">
              <img class="env-icon" src="@/assets/img/shi.png" alt="空气湿度">
              <div class="env-content">
                <div class="env-value">65%</div>
                <div class="env-label">空气湿度</div>
                <div class="env-unit yellow">稍高</div>
              </div>
            </div>
            <div class="env-card">
              <img class="env-icon" src="@/assets/img/nong.png" alt="气体浓度">
              <div class="env-content">
                <div class="env-value">0.02%</div>
                <div class="env-label">气体浓度</div>
                <div class="env-unit green">正常范围</div>
              </div>
            </div>
          </div>

        </div>

        <!-- 智慧园区数据展示 - 饼图 -->
        <div class="panel-section1">
          <div class="section-title">
            <span class="title-text">智慧园区数据展示</span>
            <div class="title-line"></div>
          </div>

          <div class="panel-section1">
            <div class="chart-container" ref="chartRef"></div>
          </div>

        </div>

        <!-- 智慧园区数据展示 - 关键设备 -->
        <div class="panel-section1">
          <div class="section-title">
            <span class="title-text">关键设备</span>
            <div class="title-line"></div>
          </div>

           <div class="icon-data">
            <div class="icon-item">
              <div class="icon-3d">🏢</div>
              <div class="icon-info">
                <div class="info-left">
                  <div class="icon-label">主运输机#1</div>
                  <div class="icon-value">温度：65℃  运行：72h</div>
                </div>
                <div class="icon-unit">正常</div>
              </div>
            </div>
            <div class="icon-item">
              <div class="icon-3d">🏢</div>
              <div class="icon-info">
                <div class="info-left">
                  <div class="icon-label">主运输机#2</div>
                  <div class="icon-value">温度：55℃  运行：12h</div>
                </div>
                <div class="icon-unit orange">预警</div>
              </div>
            </div>
            <!-- <div class="icon-item">
              <div class="icon-3d">🏢</div>
              <div class="icon-info">
                <div class="info-left">
                  <div class="icon-label">运输皮带#5</div>
                  <div class="icon-value">温度：65℃  运行：72h</div>
                </div>
                <div class="icon-unit">正常</div>
              </div>
            </div> -->
          </div>


        </div>


      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
// 智慧楼宇可视化指挥中心
defineOptions({
  name: 'DashboardIndex'
})

import {ref, onMounted, onUnmounted} from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

// 根据窗口高度计算图表高度
const calculateChartHeight = (windowHeight: number): number => {
  // 基础高度
  let baseHeight = 200

  if (windowHeight < 600) {
    baseHeight = 120  // 极小屏幕
  } else if (windowHeight < 900) {
    baseHeight = 160  // 小屏幕
  } else if (windowHeight < 1000) {
    baseHeight = 180  // 中等屏幕
  } else if (windowHeight < 1200) {
    baseHeight = 200  // 大屏幕
  } else {
    baseHeight = 220  // 超大屏幕
  }

  return baseHeight
}

const initChart = () => {
  if (chartRef.value) {
    // 根据窗口高度动态设置图表容器高度
    const windowHeight = window.innerHeight
    const chartHeight = calculateChartHeight(windowHeight)
    chartRef.value.style.height = chartHeight + 'px'
    chart = echarts.init(chartRef.value)
    const xData = ["提升效率", "提升速度", "载重状态", "制动系统", "安全指数"]

    const percent = [94, 87, 76, 100, 92]

    const imgList: Array<{
      coord: [number, number];
      symbolSize: [number, number];
      symbolKeepAspect: boolean;
      symbolOffset: [number, number];
      symbol: string;
    }> = []
    const iconData: Array<{
      value: number;
      symbolPosition: string;
    }> = []

    percent.forEach((item, index) => {
      imgList.push({
        coord: [index, item],
        symbolSize: [100, 50],
        symbolKeepAspect: true,
        symbolOffset: [-40, -185],
        symbol: "circle",
      })
      iconData.push({
        value: item,
        symbolPosition: 'end',
      })
    })

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: "rgba(7,55,63,0.7)",
        borderColor: "rgba(7,55,63,0.7)",
        textStyle: {
          color: '#fff',
        },
        formatter: function (params: Array<{marker: string, name: string, value: number}>) {
          return params[0].marker + '' + params[0].name + ': ' + params[0].value + '%'
        }
      },
      grid: {
        top: '10%',
        bottom: '10%',
        right: 0,
        left: 0,
      },
      xAxis: {
        data: xData,
        axisTick: {
          show: false
        },
        axisLine: {
          show: false
        },
        axisLabel: {
          show: true,
          textStyle: { color: '#fff', fontSize: 11 },
          interval: 0,
          formatter: function(value: string) {
            // 长文字分两行显示
            if (value.length > 3) {
              return value.substring(0, 2) + '\n' + value.substring(2)
            }
            return value
          }
        }
      },
      yAxis: {
        max: 110,
        splitLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLine: {
          show: false
        },
        axisLabel: {
          show: false
        }
      },
      series: [
        {
          name: '权属情况',
          type: 'pictorialBar',
          symbolSize: [30, 12],
          symbolOffset: [0, -7],
          z: 12,
          itemStyle: {
            normal: {
              color: '#14b1eb',
              opacity: 0.5,
            }
          },
          data: iconData
        },
        {
          name: '',
          type: 'pictorialBar',
          symbolSize: [40, 15],
          symbolOffset: [0,-2],
          z: 10,
          itemStyle: {
            normal: {
              color: 'transparent',
              borderColor: '#14b1eb',
              borderType: 'solid',
              borderWidth: 5
            }
          },
          data: iconData
        },
        {
          name: '',
          type: 'pictorialBar',
          symbolSize: [30, 12],
          symbolOffset: [0, -5],
          z: 10,
          itemStyle: {
            normal: {
              color: 'transparent',
              borderColor: '#14b1eb',
              borderType: 'solid',
              borderWidth: 5
            }
          },
          data: iconData
        },
        {
          name: '',
          type: 'pictorialBar',
          symbolSize: [15, 5],
          symbolOffset: [0, -5],
          z: 12,
          itemStyle: {
            normal: {
              color: 'rgb(9,227,255)'
            }
          },
          data: iconData
        },
        {
          type: 'bar',
          itemStyle: {
            normal: {
              color: {
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                type: 'linear',
                global: false,
                colorStops: [{
                  offset: 0,
                  color: "rgb(24,118,158)"
                }, {
                  offset: 1,
                  // color: "rgba(9,30,41,0.5)"
                  color:"rgba(26, 35, 50, 0.5)"
                }]
              }
            }
          },
          barWidth: 30,
          data: percent,
          label: {
            show: true,
            position: 'top',
            distance: 15,
            color: '#fff',
            fontSize: 12,
            formatter: (params: { dataIndex: number, value: number }) => {
              return '{b|' + params.value + '%}'
            },
            rich: {
              a: {
                color: '#03adff',
                fontSize: 12,
                fontWeight: 'bold'
              },
              b: {
                color: '#fff',
                fontSize: 12,
                marginTop: 15,
              }
            }
          },
          markPoint: {
            data: imgList
          }
        }
      ]
    }

    chart.setOption(option)
  }
}

const resizeChart = () => {
   if (chart && chartRef.value) {
    const windowHeight = window.innerHeight;

    // 动态调整容器高度
    const newHeight = calculateChartHeight(windowHeight)
    chartRef.value.style.height = newHeight + 'px'

    // 重新调整图表大小
    chart.resize()

    // 根据窗口高度调整Y轴最大值
    let newMax = 110;

    if (windowHeight < 600) {
      newMax = 160;
    } else if (windowHeight < 900) {
      newMax = 140;
    } else if (windowHeight < 1000) {
      newMax = 130;
    } else {
      newMax = 100;
    }

    chart.setOption(
      {
        yAxis: {
          max: newMax
        },
        grid: {
          top: '10%',
          bottom: '10%',
          right: 0,
          left: 0,
        }
      },
      false
    )

  }
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  chart?.dispose()
  window.removeEventListener('resize', resizeChart)
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 全局隐藏滚动条 */
* {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

*::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

html, body {
  overflow: hidden; /* 隐藏页面级别滚动条 */
}

/* 确保所有可滚动元素都隐藏滚动条 */
div, section, aside, main, article {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

div::-webkit-scrollbar,
section::-webkit-scrollbar,
aside::-webkit-scrollbar,
main::-webkit-scrollbar,
article::-webkit-scrollbar {
  display: none;
}

.dashboard-container {
  width: 100%; /* 使用100%宽度自适应父容器 */
  height: calc(100vh - 100px);
  background: #001440;
  color: #ffffff;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  overflow: hidden; /* 完全隐藏滚动条 */
  display: flex;
  flex-direction: column;
  position: relative; /* 为内部固定定位元素建立定位上下文 */
}


.dashboard-header {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 80px;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 100;
	/* background: linear-gradient(rgba(10,26,42) 80%, rgba(10,26,42,0.9) 100%); */
}
.header-bg {
	position: absolute;
	left: 50%;
	top: 0;
	transform: translateX(-50%);
	width: 100%;
	height: 85px;
	object-fit: cover;
	z-index: 1;
	pointer-events: none;
}
.header-title {
	position: relative;
	z-index: 2;
	padding-top: 0;
	font-size: 32px;
	font-weight: bold;
	color: #fff;
	letter-spacing: 8px;
	text-shadow: 0 4px 16px #1e90ff, 0 1px 0 #000;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 主体内容区 */
.dashboard-main {
	flex: 1;
	display: flex;
	padding: 0;
	gap: 0;
	width: 100%;
	height: 100%;
	overflow: hidden; /* 隐藏滚动条 */
	position: relative; /* 为浮层定位做准备 */
}

.left-panel {
  background: url('@/assets/img/239.png') left;
  background-size: cover;
	width: min(320px, 22vw); /* 减小宽度避免超出屏幕 */
	min-width: 250px; /* 减小最小宽度 */
	max-width: 350px; /* 减小最大宽度 */
	height: calc(100vh - 190px); /* 使用视口高度 */
	display: flex;
	flex-direction: column;
	gap: 15px;
	margin: 0;
	padding: 15px 15px 15px 25px;
	position: absolute;
	top: 60px; /* 在标题下方 */
	left: 15px; /* 减小左边距 */
	z-index: 10;
	overflow-y: auto; /* 允许垂直滚动 */
	scrollbar-width: none; /* Firefox */
	-ms-overflow-style: none; /* IE and Edge */
}

.left-panel::-webkit-scrollbar {
	display: none; /* Chrome, Safari and Opera */
}

.right-panel {
	background: url('@/assets/img/240.png') right; /* 修正背景图片方向 */
  background-size: cover;
	width: min(320px, 22vw); /* 减小宽度避免超出屏幕 */
	min-width: 250px; /* 减小最小宽度 */
	max-width: 350px; /* 减小最大宽度 */
	height: calc(100vh - 190px); /* 使用视口高度 */
	display: flex;
	flex-direction: column;
	gap: 15px;
	margin: 0;
	padding: 15px 25px 15px 15px;
	position: absolute; /* 绝对定位浮层 */
	top: 60px; /* 在标题下方 */
	right: 15px; /* 减小右边距 */
	z-index: 10; /* 确保在3D模型上方 */
	overflow-y: auto; /* 允许滚动 */
	scrollbar-width: none; /* Firefox */
	-ms-overflow-style: none; /* IE and Edge */
}

.right-panel::-webkit-scrollbar {
	display: none; /* Chrome, Safari and Opera */
}

.center-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%; /* 使用100%宽度自适应父容器 */
  height: 100%;
  z-index: 1; /* 确保3D模型在底层 */
  overflow: hidden;
}

/* 面板区域 */

.panel-section1 {
  /* padding: 5px; */
  backdrop-filter: blur(10px);
  height: auto;
  flex: 0 1 auto; /* 根据内容大小分配高度，而不是平均分配 */
  display: flex;
  flex-direction: column;
  min-height: 0; /* 允许flex子元素缩小 */
  overflow: visible; /* 允许内容正常显示 */

}

.section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  position: relative;
  background: url('@/assets/img/225.png') no-repeat center;
  background-size: cover;
  text-align: center;
}

.section-title1 {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 22px;
  margin-bottom: 15px;
  position: relative;
  background: url('@/assets/img/225.png') no-repeat center;
  background-size: cover;
  text-align: center;
}


.title-text {
  /* color: #00bcd4; */
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  padding: 4px 10px;
  letter-spacing: 2px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
/* .title-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, #00bcd4 0%, transparent 100%);
} */

/* 数据卡片 */
.data-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  flex: 1; /* 使卡片区域能够扩展和收缩 */
  min-height: 80px; /* 设置最小高度，确保至少能显示2行卡片 */
  max-height: 100%; /* 限制最大高度不超过父容器 */
  overflow-y: hidden; /* 内容超出时显示滚动条 */
  overflow-x: hidden; /* 隐藏水平滚动条 */
  align-content: start; /* 卡片从顶部开始排列 */
}

.data-card {
  background: rgba(0, 188, 212, 0.1);
  border: 1px solid rgba(0, 188, 212, 0.3);
  border-radius: 6px;
  padding: 10px 5px 8px 12px; /* 调整padding给内容更多空间 */
  display: flex;
  align-items: center;
  gap: 8px; /* 减小间距 */
  width: 100%; /* 使用100%宽度而不是固定宽度 */
  height: auto; /* 让高度自适应内容 */
  min-height: 50px; /* 设置合适的最小高度 */
  max-width: 150px; /* 保持最大宽度限制 */
}

.card-icon {
  font-size: 24px;
  color: #00bcd4;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: clamp(16px, 2.5vw, 19px); /* 响应式字体大小 */
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 2px; /* 减小间距 */
}

.card-label {
  font-size: clamp(10px, 1.5vw, 12px); /* 响应式字体大小 */
  color: #cccccc;
  margin-bottom: 1px; /* 减小间距 */
  line-height: 1.2; /* 调整行高 */
}

.card-unit {
  font-size: 10px;
  color: #00bcd4;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 进度条数据 */
.progress-data {
  display: flex;
  flex-direction: column;
  gap: 12px; /* 减小间距 */
  flex: 0 0 auto; /* 根据内容大小确定高度 */
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.progress-label {
  width: 85px;
  font-size: 14px;
  color: #cccccc;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffb300, #ff8f00);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.progress-fill.green {
  background: linear-gradient(90deg, #49f343, #37e031);
}

.progress-fill.red {
  background: linear-gradient(90deg, #ff3d00, #dd2c00);
}

.progress-value {
  width: 40px;
  font-size: 14px;
  font-weight: bold;
  color: #ffffff;
  text-align: right;
}

/* 圆形图表 */
.circle-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 13px; /* 减小间距 */
  flex: 0 0 auto; /* 根据内容大小确定高度 */
  align-content: start; /* 从顶部开始排列 */
}

.circle-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.chart-circle {
  position: relative;
  width: 90px;
  height: 90px;
}

.chart-circle svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.chart-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 8;
}

.chart-fg {
  fill: none;
  stroke: #00bcd4;
  stroke-width: 8;
  stroke-linecap: round;
}

.chart-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
}

.chart-labels {
  text-align: center;
}

.chart-label {
  font-size: 12px;
  color: #00bcd4;
  margin-bottom: 1px;
}

.chart-data {
  font-size: 10px;
  color: #cccccc;
  line-height: 1.2;
}

/* 中央3D区域 */
.building-3d {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.building-model {
  max-width: 500px;
  max-height: 400px;
  filter: drop-shadow(0 0 30px rgba(0, 188, 212, 0.3));
}

/* 中央数据显示 */


/* 右侧图标数据 */

.env-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  flex: 1; /* 使卡片区域能够扩展和收缩 */
  min-height: 100px; /* 设置最小高度，确保至少能显示2行卡片 */
  max-height: 100%; /* 限制最大高度不超过父容器 */
  align-content: start; /* 卡片从顶部开始排列 */
  margin-bottom: 5px;
}
.env-card {
  border-radius: 6px;
  padding: 8px 1px 4px 8px; /* 减小padding以适应更小的空间 */
  display: flex;
  align-items: center;
  gap: 8px; /* 减小间距 */
  width: 100%;
  height: auto; /* 让高度自适应内容 */
  min-height: 80px; /* 设置合适的最小高度，考虑到图标较大 */
  max-width: 150px; /* 保持最大宽度限制 */
}
.env-icon {
  width: clamp(50px, 8vw, 70px); /* 响应式图标宽度 */
  height: clamp(50px, 8vw, 70px); /* 响应式图标高度 */
  color: #00bcd4;
  flex-shrink: 0; /* 防止图标被压缩 */
}

.env-content {
  flex: 1;
}
.env-icon {
  font-size: 24px;
  color: #00bcd4;
}

.env-value {
  font-size: clamp(14px, 2.2vw, 16px); /* 响应式字体大小 */
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 2px; /* 减小间距 */
}

.env-label {
  font-size: clamp(10px, 1.4vw, 12px); /* 响应式字体大小 */
  color: #cccccc;
  margin-bottom: 1px; /* 减小间距 */
  line-height: 1.2; /* 调整行高 */
}

.env-unit {
  font-size: clamp(8px, 1.2vw, 10px); /* 响应式字体大小 */
  display: flex;
  align-items: center;
  gap: 3px; /* 减小间距 */
  border-radius: 4px; /* 减小圆角 */
  padding: 1px 5px; /* 减小padding */
}
.env-unit.green {
  background: rgba(82, 196, 26, 0.1);
  color: rgb(69, 241, 69);
}
.env-unit.yellow {
  background: rgba(248, 190, 15, 0.1);
  color: #f8c829f8;
}


/* 饼图 */
.pie-chart-container {
  display: flex;
  align-items: center;
  gap: 30px;
}

.pie-chart {
  position: relative;
  width: 120px;
  height: 120px;
}

.pie-svg {
  width: 100%;
  height: 100%;
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #ffffff;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

/* 柱状图 */
.bar-chart {
  display: flex;
  gap: 15px;
  height: 150px;
}

.chart-values {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 10px;
  color: #cccccc;
  padding: 5px 0;
}

.chart-bars {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 5px;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  flex: 1;
}

.bar {
  width: 100%;
  max-width: 20px;
  border-radius: 2px 2px 0 0;
  margin-bottom: 5px;
}

.bar-blue {
  background: linear-gradient(to top, #00bcd4, #4fc3f7);
}

.bar-yellow {
  background: linear-gradient(to top, #ffb300, #ffc107);
}

.bar-label {
  font-size: 10px;
  color: #cccccc;
  text-align: center;
  writing-mode: vertical-rl;
  text-orientation: mixed;
}
/* 右侧图标数据 */
.icon-data {
  display: flex;
  flex-direction: column;
  gap: 12px; /* 减小间距 */
  flex: 0 0 auto; /* 根据内容大小确定高度 */
}

.icon-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(0, 188, 212, 0.05);
  border: 1px solid rgba(0, 188, 212, 0.2);
  border-radius: 6px;
  padding: 10px;
}

.icon-3d {
  font-size: 32px;
  color: #00bcd4;
}

.icon-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-left {
  flex: 1;
}

.icon-label {
  font-size: 15px;
  color: #ffffff;
  margin-bottom: 5px;
}

.icon-value {
  font-size: 10px;
  color: #cccccc;
  margin-bottom: 2px;
}

.icon-unit {
  font-size: 10px;
  padding: 2px 8px;
  background: rgba(82, 196, 26, 0.1);
  color: rgb(69, 241, 69);
  border-radius: 4px;
  margin-left: 10px;
}

.icon-unit.orange {
  background: rgba(248, 190, 15, 0.1);
  color: #f8cc3b;
}
.chart-container{
  width: 100%;
  height: auto; /* 移除固定高度，让容器自适应 */
  min-height: 120px; /* 设置最小高度，防止过小 */
  max-height: 300px; /* 设置最大高度，防止过大 */
}


/* 响应式设计 */
/* 大屏幕优化 */
@media (min-width: 1600px) {
  .left-panel, .right-panel {
    width: min(350px, 20vw);
  }
}

/* 中等屏幕 */
@media (max-width: 1400px) and (min-width: 1200px) {
  .left-panel, .right-panel {
    width: min(300px, 22vw);
    min-width: 250px;
  }
}

/* 高度响应式调整 */
@media (max-height: 900px) {
  .data-cards {
    gap: 12px; /* 减小卡片间距 */
  }

  .data-card {
    min-height: 45px; /* 减小卡片最小高度 */
    padding: 4px 4px 4px 10px; /* 进一步减小padding */
  }

  .card-value {
    font-size: clamp(14px, 2vw, 12px); /* 进一步减小字体 */
  }

  .card-label {
    font-size: clamp(9px, 1.2vw, 10px); /* 进一步减小字体 */
  }
  .progress-label {
    width: 60px;
    font-size: 11px;
  }
  .progress-value {
    width: 40px;
    font-size: 12px;
  }
  /* 环境卡片响应式调整 */
  .env-card {
    min-height: 50px; /* 减小环境卡片最小高度 */
    padding: 1px 1px 4px 4px; /* 进一步减小padding */
  }

  .env-icon {
    width: clamp(40px, 6vw, 45px); /* 进一步减小图标尺寸 */
    height: clamp(40px, 6vw, 45px);
  }

  .env-value {
    font-size: clamp(12px, 1.8vw, 12px); /* 进一步减小字体 */
  }

  .env-label {
    font-size: clamp(9px, 1.2vw, 10px); /* 进一步减小字体 */
  }

  .env-unit {
    font-size: clamp(7px, 1vw, 8px); /* 进一步减小字体 */
  }
  .chart-circle {
    width: 70px;
    height: 70px;
  }

  .chart-container{
   min-height: 100px; /* 小屏幕时减小最小高度 */
   max-height: 180px; /* 小屏幕时减小最大高度 */
  }
  .chart-value {
    font-size: 14px;
  }

  .chart-labels {
    text-align: center;
  }

  .chart-label {
    font-size: 12px;
    color: #00bcd4;
    margin-bottom: 5px;
  }

  .chart-data {
    font-size: 10px;
    color: #cccccc;
    line-height: 1.2;
  }
    .icon-item {
      gap: 8px;
      padding: 4px;
    }
    .icon-label {
      font-size: 12px;
    }

    .icon-value {
      font-size: 10px;
    }

    .icon-unit {
      font-size: 10px;
      padding: 2px 8px;
      margin-left: 10px;
    }
}

@media (max-height: 600px) {
  .data-cards {
    gap: 6px;
  }

  .data-card {
    min-height: 40px; /* 极小卡片高度 */
    padding: 4px 1px 3px 8px;
  }

  .card-icon {
    font-size: 18px; /* 减小图标尺寸 */
  }

  .card-value {
    font-size: clamp(12px, 1.8vw, 14px);
    margin-bottom: 1px;
  }

  .card-label {
    font-size: clamp(8px, 1vw, 10px);
    margin-bottom: 0;
  }

  /* 极小屏幕环境卡片调整 */
  .env-card {
    min-height: 80px; /* 极小环境卡片高度 */
    padding: 4px 1px 3px 5px; /* 进一步减小padding */
    gap: 6px; /* 减小间距 */
  }

  .env-icon {
    width: clamp(35px, 5vw, 40px); /* 极小图标尺寸 */
    height: clamp(35px, 5vw, 40px);
  }

  .env-value {
    font-size: clamp(11px, 1.5vw, 13px); /* 极小字体 */
    margin-bottom: 1px;
  }

  .env-label {
    font-size: clamp(8px, 1vw, 10px); /* 极小字体 */
    margin-bottom: 0;
  }

  .env-unit {
    font-size: clamp(6px, 0.8vw, 8px); /* 极小字体 */
    padding: 1px 3px; /* 减小padding */
  }

  /* 极小屏幕下的图表高度调整 */
  .chart-container{
    min-height: 80px; /* 极小屏幕时进一步减小最小高度 */
    max-height: 120px; /* 极小屏幕时进一步减小最大高度 */
  }
}

/* 小屏幕适配 */
@media (max-width: 1200px) {
  .left-panel, .right-panel {
    width: min(280px, 25vw);
    min-width: 220px;
  }

  .left-panel {
    left: 10px; /* 减小左边距 */
  }

  .right-panel {
    right: 10px; /* 减小右边距 */
  }
}

/* 超小屏幕适配 */
@media (max-width: 768px) {
  .left-panel, .right-panel {
    width: min(250px, 30vw);
    min-width: 200px;
  }

  .left-panel {
    left: 5px;
  }

  .right-panel {
    right: 5px;
  }
}

/* 极小屏幕适配 */
@media (max-width: 480px) {
  .left-panel, .right-panel {
    width: min(220px, 35vw);
    min-width: 180px;
  }

  .left-panel {
    left: 2px;
  }

  .right-panel {
    right: 2px;
  }
}
</style>



