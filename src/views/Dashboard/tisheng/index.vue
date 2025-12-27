<template>
  <div class="dashboard-container">
    <!-- 顶部标题区 -->
    <div class="dashboard-header">
      <img src="@/assets/img/up.png" class="header-bg" alt="header-bg" />
      <div class="header-title">提升机孪生平台</div>
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
            <span class="title-text">提升机实时数据</span>
            <div class="title-line"></div>
          </div>
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

import { ref, onMounted, onUnmounted, computed } from 'vue'
import { getRealtimeDataApi } from '@/api/device'
import type { HoistRealtimeData } from '@/api/device/types/device'

// ----------------------------------------------------------------------
// 1. Unity 配置 (假设路径在 /NewElevator/Build/ 下)
// ----------------------------------------------------------------------
const UNITY_CONFIG = {
  loaderUrl: "/NewElevator/Build/NewElevator.loader.js", // 请确认文件名
  dataUrl: "/NewElevator/Build/NewElevator.data",       // 请确认文件名
  frameworkUrl: "/NewElevator/Build/NewElevator.framework.js", // 请确认文件名
  codeUrl: "/NewElevator/Build/NewElevator.wasm",       // 请确认文件名
  streamingAssetsUrl: "StreamingAssets",
  productVersion: "0.1",
  companyName: "DefaultCompany",
  productName: "My Project",
}

const UNITY_TARGET_OBJ = "SendMessageelevator" // ★请确认Unity场景中接收数据的物体名称
const UNITY_METHOD_NAME = "UpdateelevatorTexts"     // ★请确认Unity脚本中接收数据的函数名称

declare global {
  interface Window {
    createUnityInstance: any;
  }
}

// ----------------------------------------------------------------------
// 2. 业务数据定义
// ----------------------------------------------------------------------
const hoistData = ref<HoistRealtimeData | null>(null)

const leftDefs = [
  { key: 'actual_speed', label: '实际速度', unit: 'm/s' },
  { key: 'speed_setpoint', label: '设定速度', unit: 'm/s' },
  { key: 'guide_wheel_speed', label: '导向轮速度', unit: 'm/s' },
  { key: 'deceleration', label: '减速度', unit: '' },
  { key: 'speed_diff', label: '速度差', unit: '' },
  { key: 'travel_diff', label: '行程差', unit: 'm' },
  { key: 'load_weight', label: '载重', unit: 't' },
  { key: 'motor_current', label: '电机电流', unit: 'A' },
  { key: 'brake_air_pressure', label: '制动气压', unit: 'MPa' },
  { key: 'brake_oil_pressure', label: '制动油压', unit: 'MPa' },
  { key: 'brake_oil_temp', label: '制动油温', unit: '°C' },
  { key: 'wellhead_temp', label: '井口温度', unit: '°C' },
  { key: 'motor_temp_max', label: '电机最高温度', unit: '°C' },
  { key: 'sheave_temp_max', label: '天轮最高温度', unit: '°C' },
  { key: 'main_shaft_temp_max', label: '主轴最高温度', unit: '°C' }
] as const
const rightDefs = [
  { key: 'plc_speed_1', label: 'PLC速度1', unit: 'm/s' },
  { key: 'plc_speed_2', label: 'PLC速度2', unit: 'm/s' },
  { key: 'speed_1', label: '速度1', unit: 'm/s' },
  { key: 'speed_2', label: '速度2', unit: 'm/s' },
  { key: 'speed_3', label: '速度3', unit: 'm/s' },
  { key: 'speed_4', label: '速度4', unit: 'm/s' },
  { key: 'vice_skip_depth', label: '副罐笼深度', unit: 'm' },
  { key: 'vice_skip_overwind', label: '副罐笼过卷', unit: 'm' },
  { key: 'vice_skip_deceleration_point', label: '副罐笼减速点', unit: 'm' },
  { key: 'vice_skip_stop_point', label: '副罐笼停车点', unit: 'm' },
  { key: 'vice_skip_monitor_2m', label: '副罐笼监控2m', unit: 'm' },
  { key: 'main_skip_depth', label: '主罐笼深度', unit: 'm' },
  { key: 'main_skip_overwind', label: '主罐笼过卷', unit: 'm' },
  { key: 'main_skip_stop_point', label: '主罐笼停车点', unit: 'm' },
  { key: 'main_skip_deceleration_point', label: '主罐笼减速点', unit: 'm' },
  { key: 'main_skip_monitor_2m', label: '主罐笼监控2m', unit: 'm' },
  { key: 'auto_run', label: '自动运行', unit: '' },
  { key: 'semi_auto_run', label: '半自动运行', unit: '' },
  { key: 'simple_run', label: '简易运行', unit: '' },
  { key: 'manual_run', label: '手动运行', unit: '' },
  { key: 'repair_mode', label: '检修模式', unit: '' },
  { key: 'emergency_stop', label: '急停', unit: '' },
  { key: 'fault_stop', label: '故障停机', unit: '' },
  { key: 'fault_alarm', label: '故障报警', unit: '' },
  { key: 'start_condition_insufficient', label: '启动条件不足', unit: '' },
  { key: 'lift_person', label: '提升人员', unit: '' },
  { key: 'lift_material', label: '提升物料', unit: '' },
  { key: 'handle_zero_position', label: '手柄零位', unit: '' },
  { key: 'handle_set_speed_check', label: '手柄设定速度校验', unit: '' },
  { key: 'excitation_merge', label: '励磁合闸', unit: '' },
  { key: 'excitation_current', label: '励磁电流', unit: 'A' },
  { key: 'signal_0', label: '信号0', unit: '' },
  { key: 'signal_2', label: '信号2', unit: '' },
  { key: 'signal_3', label: '信号3', unit: '' },
  { key: 'signal_4', label: '信号4', unit: '' },
  { key: 'signal_5', label: '信号5', unit: '' },
  { key: 'motor_temp_1', label: '电机温度1', unit: '°C' },
  { key: 'motor_temp_2', label: '电机温度2', unit: '°C' },
  { key: 'motor_temp_3', label: '电机温度3', unit: '°C' },
  { key: 'motor_temp_4', label: '电机温度4', unit: '°C' },
  { key: 'motor_temp_5', label: '电机温度5', unit: '°C' },
  { key: 'motor_temp_6', label: '电机温度6', unit: '°C' },
  { key: 'motor_temp_7', label: '电机温度7', unit: '°C' },
  { key: 'motor_temp_8', label: '电机温度8', unit: '°C' },
  { key: 'motor_temp_9', label: '电机温度9', unit: '°C' },
  { key: 'motor_temp_10', label: '电机温度10', unit: '°C' },
  { key: 'motor_temp_11', label: '电机温度11', unit: '°C' },
  { key: 'motor_temp_12', label: '电机温度12', unit: '°C' },
  { key: 'sheave_temp_1', label: '天轮温度1', unit: '°C' },
  { key: 'sheave_temp_2', label: '天轮温度2', unit: '°C' },
  { key: 'sheave_temp_3', label: '天轮温度3', unit: '°C' },
  { key: 'sheave_temp_4', label: '天轮温度4', unit: '°C' },
  { key: 'sheave_temp_5', label: '天轮温度5', unit: '°C' },
  { key: 'sheave_temp_6', label: '天轮温度6', unit: '°C' },
  { key: 'sheave_temp_7', label: '天轮温度7', unit: '°C' },
  { key: 'sheave_temp_8', label: '天轮温度8', unit: '°C' },
  { key: 'main_shaft_temp_1', label: '主轴温度1', unit: '°C' },
  { key: 'main_shaft_temp_2', label: '主轴温度2', unit: '°C' },
  { key: 'main_shaft_temp_3', label: '主轴温度3', unit: '°C' },
  { key: 'main_shaft_temp_4', label: '主轴温度4', unit: '°C' }
] as const
const leftItems = computed(() => leftDefs.map(def => ({
  ...def,
  value: hoistData.value?.[def.key as keyof HoistRealtimeData] == null
    ? '--'
    : String(hoistData.value?.[def.key as keyof HoistRealtimeData])
})))

