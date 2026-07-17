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
                <div class="card-value" :class="item.bool === null ? '' : item.bool ? 'value-true' : 'value-false'">
                  {{ item.display }}<span v-if="item.unit && item.bool === null"> {{ item.unit }}</span>
                </div>
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
                <div class="card-value" :class="item.bool === null ? '' : item.bool ? 'value-true' : 'value-false'">
                  {{ item.display }}<span v-if="item.unit && item.bool === null"> {{ item.unit }}</span>
                </div>
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
  name: 'TishengIndex'
})

import { ref, onMounted, onUnmounted, onActivated, onDeactivated, computed } from 'vue'
import { getRealtimeDataApi } from '@/api/device'
import type { HoistRealtimeData } from '@/api/device/types/device'
import { formatDecimal } from '@/utils/format'

// ----------------------------------------------------------------------
// 1. Unity 配置 (假设路径在 /NewElevator/Build/ 下)
// ----------------------------------------------------------------------
// Unity 文件重新打包后只需要修改这个版本号，用于绕过浏览器旧缓存。
const UNITY_BUILD_VERSION = "20260616"
const withUnityVersion = (url: string) => `${url}?v=${UNITY_BUILD_VERSION}`

const UNITY_CONFIG = {
  loaderUrl: withUnityVersion("/NewElevator/Build/NewElevator.loader.js"),
  dataUrl: withUnityVersion("/NewElevator/Build/NewElevator.data.unityweb"),
  frameworkUrl: withUnityVersion("/NewElevator/Build/NewElevator.framework.js.unityweb"),
  codeUrl: withUnityVersion("/NewElevator/Build/NewElevator.wasm.unityweb"),
  streamingAssetsUrl: "StreamingAssets",
  productVersion: "0.1",
  companyName: "DefaultCompany",
  productName: "My Project",
}

const UNITY_TARGET_OBJ = "elevator_car" // 主井提升机物体名称
const UNITY_TARGET_OBJ_VICE = "elevator_people" // 副并提升机（人员）物体名称
const UNITY_METHOD_NAME = "ReceiveDataFromWeb" // 脚本里的方法 ReceiveDataFromWeb

declare global {
  interface Window {
    createUnityInstance: (canvas: HTMLCanvasElement, config: Record<string, unknown>) => Promise<UnityInstance>;
  }
}

type UnityInstance = {
  SendMessage: (targetObject: string, methodName: string, param: string) => void;
}

// ----------------------------------------------------------------------
// 2. 业务数据定义
// ----------------------------------------------------------------------
const hoistData = ref<HoistRealtimeData | null>(null)

type BoolLike = boolean | number | string | null | undefined
function toBool(value: BoolLike): boolean | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase()
    if (v === '') return null
    if (v === '0' || v === 'false' || v === 'off' || v === 'no') return false
    if (v === '1' || v === 'true' || v === 'on' || v === 'yes') return true
  }
  return null
}

const booleanKeys = new Set<keyof HoistRealtimeData>([
  // 运行模式设置
  'mode_auto', 'mode_semi_auto', 'mode_manual', 'mode_repair', 'mode_lift_coal', 'mode_heavy_down', 'mode_light_load',
  // 运行状态反馈
  'status_moving_up', 'status_moving_down', 'status_slow_up', 'status_slow_down', 'status_stopped', 'dir_confirmed', 'main_fan_run',
  // 离散速度反馈
  'speed_fb_half', 'speed_fb_2', 'speed_fb_4', 'speed_fb_6', 'speed_fb_12',
  // 关键位置节点
  'pos_1_overwind', 'pos_1_stop', 'pos_1_decelerate', 'pos_1_monitor_2m', 'pos_1_sync_calib', 'skip_1_unload_pos',
  'pos_2_overwind', 'pos_2_stop', 'pos_2_decelerate', 'pos_2_monitor_2m', 'pos_2_sync_calib', 'skip_2_unload_pos',
  // 核心操作与回路状态
  'loop_safety_closed', 'loop_lock_closed', 'loop_stop_closed', 'handle_speed_zero', 'handle_brake_zero', 'console_lock',
])

// 故障类 key：true = 正常（无故障），false = 故障
const faultBooleanKeys = new Set<keyof HoistRealtimeData>([
  'fault_emergency_stop', 'fault_comm', 'fault_low_voltage', 'fault_high_voltage', 'fault_motor_overload', 'fault_motor_overspeed',
  'fault_temp_alarm', 'fault_temp_error', 'fault_brake_wear', 'fault_brake_deflection', 'fault_skip_jam'
])

