<template>
  <div class="dashboard-container" >
    <!-- 顶部标题区 -->
    <div class="dashboard-header">
			<img src="@/assets/img/up.png" class="header-bg" alt="header-bg" />
			<div class="header-title">智慧矿山监控系统</div>
		</div>


    <!-- 主体内容区 -->
    <div class="dashboard-main">
      <!-- 中央3D区域 - 布满整个页面 -->
      <div class="center-panel">
        <iframe
          src="/Factory/index.html"
          style="width:100%; height:100%; border:none; background:transparent; overflow:hidden;"
          allowfullscreen
          scrolling="no"
        ></iframe>
      </div>

      <!-- 左侧数据区 - 透明浮层 -->
      <div class="left-panel">
        <!-- 智慧园区数据展示 -->
        <div class="panel-section1">
          <div class="section-title">
            <span class="title-text">设备状态</span>
          </div>

           <div class="icon-data">
             <div
              v-for="code in DEVICE_CODES"
              :key="code"
              class="icon-item"
             >
              <div class="icon-3d">
                <span v-if="code.startsWith('TS')">🏗️</span>
                <span v-else-if="code.startsWith('YF')">⚙️</span>
                <span v-else-if="code.startsWith('TF')">🌪️</span>
                <span v-else-if="code.startsWith('PS')">💧</span>
                <span v-else-if="code.startsWith('YS')">🚂</span>
                <span v-else>🏢</span>
              </div>
              <div class="icon-info">
                <div class="info-left">
                  <div class="icon-label">{{ getDeviceName(code) }}</div>
                  <div class="icon-value">{{ getDeviceStatus(code, realtimeDeviceData[code]).message }}</div>
                </div>
                <!-- 这里的 class 根据状态动态改变颜色 -->
                <div
                  class="icon-unit"
                  :class="{
                    'normal': getDeviceStatus(code, realtimeDeviceData[code]).status === 'normal',
                    'alarm': getDeviceStatus(code, realtimeDeviceData[code]).status === 'alarm'
                  }"
                >
                  {{ getDeviceStatus(code, realtimeDeviceData[code]).statusText }}
                </div>
              </div>
            </div>
          </div>


        </div>






      </div>

      <!-- 右侧数据区 - 透明浮层 -->
      <div class="right-panel">
        <div class="panel-section1">
          <div class="section-title">
            <span class="title-text">系统报警</span>
          </div>
          <div class="alarm-list">
             <!-- 报警信息将通过循环渲染到这里 -->
             <transition-group name="list">
              <div v-for="alarm in alarmList" :key="alarm.id" class="alarm-card" :class="alarm.level">
                <div class="alarm-header">
                  <span class="alarm-device">{{ alarm.name }}</span>
                  <span class="alarm-time">{{ alarm.time }}</span>
                </div>
                <div class="alarm-content">
                  {{ alarm.message }}
                </div>
                <div class="alarm-actions">
                  <button class="action-btn ai-btn" @click="handleAiAssist(alarm)">
                    🤖 AI助手
                  </button>
                  <button class="action-btn del-btn" @click="removeAlarm(alarm.id)">
                    🗑️ 删除
                  </button>
                </div>
              </div>
             </transition-group>
             <div v-if="alarmList.length === 0" class="no-alarm">
               暂无系统报警
             </div>
          </div>
        </div>
      </div>

    </div>

    <!-- AI 助手组件 -->
    <AiAssistant
      v-model:visible="showAiAssistant"
      :initial-context="aiContext"
    />

  </div>
</template>

<script setup lang="ts">
// 智慧楼宇可视化指挥中心
defineOptions({
  name: 'DashboardIndex'
})

import {ref, onMounted, onUnmounted} from 'vue'
import { getRealtimeDataApi, getEquipmentThresholdApi } from '@/api/device'
import AiAssistant from '@/components/AiAssistant/index.vue'
import { analyzeThresholdBreaches } from '@/utils/equipmentThresholdAlarm'
import type { ThresholdApiData } from '@/constants/equipmentThreshold'
import type { ThresholdAlarmBreach } from '@/utils/equipmentThresholdAlarm'

// 设备列表
const DEVICE_CODES = [
  "TS001",
  ...Array.from({ length: 7 }, (_, i) => `YF00${i + 1}`), // YF001-YF007
  "TF001", "TF002",
  "PS001", "PS002", "PS003",
  "YS001"
]

interface AlarmItem {
  id: string
  code: string
  name: string
  time: string
  level: 'alarm'
  message: string
}