const rightItems = computed(() => rightDefs.map(def => ({
  ...def,
  value: hoistData.value?.[def.key as keyof HoistRealtimeData] == null
    ? '--'
    : String(hoistData.value?.[def.key as keyof HoistRealtimeData])
})))

// ----------------------------------------------------------------------
// 3. Unity 交互逻辑
// ----------------------------------------------------------------------
const canvasRef = ref<HTMLCanvasElement | null>(null)
let unityInstance: any = null
let refreshTimer: number | undefined

/**
 * 格式化数据发送给 Unity
 * 示例格式：主罐深度|副罐深度|实际速度|载重|模式(自动/手动/检修)|报警状态
 */
function formatDataForUnity(data: HoistRealtimeData): string {
  if (!data) return "";

  const values = [
    // --- 电机部分 (Motor) ---
    data.motor_current || 0,        // 0: 电机电流
    data.excitation_current || 0,   // 1: 励磁电流
    data.motor_temp_max || 0,       // 2: 电机最高温度

    // --- 天轮部分 (Sheave) ---
    data.sheave_temp_max || 0,      // 3: 天轮最高温度
    data.main_shaft_temp_max || 0,  // 4: 主轴最高温度
    data.brake_oil_pressure || 0,   // 5: 制动油压

    // --- 笼罐部分 (Cage/Skip) ---
    data.main_skip_depth || 0,      // 6: 主罐深度
    data.vice_skip_depth || 0,      // 7: 副罐深度
    data.actual_speed || 0,         // 8: 实际速度
    data.load_weight || 0,          // 9: 载重

    // 状态位 (0或1)
    data.auto_run ? 1 : 0,          // 10: 自动
    data.fault_alarm ? 1 : 0,       // 11: 报警
    data.manual_run ? 1 : 0         // 12: 手动
  ];

  // 拼接字符串：电机 | 天轮 | 笼罐
  return "电机电流:" + values[0] + "A,励磁电流:" + values[1] + "A,电机最高温度:" + values[2] + "°C|天轮最高温度:" + values[3] + "°C,主轴最高温度:" + values[4] + "°C,制动油压:" + values[5] + "MPa|主罐深度:" + values[6] + "m,副罐深度:" + values[7] + "m,实际速度:" + values[8] + "m/s,载重:" + values[9] + "t,自动运行:" + values[10] + ",故障报警:" + values[11];
}