function formatDisplayValue(key: keyof HoistRealtimeData, value: unknown): { display: string; bool: boolean | null } {
  if (value === null || value === undefined) return { display: '--', bool: null }
  if (booleanKeys.has(key) || faultBooleanKeys.has(key)) {
    const b = toBool(value as BoolLike)
    if (b === null) return { display: '--', bool: null }
    if (faultBooleanKeys.has(key)) {
      return { display: b ? '正常' : '故障', bool: b }
    }
    return { display: b ? '是' : '否', bool: b }
  }
  return { display: formatDecimal(value as number | string), bool: null }
}

const leftDefs = [
  // 模拟量核心运行数据
  { key: 'main_skip_speed', label: '主箕斗提升速度', unit: 'm/s' },
  { key: 'main_skip_pos', label: '主箕斗提升位置', unit: 'm' },
  { key: 'vice_skip_speed', label: '副箕斗提升速度', unit: 'm/s' },
  { key: 'vice_skip_pos', label: '副箕斗提升位置', unit: 'm' },
  { key: 'stator_current', label: '定子电流', unit: 'A' },
  { key: 'excitation_current', label: '励磁电流', unit: 'A' },
  { key: 'incoming_voltage', label: '进线电压', unit: 'V' },
  { key: 'brake_oil_pressure', label: '制动油压', unit: 'MPa' },

  // 温度监测
  { key: 'motor_temp_1', label: '电机温度1', unit: '°C' },
  { key: 'motor_temp_2', label: '电机温度2', unit: '°C' },
  { key: 'motor_temp_3', label: '电机温度3', unit: '°C' },
  { key: 'motor_temp_4', label: '电机温度4', unit: '°C' },
  { key: 'motor_temp_5', label: '电机温度5', unit: '°C' },
  { key: 'motor_temp_6', label: '电机温度6', unit: '°C' },
  { key: 'bearing_temp_1', label: '轴承温度1', unit: '°C' },
  { key: 'bearing_temp_2', label: '轴承温度2', unit: '°C' },
  { key: 'bearing_temp_3', label: '轴承温度3', unit: '°C' },
  { key: 'bearing_temp_4', label: '轴承温度4', unit: '°C' }
] as const
const rightDefs = [
  // 运行模式设置
  { key: 'mode_auto', label: '自动模式', unit: '' },
  { key: 'mode_semi_auto', label: '半自动模式', unit: '' },
  { key: 'mode_manual', label: '手动模式', unit: '' },
  { key: 'mode_repair', label: '检修模式', unit: '' },
  { key: 'mode_lift_coal', label: '提煤模式', unit: '' },
  { key: 'mode_heavy_down', label: '重物下放模式', unit: '' },
  { key: 'mode_light_load', label: '轻载模式', unit: '' },

  // 运行状态反馈
  { key: 'status_moving_up', label: '上行状态', unit: '' },
  { key: 'status_moving_down', label: '下行状态', unit: '' },
  { key: 'status_slow_up', label: '慢上状态', unit: '' },
  { key: 'status_slow_down', label: '慢下状态', unit: '' },
  { key: 'status_stopped', label: '停车状态', unit: '' },
  { key: 'dir_confirmed', label: '运行方向已确定', unit: '' },
  { key: 'main_fan_run', label: '主风机运行', unit: '' },

  // 离散速度反馈
  { key: 'speed_fb_half', label: '速度反馈0.5m/s', unit: '' },
  { key: 'speed_fb_2', label: '速度反馈2m/s', unit: '' },
  { key: 'speed_fb_4', label: '速度反馈4m/s', unit: '' },
  { key: 'speed_fb_6', label: '速度反馈6m/s', unit: '' },
  { key: 'speed_fb_12', label: '速度反馈12m/s', unit: '' },

  // 关键位置节点(1系统/主箕斗)
  { key: 'pos_1_overwind', label: '1系统过卷点', unit: '' },
  { key: 'pos_1_stop', label: '1系统停车点', unit: '' },
  { key: 'pos_1_decelerate', label: '1系统减速点', unit: '' },
  { key: 'pos_1_monitor_2m', label: '1系统2m/s检查点', unit: '' },
  { key: 'pos_1_sync_calib', label: '1系统同步校正点', unit: '' },
  { key: 'skip_1_unload_pos', label: '箕斗1在卸载位', unit: '' },

  // 关键位置节点(2系统/副箕斗)
  { key: 'pos_2_overwind', label: '2系统过卷点', unit: '' },
  { key: 'pos_2_stop', label: '2系统停车点', unit: '' },
  { key: 'pos_2_decelerate', label: '2系统减速点', unit: '' },
  { key: 'pos_2_monitor_2m', label: '2系统2m/s检查点', unit: '' },
  { key: 'pos_2_sync_calib', label: '2系统同步校正点', unit: '' },
  { key: 'skip_2_unload_pos', label: '箕斗2在卸载位', unit: '' },

  // 核心操作与回路状态
  { key: 'loop_safety_closed', label: '总安全回路已合', unit: '' },
  { key: 'loop_lock_closed', label: '闭锁回路已合', unit: '' },
  { key: 'loop_stop_closed', label: '停车回路已合', unit: '' },
  { key: 'handle_speed_zero', label: '速度手柄零位', unit: '' },
  { key: 'handle_brake_zero', label: '闸手柄零位', unit: '' },
  { key: 'console_lock', label: '操作台闭锁', unit: '' },

  // 综合故障与报警
  { key: 'fault_emergency_stop', label: '操作台急停', unit: '' },
  { key: 'fault_comm', label: '通讯故障', unit: '' },
  { key: 'fault_low_voltage', label: '低压故障', unit: '' },
  { key: 'fault_high_voltage', label: '高压故障', unit: '' },
  { key: 'fault_motor_overload', label: '电机超载', unit: '' },
  { key: 'fault_motor_overspeed', label: '电机超速', unit: '' },
  { key: 'fault_temp_alarm', label: '温度报警综合', unit: '' },
  { key: 'fault_temp_error', label: '温度故障综合', unit: '' },
  { key: 'fault_brake_wear', label: '闸瓦磨损', unit: '' },
  { key: 'fault_brake_deflection', label: '闸盘偏摆', unit: '' },
  { key: 'fault_skip_jam', label: '卡箕斗故障', unit: '' }
] as const
const leftItems = computed(() => leftDefs.map(def => {
  const raw = hoistData.value?.[def.key as keyof HoistRealtimeData]
  const { display, bool } = formatDisplayValue(def.key as keyof HoistRealtimeData, raw)
  return { ...def, display, bool }
}))