// 存储实时数据
const realtimeDeviceData = ref<Record<string, any>>({})
const thresholdDeviceData = ref<Record<string, ThresholdApiData | null>>({})
let dataPollingTimer: any = null // 使用 any 避免类型问题 (NodeJS.Timer vs number)

// AI 助手控制
const showAiAssistant = ref(false)
const aiContext = ref('')

// 报警列表
const alarmList = ref<AlarmItem[]>([])
// 记录上一次的报警状态，防止用户删除后同一个持续报警反复弹出。 key: deviceCode, value: stable alarm signature
const lastAlarmState = new Map<string, string>()

// 获取实时数据
const fetchRealtimeData = async () => {
    // 遍历所有设备并行请求
  const promises = DEVICE_CODES.map(async (code) => {
    try {
      const [realtimeResult, thresholdResult] = await Promise.allSettled([
        getRealtimeDataApi(code),
        getEquipmentThresholdApi(code),
      ])

      if (thresholdResult.status === 'fulfilled') {
        // 后端明确返回无阈值时清空缓存，避免继续拿旧阈值误报。
        thresholdDeviceData.value[code] = thresholdResult.value.code === 1 ? thresholdResult.value.data || null : null
      } else if (thresholdResult.status === 'rejected') {
        console.warn(`获取设备 ${code} 阈值失败:`, thresholdResult.reason)
      }

      if (realtimeResult.status === 'rejected') {
        throw realtimeResult.reason
      }

      const res = realtimeResult.value
      // 根据 API 定义, res 是 GetEquipmentRealtimeDataResponse
      // 假设我们要存的数据就在 res.data 中
      if (res && res.data) {
          realtimeDeviceData.value[code] = res.data

          // 检查实时状态报警和阈值报警
          checkAndGenerateAlarm(code, res.data, thresholdDeviceData.value[code])
      }
    } catch (error) {
      console.error(`获取设备 ${code} 实时数据失败:`, error)
    }
  })

  await Promise.all(promises)
}

// 检查并生成报警
const checkAndGenerateAlarm = (code: string, data: any, thresholdData?: ThresholdApiData | null) => {
  const { status, message, statusText } = getDeviceStatus(code, data)
  const thresholdBreaches = analyzeThresholdBreaches({
    equipmentCode: code,
    realtimeData: data,
    thresholdData,
  })

  if (status === 'alarm' || thresholdBreaches.length > 0) {
    // 如果当前有报警
    const currentSignature = buildAlarmSignature(status, message, thresholdBreaches)
    const currentMsg = buildAlarmMessage(status, message, thresholdBreaches)
    const currentStatusText = status === 'alarm' ? statusText : '阈值报警'
    const lastSignature = lastAlarmState.get(code)

    // 如果是新的报警信息（与上一次不同），则添加到列表
    // 这样用户删除后，如果是同一个持续的报警，不会立即重新弹出来干扰
    // 只有当报警状态发生变化（例如从"温度保护"变成了"设备故障"）才会再次弹窗
    if (lastSignature !== currentSignature) {
       addItemToAlarmList(code, currentStatusText, currentMsg)
       lastAlarmState.set(code, currentSignature)
    }
  } else {
    // 如果设备恢复正常，清除该设备的上一次报警记录
    // 这样下次如果再次报警，就能正常添加到列表
    if (lastAlarmState.has(code)) {
      lastAlarmState.delete(code)
    }
  }
}

const addItemToAlarmList = (code: string, statusText: string, message: string) => {
  const newItem: AlarmItem = {
    id: `${code}-${Date.now()}`,
    code,
    name: getDeviceName(code),
    time: new Date().toLocaleTimeString(),
    level: 'alarm',
    message: `[${statusText}] ${message}`
  }
  // 新报警添加到顶部
  alarmList.value.unshift(newItem)
}

const buildAlarmSignature = (
  status: string,
  statusMessage: string,
  thresholdBreaches: ThresholdAlarmBreach[],
) => {
  const parts: string[] = []
  if (status === 'alarm') {
    parts.push(`status:${statusMessage}`)
  }

  // 阈值报警签名只记录字段和方向，不记录实时数值，避免数值轻微波动导致已删除报警反复出现。
  parts.push(
    ...thresholdBreaches.map((breach) =>
      `threshold:${breach.fieldKey}:${breach.sourceKey}:${breach.direction}`,
    ),
  )

  return parts.join('|')
}