async function loadRealtime() {
  try {
    const res = await getRealtimeDataApi('TS001')
    const data = res.data as HoistRealtimeData
    hoistData.value = data

    // 同步数据到 Unity
    if (unityInstance) {
      const msg = formatDataForUnity(data)
      // console.log("Sending to Unity:", msg)
      unityInstance.SendMessage(UNITY_TARGET_OBJ, UNITY_METHOD_NAME, msg)
    }
  } catch (e) {
    console.error(e)
  }
}

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
          console.log("Unity Loaded Successfully")
          unityInstance = instance
          // 加载完成后立即发送一次数据
          if (hoistData.value) {
            const msg = formatDataForUnity(hoistData.value)
            unityInstance.SendMessage(UNITY_TARGET_OBJ, UNITY_METHOD_NAME, msg)
          }
        })
        .catch((err: any) => {
          console.error("Unity Load Error:", err)
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
  loadRealtime()
  initUnity()
  refreshTimer = window.setInterval(loadRealtime, 1000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = undefined
  }
  if (unityInstance) {
    unityInstance = null
  }
})
</script>
<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 全局隐藏滚动条（注释以允许显示滚动条） */
/*
* {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

*::-webkit-scrollbar {
  display: none;
}

html, body {
  overflow: hidden;
}

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
*/

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
  /*background: #001440  url('@/assets/img/239.png') left; /* 设置背景图片，图片靠左对齐 */
  background-size: cover; /* 背景图片覆盖整个面板 */
  width: min(320px, 22vw); /* 面板宽度，取320px和屏幕宽度22%中的较小值 */
  min-width: 250px; /* 面板最小宽度为250px */
  max-width: 350px; /* 面板最大宽度为350px */
  height: calc(100vh - 190px); /* 面板高度，等于整个屏幕高度减去190px */
  display: flex; /* 使用弹性布局 */
  flex-direction: column; /* 弹性布局方向为垂直方向 */
  gap: 15px; /* 面板内元素之间的间距为15px */
  margin: 0; /* 外边距为0 */
  padding: 15px 15px 15px 25px; /* 内边距：上下左右分别为15px、15px、15px、25px */
  position: absolute; /* 绝对定位 */
  top: 60px; /* 距离顶部60px */
  left: 15px; /* 距离左侧15px */
  z-index: 10; /* 层级为10，确保面板显示在其他元素上方 */
  overflow-y: auto; /* 当内容超出面板高度时，允许垂直滚动 */
  scrollbar-width: none; /* Firefox浏览器隐藏滚动条 */
  -ms-overflow-style: none; /* IE和Edge浏览器隐藏滚动条 */
}

/* .left-panel::-webkit-scrollbar { display: none; } */

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
	overflow-y: auto;
	scrollbar-width: auto;
	-ms-overflow-style: auto;
}

.right-panel::-webkit-scrollbar {
    width: 8px;
}
.right-panel::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 8px;
}
.right-panel::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.25);
    border-radius: 8px;
}

.center-panel {
  position: relative;
  top: 0;
  left: 0;
  width: 100%; /* 使用100%宽度自适应父容器 */
  height: 100%;
  z-index: 1; /* 确保3D模型在底层 */
  overflow: hidden;
}

.fullscreen-btn {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s ease;
}

/* 全屏模式样式 - 隐藏布局组件 */
.fullscreen-mode .layout-container .header,
.fullscreen-mode .layout-container .sidebar {
  display: none !important;
}

/* 全屏模式下主内容区占满屏幕 */
.fullscreen-mode .layout-container .main-content {
  margin: 0 !important;
  padding: 0 !important;
  height: 100vh !important;
  overflow: hidden;
}

/* 确保全屏模式下#app元素高度正确 */
.fullscreen-mode #app {
  height: 100vh !important;
  overflow: hidden;
}

.fullscreen-btn:hover {
  background-color: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.fullscreen-btn:active {
  transform: scale(0.95);
}

/* 全屏状态下的样式 */
:fullscreen .center-panel,
:-webkit-full-screen .center-panel,
:-moz-full-screen .center-panel,
:-ms-fullscreen .center-panel {
  width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
}

:fullscreen .center-panel iframe,
:-webkit-full-screen .center-panel iframe,
:-moz-full-screen .center-panel iframe,
:-ms-fullscreen .center-panel iframe {
  width: 100vw !important;
  height: 100vh !important;
}

.fullscreen-btn svg {
  transition: transform 0.3s ease;
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

.data-card {
  background: #001440;
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