const rightItems = computed(() => rightDefs.map(def => {
  const raw = hoistData.value?.[def.key as keyof HoistRealtimeData]
  const { display, bool } = formatDisplayValue(def.key as keyof HoistRealtimeData, raw)
  return { ...def, display, bool }
}))

// ----------------------------------------------------------------------
// 3. Unity 交互逻辑
// ----------------------------------------------------------------------
const canvasRef = ref<HTMLCanvasElement | null>(null)
let unityInstance: UnityInstance | null = null
let refreshTimer: number | undefined

/**
 * 格式化数据发送给 Unity
 * 示例格式：电气参数|轴承与液压|箕斗位置速度|模式与故障
 */
function formatDataForUnity(data: HoistRealtimeData): string {
  if (!data) return "";

  const bool01 = (v: BoolLike) => (toBool(v) ? 1 : 0)
  const maxValue = (...values: Array<number | undefined>): number => {
    // 后端现在只给分项温度，这里取最大值给 Unity 做总览展示。
    return values.reduce<number>((max, value) => {
      const num = Number(value)
      return Number.isFinite(num) ? Math.max(max, num) : max
    }, 0)
  }
  const hasFault = [
    data.fault_emergency_stop,
    data.fault_comm,
    data.fault_low_voltage,
    data.fault_high_voltage,
    data.fault_motor_overload,
    data.fault_motor_overspeed,
    data.fault_temp_alarm,
    data.fault_temp_error,
    data.fault_brake_wear,
    data.fault_brake_deflection,
    data.fault_skip_jam
  ].some(item => toBool(item) === true)

  const values = [
    // --- 电气部分 ---
    data.stator_current || 0,       // 0: 定子电流
    data.excitation_current || 0,   // 1: 励磁电流
    data.incoming_voltage || 0,     // 2: 进线电压
    maxValue(data.motor_temp_1, data.motor_temp_2, data.motor_temp_3, data.motor_temp_4, data.motor_temp_5, data.motor_temp_6),

    // --- 轴承与液压部分 ---
    maxValue(data.bearing_temp_1, data.bearing_temp_2, data.bearing_temp_3, data.bearing_temp_4),
    data.brake_oil_pressure || 0,   // 5: 制动油压

    // --- 箕斗部分 ---
    data.main_skip_pos || 0,        // 6: 主箕斗位置
    data.vice_skip_pos || 0,        // 7: 副箕斗位置
    data.main_skip_speed || 0,      // 8: 主箕斗速度
    data.vice_skip_speed || 0,      // 9: 副箕斗速度

    // 状态位 (0或1)
    bool01(data.mode_auto),         // 10: 自动模式
    hasFault ? 1 : 0,               // 11: 综合故障
    bool01(data.mode_manual)        // 12: 手动模式
  ];

  // 拼接字符串：电气 | 轴承液压 | 箕斗 | 状态
  return "定子电流:" + values[0] + "A,励磁电流:" + values[1] + "A,进线电压:" + values[2] + "V,电机最高温度:" + values[3] + "°C|轴承最高温度:" + values[4] + "°C,制动油压:" + values[5] + "MPa|主箕斗位置:" + values[6] + "m,副箕斗位置:" + values[7] + "m,主箕斗速度:" + values[8] + "m/s,副箕斗速度:" + values[9] + "m/s|自动模式:" + values[10] + ",故障报警:" + values[11] + ",手动模式:" + values[12];
}