const buildAlarmMessage = (
  status: string,
  statusMessage: string,
  thresholdBreaches: ThresholdAlarmBreach[],
) => {
  const messages: string[] = []
  if (status === 'alarm') {
    messages.push(statusMessage)
  }
  if (thresholdBreaches.length > 0) {
    messages.push(`阈值超限：${thresholdBreaches.map((breach) => breach.message).join('；')}`)
  }
  return messages.join('；')
}

// 删除报警
const removeAlarm = (id: string) => {
  alarmList.value = alarmList.value.filter(item => item.id !== id)
}

// AI助手占位功能
const handleAiAssist = (item: AlarmItem) => {
  console.log('启动AI助手分析报警:', item)

  // 获取当前设备的实时数据
  const deviceRealtimeData = realtimeDeviceData.value[item.code]
  const deviceThresholdData = thresholdDeviceData.value[item.code]
  const dataStr = deviceRealtimeData ? JSON.stringify(deviceRealtimeData, null, 2) : '暂无数据'
  const thresholdStr = deviceThresholdData ? JSON.stringify(deviceThresholdData, null, 2) : '暂无阈值配置'

  aiContext.value = `请分析以下设备报警并给出处理建议：\n\n**基本信息**\n- 设备名称：${item.name} (${item.code})\n- 报警时间：${item.time}\n- 报警详情：${item.message}\n\n**实时运行数据**\n\`\`\`json\n${dataStr}\n\`\`\`\n\n**阈值配置**\n\`\`\`json\n${thresholdStr}\n\`\`\`\n\n请根据上述报警信息、实时运行数据和阈值配置，分析故障原因并给出处理建议。`
  showAiAssistant.value = true
}

// 获取设备名称
const getDeviceName = (code: string) => {
  if (code.startsWith('TS')) return '主提升机'
  if (code.startsWith('YF')) {
    const num = code.replace('YF', '')
    return `压风机#${parseInt(num)}`
  }
  if (code.startsWith('TF')) {
    const num = code.replace('TF', '')
    return `通风机#${parseInt(num)}`
  }
  if (code.startsWith('PS')) {
    const num = code.replace('PS', '')
    return `排水泵#${parseInt(num)}`
  }
  if (code.startsWith('YS')) return '运输皮带'
  return code
}

// 统一兼容后端可能返回的 boolean / 0-1 / 字符串状态值
const isActiveState = (value: unknown) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') {
    const val = value.trim().toLowerCase()
    return val === '1' || val === 'true' || val === 'on' || val === 'yes'
  }
  return false
}

// 获取设备状态和报警信息
const getDeviceStatus = (code: string, data: any) => {
  if (!data) return { status: 'normal', statusText: '正常', message: '运行正常' }

  let isAlarm = false
  let isWarning = false
  let alarmMsg = '运行正常'

  if (code.startsWith('TS')) {
    // 提升机：true = 正常（无故障），false = 故障
    const hoistFaultKeys = [
      'fault_emergency_stop',
      'fault_comm',
      'fault_low_voltage',
      'fault_high_voltage',
      'fault_motor_overload',
      'fault_motor_overspeed',
      'fault_temp_alarm',
      'fault_temp_error',
      'fault_brake_wear',
      'fault_brake_deflection',
      'fault_skip_jam'
    ]
    // 任一故障字段为 false 表示有故障
    const hasHoistFault = hoistFaultKeys.some(key => data[key] !== undefined && data[key] !== null && !isActiveState(data[key]))
    if (hasHoistFault) {
      isAlarm = true
      alarmMsg = isActiveState(data.fault_emergency_stop) ? '操作台急停' : '故障报警'
    }
  } else if (code.startsWith('YF')) {
    // 压风机
    if (data.fault_exist) {
      isAlarm = true
      alarmMsg = '设备故障'
    } else if (data.air_tank_temp_protect_active || data.host_temp_protect_active) {
      isWarning = true
      alarmMsg = '温度保护'
    }
  } else if (code.startsWith('TF')) {
    // 通风机
    if (data.general_alarm || data.main_motor_alarm) {
      isAlarm = true
      alarmMsg = '综合报警'
    } else if (data.lube_general_alarm) {
       isWarning = true
       alarmMsg = '润滑告警'
    }
  } else if (code.startsWith('PS')) {
    // 排水机
    if (data.total_fault || data.pump_fault || data.pump_emergency_fault) {
      isAlarm = true
       alarmMsg = '水泵故障'
    } else if (data.current_abnormal) {
      isWarning = true
      alarmMsg = '电流异常'
    }
  } else if (code.startsWith('YS')) {
    // 运输机
    if (data.fault_smoke || data.fault_tear || data.fault_coal_piling || data.fault_skid) {
      isAlarm = true
      if (data.fault_smoke) alarmMsg = '烟雾报警'
      else if (data.fault_tear) alarmMsg = '撕裂报警'
      else if (data.fault_coal_piling) alarmMsg = '堆煤报警'
      else if (data.fault_skid) alarmMsg = '打滑报警'
      else alarmMsg = '综合报警'
    } else if (data.fault_deviation) {
      isWarning = true
      alarmMsg = '跑偏'
    }
  }

  if (isAlarm) {
    return { status: 'alarm', statusText: '报警', message: alarmMsg }
  } else if (isWarning) {
    // 按需求：界面不展示“预警”，统一按“正常”显示
    return { status: 'normal', statusText: '正常', message: '运行正常' }
  } else {
    return { status: 'normal', statusText: '正常', message: '运行正常' }
  }
}




