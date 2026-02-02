<template>
  <div class="dashboard-container" >
    <!-- 顶部标题区 -->
    <div class="dashboard-header">
			<img src="@/assets/img/up.png" class="header-bg" alt="header-bg" />
			<div class="header-title">煤矿运维大屏</div>
		</div>


    <!-- 主体内容区 -->
    <div class="dashboard-main">
      <!-- 左侧数据区 -->
      <div class="left-panel">
        <!-- 智慧园区数据展示 -->
        <div class="panel-section1">
          <div class="section-title">
            <span class="title-text">关键设备</span>
            <div class="title-line"></div>
          </div>

          <!-- 数据卡片组 -->
          <div class="data-cards">
            <div class="data-card">
              <div class="card-icon">🏢</div>
              <div class="card-content">
                <div class="card-value">13</div>
                <div class="card-label">设备总数</div>
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
                <div class="card-value">130</div>
                <div class="card-label">在线设备</div>
                <!-- <div class="card-unit">+1
                   <n-icon size="16">
                     <ArrowUpOutlined/>
                   </n-icon>
                </div> -->
              </div>
            </div>
            <div class="data-card">
              <div class="env-icon">🏢</div>
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



        <!-- 智慧园区数据展示 - 圆形图表 -->
        <div class="panel-section1">
          <div class="section-title">
            <span class="title-text">智慧园区数据展示</span>
            <div class="title-line"></div>
          </div>

          <div class="circle-charts">
            <div class="circle-chart">
              <div class="chart-circle">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" class="chart-bg"/>
                  <circle cx="50" cy="50" r="40" class="chart-fg" stroke-dasharray="251.2" stroke-dashoffset="50.24"/>
                </svg>
                <div class="chart-value">01</div>
              </div>
              <div class="chart-labels">
                <div class="chart-label">样本</div>
                <div class="chart-data">
                  <div>01机房网络设备</div>
                  <div>01机房网络设备</div>
                  <div>01机房网络设备</div>
                </div>
              </div>
            </div>
            <div class="circle-chart">
              <div class="chart-circle">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" class="chart-bg"/>
                  <circle cx="50" cy="50" r="40" class="chart-fg" stroke-dasharray="251.2" stroke-dashoffset="75.36"/>
                </svg>
                <div class="chart-value">01</div>
              </div>
              <div class="chart-labels">
                <div class="chart-label">数据监控</div>
                <div class="chart-data">
                  <div>3650</div>
                  <div>3650</div>
                  <div>3650</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- 中央3D区域 -->
      <div class="center-panel">
        <!-- <div class="building-3d">
          <img src="@/assets/img/3D.png" alt="3D建筑模型" class="building-model">
        </div> -->

      </div>

      <!-- 右侧数据区 -->
      <div class="right-panel">
        <!-- 智慧园区数据展示 -->
        <div class="panel-section1">
          <div class="section-title">
            <span class="title-text">环境监控</span>
            <div class="title-line"></div>
          </div>


          <div class="data-cards">
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

          <div class="chart-container">
            <div ref="chartRef" style="width: 100%; height: 200px"></div>
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
                  <div class="icon-label">主通风机#1</div>
                  <div class="icon-value">温度：65℃  运行：72h</div>
                </div>
                <div class="icon-unit">正常</div>
              </div>
            </div>
            <!-- <div class="icon-item">
              <div class="icon-3d">🏢</div>
              <div class="icon-info">
                <div class="info-left">
                  <div class="icon-label">采煤机#3</div>
                  <div class="icon-value">温度：65℃  运行：72h</div>
                </div>
                <div class="icon-unit orange">预警</div>
              </div>
            </div> -->
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

import {ref, watch,onMounted,onUnmounted} from 'vue'
import * as echarts from 'echarts'

