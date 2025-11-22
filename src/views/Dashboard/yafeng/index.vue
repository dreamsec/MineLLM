<template>
  <div class="dashboard-container">
    <!-- 顶部标题区 -->
    <div class="dashboard-header">
      <img src="@/assets/img/up.png" class="header-bg" alt="header-bg" />
      <div class="header-title">煤矿井下自供能安全监测系统</div>
    </div>

    <!-- 主体内容区 -->
    <div class="dashboard-main">

      <!-- 中央3D区域 - 改为 Canvas -->
      <div class="center-panel">
        <canvas
          ref="canvasRef"
          id="unity-canvas"
          style="width: 100%; height: 100%; background: transparent;"
        ></canvas>
      </div>

      <!-- 左侧数据区 - 透明浮层 -->
      <div class="left-panel">
        <div class="panel-section1">
          <div class="section-title1">
            <span class="title-text">压风机实时数据</span>
            <div class="title-line"></div>
          </div>
          <!-- 数据卡片组 -->
          <div class="data-cards">
            <div class="data-card" v-for="item in leftItems" :key="item.key">
              <div class="card-icon">⚙️</div>
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
        <div class="panel-section1">
          <div class="section-title1">
            <span class="title-text">运行参数</span>
            <div class="title-line"></div>
          </div>
          <div class="data-cards">
            <div class="data-card" v-for="item in rightItems" :key="item.key">
              <div class="card-icon">🔧</div>
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
defineOptions({
  name: 'DashboardIndex'
})

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getRealtimeDataApi } from '@/api/device'
import type { CompressorRealtimeData } from '@/api/device/types/device'

// ----------------------------------------------------------------------
// 1. Unity 配置区域 (请根据实际打包生成的文件名修改)
// ----------------------------------------------------------------------
// 假设你的 Unity 打包输出在 /CompressorFan/Build/ 目录下，且文件名通常与文件夹一致
const UNITY_CONFIG = {
  loaderUrl: "/CompressorFan/Build/CompressorFan.loader.js",
  dataUrl: "/CompressorFan/Build/CompressorFan.data",
  frameworkUrl: "/CompressorFan/Build/CompressorFan.framework.js",
  codeUrl: "/CompressorFan/Build/CompressorFan.wasm",
  streamingAssetsUrl: "StreamingAssets",
  productVersion: "0.1",
  companyName: "DefaultCompany",
  productName: "Myproject", // 对应 Unity 设置的 ProductName
}

// ★★★ 注意：这里的对象名和方法名必须与 Unity C# 脚本中挂载的 GameObject 和方法名一致 ★★★
const UNITY_TARGET_OBJ = "SendMessageYaFeng" // Unity场景中挂载脚本的物体名称
const UNITY_METHOD_NAME = "UpdateTMPTexts"   // Unity脚本中接收字符串的 public 方法名

declare global {
  interface Window {
    createUnityInstance: any;
  }
}

// ----------------------------------------------------------------------
// 2. 业务数据定义
// ----------------------------------------------------------------------
const compressorData = ref<CompressorRealtimeData | null>(null)

const leftDefs = [
  { key: 'exhaust_pressure', label: '排气压力', unit: 'MPa' },
  { key: 'voltage', label: '电压', unit: 'V' },
  { key: 'current', label: '电流', unit: 'A' },
  { key: 'unit_exhaust_temp', label: '机组排气温度', unit: '°C' },
  { key: 'main_exhaust_temp', label: '主排气温度', unit: '°C' },
  { key: 'running_temp', label: '运行温度', unit: '°C' },
  { key: 'coolant_temp', label: '冷却液温度', unit: '°C' },
  { key: 'intake_vacuum', label: '进气真空', unit: 'kPa' },
  { key: 'separation_pressure', label: '分离压力', unit: 'MPa' },
  { key: 'separation_diff_pressure', label: '分离差压', unit: 'MPa' }
] as const

const rightDefs = [
  { key: 'standby_status', label: '待机状态', unit: '' },
  { key: 'current_run_time', label: '当前运行时长', unit: 'h' },
  { key: 'motor_vibration', label: '电机振动', unit: 'mm/s' },
  { key: 'main_vibration', label: '主振动', unit: 'mm/s' },
  { key: 'analog_alarm_airbag_temp', label: '模拟报警气囊温度', unit: '°C' },
  { key: 'analog_current_airbag_temp', label: '模拟电流气囊温度', unit: '°C' }
] as const

const leftItems = computed(() => leftDefs.map(def => ({
  ...def,
  value: compressorData.value?.[def.key as keyof CompressorRealtimeData] == null
    ? '--'
    : String(compressorData.value?.[def.key as keyof CompressorRealtimeData])
})))

const rightItems = computed(() => rightDefs.map(def => ({
  ...def,
  value: compressorData.value?.[def.key as keyof CompressorRealtimeData] == null
    ? '--'
    : String(compressorData.value?.[def.key as keyof CompressorRealtimeData])
})))

// ----------------------------------------------------------------------
// 3. Unity 集成与核心逻辑
// ----------------------------------------------------------------------
const canvasRef = ref<HTMLCanvasElement | null>(null)
let unityInstance: any = null
let refreshTimer: number | undefined

/**
 * 将业务数据拼接成 Unity 约定的字符串格式
 * 例如: "0.8|220|15|..." 或者 JSON 字符串，取决于 C# 怎么解析
 */