onMounted(() => {
  // 启动实时数据轮询
  fetchRealtimeData()
  dataPollingTimer = setInterval(fetchRealtimeData, 1000000)
})

onUnmounted(() => {
  if (dataPollingTimer) {
    clearInterval(dataPollingTimer)
    dataPollingTimer = null
  }
})

</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}


.icon-unit.normal {
  color: #00ff00; /* 绿色 */
  border-color: #00ff00;
}

.icon-unit.alarm {
  color: #ff0000; /* 红色 */
  border-color: #ff0000;
}

.icon-unit.orange {
  color: #ffa500; /* 橙色 */
  border-color: #ffa500;
}

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
  background: url('@/assets/img/239.png') left; /* 设置背景图片，图片靠左对齐 */
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
  overflow: hidden; /* 隐藏面板自身的滚动条，由内部元素处理滚动 */
}

/* 针对左侧面板内的第一部分的特殊布局，使其充满面板并包含滚动区域 */
.left-panel .panel-section1 {
  height: 100%;
  padding-bottom: 10px; /* 给底部留点空间 */
}

/* 让列表区域可滚动 */
.left-panel .icon-data {
  flex: 1;
  overflow-y: auto;
  min-height: 0; /* 允许flex子项收缩 */
  padding-right: 5px; /* 防止滚动条挡住内容（即使滚动条隐藏，加上padding也好） */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.left-panel .icon-data::-webkit-scrollbar {
      display: none;
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
  overflow: hidden; /* 隐藏面板自身的滚动条 */
}

.right-panel .panel-section1 {
  height: 100%;
  padding-bottom: 10px;
  display: flex;
  flex-direction: column;
}

.right-panel .alarm-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-right: 5px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.right-panel .alarm-list::-webkit-scrollbar {
  display: none;
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
  backdrop-filter: blur(80px);
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


/* 报警列表样式 */
.alarm-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alarm-card {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 6px;
  padding: 10px;
  position: relative;
  transition: all 0.3s ease;
}

.alarm-card.warning {
  background: rgba(255, 165, 0, 0.1);
  border-color: rgba(255, 165, 0, 0.3);
}

.alarm-card.alarm {
  background: rgba(255, 61, 0, 0.15);
  border-color: rgba(255, 61, 0, 0.4);
  box-shadow: 0 0 10px rgba(255, 61, 0, 0.1) inset;
  animation: flash 2s infinite;
}

@keyframes flash {
  0% { border-color: rgba(255, 61, 0, 0.4); }
  50% { border-color: rgba(255, 61, 0, 0.8); }
  100% { border-color: rgba(255, 61, 0, 0.4); }
}

.alarm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.alarm-device {
  font-size: 14px;
  font-weight: bold;
  color: #fff;
}

.alarm-time {
  font-size: 11px;
  color: #ccc;
}

.alarm-content {
  font-size: 13px;
  color: #ffd7d7;
  margin-bottom: 10px;
  line-height: 1.4;
}
.alarm-card.warning .alarm-content {
  color: #ffecc2;
}


.alarm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.action-btn {
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.2s;
  color: #fff;
}

.ai-btn {
  background: rgba(0, 188, 212, 0.6);
}
.ai-btn:hover {
  background: rgba(0, 188, 212, 0.9);
}

.del-btn {
  background: rgba(255, 255, 255, 0.1);
}
.del-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.no-alarm {
  text-align: center;
  color: #666;
  font-size: 12px;
  margin-top: 20px;
}

/* 列表过渡动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

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