/**
 * 【新增加】专门格式化传给 elevatorEasyContral 脚本的数据
 * 格式要求: 当前值,最小值,最大值
 */
function formatDataForElevatorMotion(data: HoistRealtimeData): string {
     if (!data) return '0,0,600'
     // 主箕斗位置 main_skip_pos
     const currentVal = Number(data.main_skip_pos || 0).toFixed(2)
     const minVal = "0"
     const maxVal = "600"
     return `${currentVal},${minVal},${maxVal}`
}

function formatDataForViceElevatorMotion(data: HoistRealtimeData): string {
     if (!data) return '0,0,600'
     // 副箕斗位置 vice_skip_pos
     const currentVal = Number(data.vice_skip_pos || 0).toFixed(2)
     const minVal = "0"
     const maxVal = "600"
     return `${currentVal},${minVal},${maxVal}`

}

async function loadRealtime() {
  try {
    const res = await getRealtimeDataApi('TS001')
    const data = res.data as HoistRealtimeData
    hoistData.value = data

    // 同步数据到 Unity
    if (unityInstance) {
      // 1. 发送文字UI更新数据 (给原先负责文字解析的脚本/对象，如果存在且名字不变的话)
      // 注意：如果您完全移除了原有文字UI通信，请注释这段或者保留为原用。
      // const msgText = formatDataForUnity(data)
      // unityInstance.SendMessage("SendMessageelevator", "UpdateelevatorTexts", msgText)

      // 2. 发送主井提升机运动控制数据
      const motionData = formatDataForElevatorMotion(data)
      unityInstance.SendMessage(UNITY_TARGET_OBJ, UNITY_METHOD_NAME, motionData)

      // 3. 发送副井提升机运动控制数据
      const viceMotionData = formatDataForViceElevatorMotion(data)
      unityInstance.SendMessage(UNITY_TARGET_OBJ_VICE, UNITY_METHOD_NAME, viceMotionData)
    }
  } catch (e) {
    console.error(e)
  }
}

function initUnity() {
  const canvas = canvasRef.value
  if (!canvas) return

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
      window.createUnityInstance(canvas, config)
        .then((instance: UnityInstance) => {
          console.log("Unity Loaded Successfully")
          unityInstance = instance
          // 加载完成后立即发送一次数据
          if (hoistData.value) {
            const motionData = formatDataForElevatorMotion(hoistData.value)
            instance.SendMessage(UNITY_TARGET_OBJ, UNITY_METHOD_NAME, motionData)

            const viceMotionData = formatDataForViceElevatorMotion(hoistData.value)
            instance.SendMessage(UNITY_TARGET_OBJ_VICE, UNITY_METHOD_NAME, viceMotionData)
          }
        })
        .catch((err: unknown) => {
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
  refreshTimer = window.setInterval(loadRealtime, 5000)
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

// keep-alive 缓存时暂停轮询，激活时恢复
onDeactivated(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = undefined
  }
})

onActivated(() => {
  loadRealtime()
  refreshTimer = window.setInterval(loadRealtime, 5000)
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

.card-value.value-true {
  color: #22c55e;
  text-shadow: 0 0 10px rgba(34, 197, 94, 0.35);
}

.card-value.value-false {
  color: #ef4444;
  text-shadow: 0 0 10px rgba(239, 68, 68, 0.25);
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
