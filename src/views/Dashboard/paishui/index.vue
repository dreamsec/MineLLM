<template>
  <div class="dashboard-container" >
    <!-- 顶部标题区 -->
    <div class="dashboard-header">
		<img src="@/assets/img/up.png" class="header-bg" alt="header-bg" />
		<div class="header-title">排水机孪生平台</div>
	</div>


    <!-- 主体内容区 -->
    <div class="dashboard-main">
      <!-- 中央3D区域 - 布满整个页面 -->
      <div class="center-panel">
        <iframe
          src="/waterMachine/index.html"
          style="width:100%; height:100%; border:none; background:transparent; overflow:hidden;"
          allowfullscreen
          scrolling="no"
        ></iframe>
      </div>

      <!-- 左侧数据区 - 透明浮层 -->
      <div class="left-panel">
        <!-- 基本运行数据 -->
        <div class="panel-section">
          <div class="section-title">
            <span class="title-text">基本运行数据</span>
            <div class="title-line"></div>
          </div>
          <div class="data-cards">
            <div class="data-card" v-for="item in basicItems" :key="item.key">
              <div class="card-icon">⚡</div>
              <div class="card-content">
                <div class="card-value">{{ item.value }}<span v-if="item.unit"> {{ item.unit }}</span></div>
                <div class="card-label">{{ item.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 泵状态数据 -->
        <div class="panel-section">
          <div class="section-title">
            <span class="title-text">泵状态数据</span>
            <div class="title-line"></div>
          </div>
          <div class="data-cards">
            <div class="data-card" v-for="item in pumpItems" :key="item.key">
              <div class="card-icon">💧</div>
              <div class="card-content">
                <div class="card-value">{{ item.value }}<span v-if="item.unit"> {{ item.unit }}</span></div>
                <div class="card-label">{{ item.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 压力数据 -->
        <div class="panel-section">
          <div class="section-title">
            <span class="title-text">压力数据</span>
            <div class="title-line"></div>
          </div>
          <div class="data-cards">
            <div class="data-card" v-for="item in pressureItems" :key="item.key">
              <div class="card-icon">📊</div>
              <div class="card-content">
                <div class="card-value">{{ item.value }}<span v-if="item.unit"> {{ item.unit }}</span></div>
                <div class="card-label">{{ item.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧数据区 - 透明浮层 -->
      <div class="right-panel">
        <!-- 电机数据 -->
        <div class="panel-section">
          <div class="section-title">
            <span class="title-text">电机数据</span>
            <div class="title-line"></div>
          </div>
          <div class="data-cards">
            <div class="data-card" v-for="item in motorItems" :key="item.key">
              <div class="card-icon">🔧</div>
              <div class="card-content">
                <div class="card-value">{{ item.value }}<span v-if="item.unit"> {{ item.unit }}</span></div>
                <div class="card-label">{{ item.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 阀门状态 -->
        <div class="panel-section">
          <div class="section-title">
            <span class="title-text">阀门状态</span>
            <div class="title-line"></div>
          </div>
          <div class="data-cards">
            <div class="data-card" v-for="item in valveItems" :key="item.key">
              <div class="card-icon">🚪</div>
              <div class="card-content">
                <div class="card-value">{{ item.value }}<span v-if="item.unit"> {{ item.unit }}</span></div>
                <div class="card-label">{{ item.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 运行状态 -->
        <div class="panel-section">
          <div class="section-title">
            <span class="title-text">运行状态</span>
            <div class="title-line"></div>
          </div>
          <div class="data-cards">
            <div class="data-card" v-for="item in statusItems" :key="item.key">
              <div class="card-icon">✅</div>
              <div class="card-content">
                <div class="card-value">{{ item.value }}<span v-if="item.unit"> {{ item.unit }}</span></div>
                <div class="card-label">{{ item.label }}</div>
              </div>
            </div>
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

import {ref, onMounted, onUnmounted, computed} from 'vue'
import { getRealtimeDataApi } from '@/api/device'
import type { PumpRealtimeData } from '@/api/device/types/device'

const pumpData = ref<PumpRealtimeData | null>(null)
// 格式化状态值显示
const formatStatusValue = (value: number | undefined | null): string => {
  if (value === null || value === undefined) return '--'
  return value === 1 ? '正常' : value === 0 ? '异常' : String(value)
}

// 格式化时间值显示
const formatTimeValue = (hours: number | undefined | null, minutes: number | undefined | null): string => {
  if (hours === null || hours === undefined) return '--'
  if (minutes === null || minutes === undefined) return `${hours}h`
  return `${hours}h ${minutes}m`
}

// 基本运行数据
const basicDefs = [
  { key: 'voltage', label: '电压', unit: 'V' },
  { key: 'current', label: '电流', unit: 'A' },
  { key: 'current_fault', label: '电流故障', unit: '', formatter: formatStatusValue },
  { key: 'pump_run_feedback', label: '泵运行反馈', unit: '', formatter: formatStatusValue }
] as const

// 泵状态数据
const pumpDefs = [
  { key: 'pump_fault', label: '泵故障', unit: '', formatter: formatStatusValue },
  { key: 'pump_emergency_fault', label: '泵紧急故障', unit: '', formatter: formatStatusValue },
  { key: 'pump_overheat_fault', label: '泵过热故障', unit: '', formatter: formatStatusValue },
  { key: 'vibration_fault', label: '振动故障', unit: '', formatter: formatStatusValue }
] as const

// 压力数据
const pressureDefs = [
  { key: 'pos_pressure', label: '正压', unit: 'MPa' },
  { key: 'neg_pressure', label: '负压', unit: 'MPa' },
  { key: 'pos_pressure_fault', label: '正压故障', unit: '', formatter: formatStatusValue },
  { key: 'neg_pressure_fault', label: '负压故障', unit: '', formatter: formatStatusValue }
] as const

// 电机数据
const motorDefs = [
  { key: 'motor_front_axis_temp', label: '电机前温度', unit: '°C' },
  { key: 'motor_rear_axis_temp', label: '电机后温度', unit: '°C' },
  { key: 'motor_phase_a_temp', label: 'A相温度', unit: '°C' },
  { key: 'motor_phase_b_temp', label: 'B相温度', unit: '°C' },
  { key: 'motor_phase_c_temp', label: 'C相温度', unit: '°C' },
  { key: 'motor_vibration_1', label: '电机振动1', unit: 'mm/s' },
  { key: 'motor_vibration_2', label: '电机振动2', unit: 'mm/s' },
  { key: 'motor_overheat_fault', label: '电机过热故障', unit: '', formatter: formatStatusValue }
] as const

// 阀门状态
const valveDefs = [
  { key: 'main_valve_opening', label: '主阀开度', unit: '%' },
  { key: 'main_valve_open', label: '主阀开启', unit: '', formatter: formatStatusValue },
  { key: 'main_valve_closed', label: '主阀关闭', unit: '', formatter: formatStatusValue },
  { key: 'main_valve_open_fault', label: '主阀开启故障', unit: '', formatter: formatStatusValue },
  { key: 'main_valve_closed_fault', label: '主阀关闭故障', unit: '', formatter: formatStatusValue },
  { key: 'main_valve_overload_fault', label: '主阀过载故障', unit: '', formatter: formatStatusValue },
  { key: 'jet_ball_valve_status', label: '喷射球阀状态', unit: '', formatter: formatStatusValue }
] as const

// 运行状态
const statusDefs = [
  { key: 'runtime_hours', label: '累计运行', unit: 'h' },
  { key: 'runtime_minutes', label: '运行分钟', unit: 'm' },
  { key: 'total_fault', label: '总故障数', unit: '次' },
  { key: 'device_stop_status', label: '设备停止状态', unit: '', formatter: formatStatusValue },
  { key: 'maintenance_status', label: '维护状态', unit: '', formatter: formatStatusValue },
  { key: 'remote_status', label: '远程状态', unit: '', formatter: formatStatusValue },
  { key: 'local_status', label: '本地状态', unit: '', formatter: formatStatusValue },
  { key: 'semi_auto_status', label: '半自动状态', unit: '', formatter: formatStatusValue }
] as const

// 计算各数据面板的展示数据
const createItemsComputed = (defs: readonly { key: string; label: string; unit: string; formatter?: (value: any) => string }[]) => {
  return computed(() => defs.map(def => ({
    ...def,
    value: pumpData.value?.[def.key as keyof PumpRealtimeData] == null
      ? '--'
      : def.formatter
        ? def.formatter(pumpData.value[def.key as keyof PumpRealtimeData])
        : String(pumpData.value[def.key as keyof PumpRealtimeData])
  })))
}

// 生成各面板的计算属性
const basicItems = createItemsComputed(basicDefs)
const pumpItems = createItemsComputed(pumpDefs)
const pressureItems = createItemsComputed(pressureDefs)
const motorItems = createItemsComputed(motorDefs)
const valveItems = createItemsComputed(valveDefs)
const statusItems = createItemsComputed(statusDefs)

let refreshTimer: number | undefined
async function loadRealtime() {
  try {
    const res = await getRealtimeDataApi('PS001')
    pumpData.value = res.data as PumpRealtimeData
  } catch (e) {}
}




onMounted(() => {
  loadRealtime()
  /*refreshTimer = window.setInterval(loadRealtime, 3000)*/
})

/*onUnmounted(() => {
  if (refreshTimer) window.clearInterval(refreshTimer)
})*/
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 全局隐藏滚动条 */
/*
* {
  scrollbar-width: thin;
  -ms-overflow-style: none;
}

*::-webkit-scrollbar {
  width: 6px;
}

*::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

*::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

*::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}*/

.dashboard-container {
  width: 100%;
  height: 100vh;
  background: #001440;
  color: #ffffff;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
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
  /*background: url('@/assets/img/239.png') left;*/
  background-size: cover;
  width: min(320px, 22vw);
  min-width: 250px;
  max-width: 350px;
  height: auto;
  max-height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 12px 14px 12px 18px;
  position: absolute;
  top: 50px;
  left: 15px;
  z-index: 10;
  overflow: visible;
}

.left-panel::-webkit-scrollbar {
	display: none; /* Chrome, Safari and Opera */
}

.right-panel {
  /*background: url('@/assets/img/240.png') right;*/
  background-size: cover;
  width: min(320px, 22vw);
  min-width: 250px;
  max-width: 350px;
  height: auto;
  max-height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 12px 18px 12px 14px;
  position: absolute;
  top: 50px;
  right: 15px;
  z-index: 10;
  overflow: visible;
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

.panel-section1,
.panel-section {
  padding: 10px;
  backdrop-filter: blur(8px);
  height: auto;
  flex: 0 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid rgba(0, 188, 212, 0.25);
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(0, 188, 212, 0.08), rgba(0, 188, 212, 0.04));
  box-shadow: 0 8px 18px rgba(0,0,0,0.25), inset 0 0 30px rgba(0, 188, 212, 0.06);
}

/* 数据卡片 */
.data-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  flex: 1; /* 使卡片区域能够扩展和收缩 */
  min-height: 80px; /* 设置最小高度，确保至少能显示2行卡片 */
  overflow-y: visible; /* 自身不滚动，交给父容器滚动 */
  overflow-x: hidden; /* 隐藏水平滚动条 */
  align-content: start; /* 卡片从顶部开始排列 */
}

:deep(.right-panel .data-cards) {
  scrollbar-width: none; /* Firefox 隐藏滚动条外观 */
  -ms-overflow-style: none; /* IE/Edge 隐藏滚动条外观 */
}
:deep(.right-panel .data-cards::-webkit-scrollbar) {
  display: none; /* WebKit 隐藏滚动条外观 */
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  position: sticky;
  top: 0;
  background: url('@/assets/img/225.png') no-repeat center, linear-gradient(180deg, rgba(0, 188, 212, 0.12), rgba(0, 188, 212, 0.08));
  background-size: cover;
  text-align: center;
  z-index: 10;
  padding: 4px 0;
  border-radius: 6px;
  backdrop-filter: blur(10px);
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

.title-line {
  width: 80%;
  height: 2px;
  margin-top: 6px;
  background: linear-gradient(90deg, rgba(0, 188, 212, 0.6), rgba(0, 188, 212, 0));
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



.data-card {
  background: rgba(0, 14, 212, 0.08);
  border: 1px solid rgba(0, 188, 212, 0.25);
  border-radius: 10px;
  padding: 10px 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: auto;
  min-height: 56px;
  backdrop-filter: blur(6px);
}

.card-icon {
  font-size: 20px;
  color: #8fd6ff;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: clamp(16px, 2.2vw, 20px);
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 2px;
  word-break: break-word;
}

/* 状态文字颜色 */
.card-label:contains('故障') + .card-value {
  color: #ff4d4f !important;
}

.card-label:contains('正常') + .card-value {
  color: #52c41a !important;
}

.card-label {
  font-size: clamp(11px, 1.4vw, 13px);
  color: #ffffff;
  margin-bottom: 1px;
  line-height: 1.2;
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