function formatDataForUnity(data: CompressorRealtimeData): string {
  if (!data) return "";

  // 示例：简单拼接，实际请根据 Unity 需求调整
  // 这里演示将所有数值用竖线 | 分隔
  const values = [
    data.voltage || 0,
    data.current || 0,
    data.main_vibration || 0,
    data.motor_vibration || 0,

    data.exhaust_pressure || 0,
    data.running_temp || 0,
    data.main_exhaust_temp || 0,
    data.separation_pressure || 0,

  ];

  return "电压：" + values[0] + "V,电流：" + values[1] +  "A,主振动：" + values[2] + "mm/s,电机振动：" + values[3] + "mm/s|排气压力：" + values[4] + "Mpa,运行温度" + values[5] + "°C,主排气温度：" + values[6] + "°C,分离压力：" + values[7] + "Mpa";
}

/**
 * 获取数据并同步给 Unity
 */
async function loadRealtime() {
  try {
    const res = await getRealtimeDataApi('YF001')
    const data = res.data as CompressorRealtimeData
    compressorData.value = data

    // 如果 Unity 实例已加载，发送数据
    if (unityInstance) {
      const msg = formatDataForUnity(data)
      // console.log('发送数据给 Unity:', msg)
      unityInstance.SendMessage(UNITY_TARGET_OBJ, UNITY_METHOD_NAME, msg)
    }
  } catch (e) {
    console.error(e)
  }
}

/**
 * 初始化 Unity 实例
 */
function initUnity() {
  if (!canvasRef.value) return

  const script = document.createElement("script")
  script.src = UNITY_CONFIG.loaderUrl

  script.onload = () => {
    const config = {
      dataUrl: UNITY_CONFIG.dataUrl,
      frameworkUrl: UNITY_CONFIG.frameworkUrl,
      codeUrl: UNITY_CONFIG.codeUrl,
      streamingAssetsUrl: UNITY_CONFIG.streamingAssetsUrl,
      companyName: UNITY_CONFIG.companyName,
      productName: UNITY_CONFIG.productName,
      productVersion: UNITY_CONFIG.productVersion,
    }

    if (window.createUnityInstance) {
      window.createUnityInstance(canvasRef.value, config)
        .then((instance: any) => {
          console.log("Unity Load Success")
          unityInstance = instance
          // 加载完成后立即推送一次当前数据
          if (compressorData.value) {
            const msg = formatDataForUnity(compressorData.value)
            unityInstance.SendMessage(UNITY_TARGET_OBJ, UNITY_METHOD_NAME, msg)
          }
        })
        .catch((msg: any) => {
          console.error("Unity Load Error:", msg)
        })
    }
  }

  script.onerror = () => {
    console.error("Failed to load Unity loader:", UNITY_CONFIG.loaderUrl)
  }

  document.body.appendChild(script)
}

// ----------------------------------------------------------------------
// 4. 生命周期
// ----------------------------------------------------------------------
onMounted(() => {
  // 1. 先获取一次数据
  loadRealtime()

  // 2. 初始化 Unity
  initUnity()

  // 3. 开启轮询 (参考代码是3秒)
  // refreshTimer = window.setInterval(loadRealtime, 1000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = undefined
  }
  if (unityInstance) {
    // 释放引用，具体销毁逻辑视 Unity 版本和内存管理而定
    unityInstance = null
  }
})
</script>

<style scoped>
/* 保持原有样式，并增加部分适应性样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard-container {
  width: 100%;
  height: calc(100vh - 100px); /* 假设顶部有导航栏 */
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
  font-size: 32px;
  font-weight: bold;
  color: #fff;
  letter-spacing: 8px;
  text-shadow: 0 4px 16px #1e90ff, 0 1px 0 #000;
}

.dashboard-main {
  flex: 1;
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.center-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1; /* Unity 在底层 */
  overflow: hidden;
}

.left-panel, .right-panel {
  /* 使用 min/max 确保响应式 */
  width: min(320px, 22vw);
  min-width: 250px;
  height: calc(100vh - 190px);
  display: flex;
  flex-direction: column;
  gap: 15px;
  position: absolute;
  top: 80px;
  z-index: 10; /* 浮在 Unity 之上 */
  overflow-y: auto;
  scrollbar-width: none; /* Firefox 隐藏滚动条 */
}
.left-panel::-webkit-scrollbar, .right-panel::-webkit-scrollbar {
  display: none;
}

.left-panel {
  left: 15px;
}

.right-panel {
  right: 15px;
}

.panel-section1 {
  padding: 10px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 188, 212, 0.25);
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(0, 188, 212, 0.08), rgba(0, 188, 212, 0.04));
  box-shadow: 0 8px 18px rgba(0,0,0,0.25);
}

.section-title1 {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0 15px 0;
  background: url('@/assets/img/225.png') no-repeat center;
  background-size: cover;
  height: 40px;
}

.title-text {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
}

.data-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.data-card {
  background: rgba(0, 188, 212, 0.1);
  border: 1px solid rgba(0, 188, 212, 0.3);
  border-radius: 6px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-icon {
  font-size: 24px;
}

.card-content {
  flex: 1;
  overflow: hidden;
}

.card-value {
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
}

.card-label {
  font-size: 12px;
  color: #cccccc;
  white-space: nowrap;
}
</style>

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
  /*background: url('@/assets/img/239.png') left;*/
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
	/*background: url('@/assets/img/240.png') right; /* 修正背景图片方向 */
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
  padding: 10px;
  backdrop-filter: blur(8px);
  height: auto;
  flex: 0 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: visible;
  border: 1px solid rgba(0, 188, 212, 0.25);
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(0, 188, 212, 0.08), rgba(0, 188, 212, 0.04));
  box-shadow: 0 8px 18px rgba(0,0,0,0.25), inset 0 0 30px rgba(0, 188, 212, 0.06);
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
  overflow-y: visible;
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