const chartRef = ref(null)
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    const xData = ["运输机", "通风机", "压缩机", "水泵站", "输送机"]
    const percent = [81, 68, 51, 75, 95]

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
          textStyle: {
            color: '#fff'
          }
        }
      },
      yAxis: {
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

// 监听窗口大小变化，重新绘制图表
const resizeChart = () => {
  chart?.resize()
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

.dashboard-container {
  width: 100%;
  height: 100vh;
  background: #001440;
  color: #ffffff;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
}

/* 顶部标题区 */
/* .dashboard-header {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  background: linear-gradient(90deg, transparent 0%, rgba(0, 188, 212, 0.1) 50%, transparent 100%);
  border-bottom: 1px solid rgba(0, 188, 212, 0.3);
  position: relative;
} */

/* .dashboard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #00bcd4 50%, transparent 100%);
} */
.dashboard-header {
	position: relative;
	width: 100%;
	height: 100px;
	display: flex;
	align-items: center;
	justify-content: center;
  /* background: linear-gradient(rgba(10,26,42) 80%, rgba(10,26,42,0.9) 100%); */
}
.header-bg {
	position: absolute;
	left: 50%;
	top: 0;
	transform: translateX(-50%);
	width: 100%;
	height: 70px;
	object-fit: cover;
	z-index: 1;
	pointer-events: none;
}
.header-title {
	position: relative;
	z-index: 2;
  padding-top: 10px;
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

/*
.main-title {
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(45deg, #00bcd4, #ffffff, #00bcd4);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(0, 188, 212, 0.5);
  letter-spacing: 4px;
} */

/* 主体内容区 */
.dashboard-main {
  flex: 1;
  display: flex;
  padding: 10px 15px 15px 15px;
  gap: 20px;
}

.left-panel, .right-panel {
  background: linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(26, 35, 50, 0.8) 100%);
  border: 1px solid rgba(0, 188, 212, 0.3);
  border-radius: 8px;
  width: 350px;
  height: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 20px 20px 15px;
}

.center-panel {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 面板区域 */
.panel-section {
  background: linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(26, 35, 50, 0.8) 100%);
  border: 1px solid rgba(0, 188, 212, 0.3);
  border-radius: 8px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;
  text-align: center;
}

.title-text {
  color: #00bcd4;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px 20px;
  letter-spacing: 2px;
}

.title-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, #00bcd4 0%, transparent 100%);
}


/* KPI卡片 */
.kpi-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.kpi-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);

  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-small);
  transition: all 0.3s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.kpi-icon {
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.kpi-content {
  flex: 1;
}

.kpi-value {
  font-size: 20px;
  font-weight: bold;
  color: var(--text-primary);
  line-height: 1;
}

.kpi-label {
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 4px 0;
}

.kpi-trend {
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.kpi-trend.up {
  color: var(--success-color);
}

.kpi-trend.down {
  color: var(--error-color);
}
/* 数据卡片 */
.data-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.data-card {
  background: rgba(0, 188, 212, 0.1);
  border: 1px solid rgba(0, 188, 212, 0.3);
  border-radius: 6px;
  padding: 12px 1px 5px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 150PX;
}

.card-icon {
  font-size: 24px;
  color: #00bcd4;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 19px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 4px;
}

.card-label {
  font-size: 12px;
  color: #cccccc;
  margin-bottom: 2px;
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
  gap: 15px;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.progress-label {
  width: 60px;
  font-size: 12px;
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
  gap: 20px;
}

.circle-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.chart-circle {
  position: relative;
  width: 80px;
  height: 80px;
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
  margin-bottom: 5px;
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

.env-card {
  border-radius: 6px;
  padding: 12px 1px 5px 5px;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 150PX;
}
.env-icon {
  width: 70px;
  height: 70px;
  color: #00bcd4;
}

.env-content {
  flex: 1;
}
.env-icon {
  font-size: 24px;
  color: #00bcd4;
}

.env-value {
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 4px;
}

.env-label {
  font-size: 12px;
  color: #cccccc;
  margin-bottom: 2px;
}

.env-unit {
  font-size: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 5px;
  padding: 1px 6px;
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
  gap: 15px;
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


/* 响应式设计 */
@media (max-width: 1400px) {
  .left-panel, .right-panel {
    width: 300px;
  }

  .main-title {
    font-size: 28px;
  }

  .building-model {
    max-width: 400px;
    max-height: 300px;
  }
}

@media (max-width: 1200px) {
  .dashboard-main {
    flex-direction: column;
    gap: 15px;
  }

  .left-panel, .right-panel {
    width: 100%;
    flex-direction: row;
    gap: 15px;
  }

  .center-panel {
    height: 400px;
  }
}
</style>




