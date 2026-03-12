
<template>
  <div class="dashboard-container">
    <!-- 顶部标题区 -->
    <div class="dashboard-header">
      <img src="@/assets/img/up.png" class="header-bg" alt="header-bg" />
      <div class="header-title">通风机孪生平台</div>
    </div>

    <!-- 主体内容区 -->
    <div class="dashboard-main">
      <!-- 中央3D区域 -->
      <div class="center-panel">
        <canvas
          ref="canvasRef"
          id="unity-canvas"
          style="width: 100%; height: 100%; background: transparent;"
        ></canvas>
      </div>

      <!-- 左侧数据区 -->
      <div class="left-panel">
        <div class="panel-section1">
          <div class="section-title1">
            <span class="title-text">TF001 实时数据</span>
            <div class="title-line"></div>
          </div>
          <div class="collected-at">采集时间：{{ formatTime(ventilatorByCode.TF001?.collected_at) }}</div>

          <div class="sub-title">通风参数 / 变频</div>
          <div class="kv-rows">
            <div class="kv-row" v-for="(pair, idx) in tf001AirPairs" :key="`tf001-air-${idx}`">
              <div class="kv-item" v-for="it in pair" :key="it.key">
                <div class="kv-label">{{ it.label }}</div>
                <div class="kv-value">
                  <span v-if="it.type === 'bool'" class="dot" :class="toBool(it.value) ? 'on' : 'off'"></span>
                  <span class="kv-text">{{ formatMetricInline(it) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="sub-title">1级电机</div>
          <div class="kv-rows">
            <div class="kv-row" v-for="(pair, idx) in tf001Motor1Pairs" :key="`tf001-m1-${idx}`">
              <div class="kv-item" v-for="it in pair" :key="it.key">
                <div class="kv-label">{{ it.label }}</div>
                <div class="kv-value"><span class="kv-text">{{ formatMetricInline(it) }}</span></div>
              </div>
            </div>
          </div>

          <div class="sub-title">2级电机</div>
          <div class="kv-rows">
            <div class="kv-row" v-for="(pair, idx) in tf001Motor2Pairs" :key="`tf001-m2-${idx}`">
              <div class="kv-item" v-for="it in pair" :key="it.key">
                <div class="kv-label">{{ it.label }}</div>
                <div class="kv-value"><span class="kv-text">{{ formatMetricInline(it) }}</span></div>
              </div>
            </div>
          </div>

          <div class="sub-title">运行状态</div>
          <div class="kv-rows">
            <div class="kv-row" v-for="(pair, idx) in tf001StatusPairs" :key="`tf001-st-${idx}`">
              <div class="kv-item" v-for="it in pair" :key="it.key">
                <div class="kv-label">{{ it.label }}</div>
                <div class="kv-value">
                  <span class="dot" :class="toBool(it.value) ? 'on' : 'off'"></span>
                  <span class="kv-text">{{ formatMetricInline(it) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="sub-title">报警 / 故障</div>
          <div class="kv-rows">
            <div class="kv-row" v-for="(pair, idx) in tf001AlarmPairs" :key="`tf001-al-${idx}`">
              <div class="kv-item" v-for="it in pair" :key="it.key">
                <div class="kv-label">{{ it.label }}</div>
                <div class="kv-value">
                  <span class="dot" :class="toBool(it.value) ? 'off' : 'on'"></span>
                  <span class="kv-text">{{ formatMetricInline(it) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧数据区 -->
      <div class="right-panel">
        <div class="panel-section1">
          <div class="section-title1">
            <span class="title-text">TF002 实时数据</span>
            <div class="title-line"></div>
          </div>
          <div class="collected-at">采集时间：{{ formatTime(ventilatorByCode.TF002?.collected_at) }}</div>

          <div class="sub-title">通风参数 / 变频</div>
          <div class="kv-rows">
            <div class="kv-row" v-for="(pair, idx) in tf002AirPairs" :key="`tf002-air-${idx}`">
              <div class="kv-item" v-for="it in pair" :key="it.key">
                <div class="kv-label">{{ it.label }}</div>
                <div class="kv-value">
                  <span v-if="it.type === 'bool'" class="dot" :class="toBool(it.value) ? 'on' : 'off'"></span>
                  <span class="kv-text">{{ formatMetricInline(it) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="sub-title">1级电机</div>
          <div class="kv-rows">
            <div class="kv-row" v-for="(pair, idx) in tf002Motor1Pairs" :key="`tf002-m1-${idx}`">
              <div class="kv-item" v-for="it in pair" :key="it.key">
                <div class="kv-label">{{ it.label }}</div>
                <div class="kv-value"><span class="kv-text">{{ formatMetricInline(it) }}</span></div>
              </div>
            </div>
          </div>

          <div class="sub-title">2级电机</div>
          <div class="kv-rows">
            <div class="kv-row" v-for="(pair, idx) in tf002Motor2Pairs" :key="`tf002-m2-${idx}`">
              <div class="kv-item" v-for="it in pair" :key="it.key">
                <div class="kv-label">{{ it.label }}</div>
                <div class="kv-value"><span class="kv-text">{{ formatMetricInline(it) }}</span></div>
              </div>
            </div>
          </div>

          <div class="sub-title">运行状态</div>
          <div class="kv-rows">
            <div class="kv-row" v-for="(pair, idx) in tf002StatusPairs" :key="`tf002-st-${idx}`">
              <div class="kv-item" v-for="it in pair" :key="it.key">
                <div class="kv-label">{{ it.label }}</div>
                <div class="kv-value">
                  <span class="dot" :class="toBool(it.value) ? 'on' : 'off'"></span>
                  <span class="kv-text">{{ formatMetricInline(it) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="sub-title">报警 / 故障</div>
          <div class="kv-rows">
            <div class="kv-row" v-for="(pair, idx) in tf002AlarmPairs" :key="`tf002-al-${idx}`">
              <div class="kv-item" v-for="it in pair" :key="it.key">
                <div class="kv-label">{{ it.label }}</div>
                <div class="kv-value">
                  <span class="dot" :class="toBool(it.value) ? 'off' : 'on'"></span>
                  <span class="kv-text">{{ formatMetricInline(it) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDecimal } from '@/utils/format'

defineOptions({
  name: 'TongfengIndex'
})

import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { getRealtimeDataApi } from '@/api/device'
import type { VentilatorRealtimeData } from '@/api/device/types/device'

// ----------------------------------------------------------------------
// 1. Unity 配置区域
// ----------------------------------------------------------------------
const UNITY_CONFIG = {
  loaderUrl: "/airMachine/Build/airMachine.loader.js",
  dataUrl: "/airMachine/Build/airMachine.data.unityweb",
  frameworkUrl: "/airMachine/Build/airMachine.framework.js.unityweb",
  codeUrl: "/airMachine/Build/airMachine.wasm.unityweb",
  streamingAssetsUrl: "StreamingAssets",
  productVersion: "0.1",
  companyName: "DefaultCompany",
  productName: "Myproject",
}

// 接收消息的 Unity 游戏对象名
const UNITY_TARGET_OBJ = "SendMessageTongFeng"

// 第一个方法名 (原有)
const UNITY_METHOD_NAME = "UpdateTMPTexts"

// 【新增】第二个方法名
// TODO: 请在此处替换为您Unity脚本中实际的第二个函数名称
const UNITY_METHOD_NAME_2 = "UpdateOtherFunction"

type UnityInstance = {
  SendMessage: (gameObject: string, methodName: string, message: string) => void
}

declare global {
  interface Window {
    createUnityInstance: (canvas: HTMLCanvasElement, config: Record<string, unknown>) => Promise<UnityInstance>;
  }
}

// ----------------------------------------------------------------------
// 2. 业务数据定义
// ----------------------------------------------------------------------
const EQUIPMENT_CODES = ['TF001', 'TF002'] as const
type EquipmentCode = typeof EQUIPMENT_CODES[number]

const ventilatorByCode = reactive<Record<EquipmentCode, VentilatorRealtimeData | null>>({
  TF001: null,
  TF002: null
})

type MetricDef = { key: string; label: string; unit?: string; type?: 'number' | 'bool' | 'text' }
type MetricItem = MetricDef & { value: unknown }

function toBool(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase()
    return v === '1' || v === 'true' || v === 'yes' || v === 'on'
  }
  return false
}

function formatTime(value?: string) {
  if (!value) return '--'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}

function formatMetricInline(item: MetricItem) {
  const v = item.value
  if (v === null || v === undefined || v === '') return '--'
  if (item.type === 'bool') return toBool(v) ? '是' : '否'
  if (typeof v === 'number') {
    const val = formatDecimal(v)
    return item.unit ? `${val}${item.unit}` : val
  }
  return String(v)
}

function pairMetrics(items: MetricItem[]): MetricItem[][] {
  const res: MetricItem[][] = []
  for (let i = 0; i < items.length; i += 2) {
    const a = items[i]
    const b = items[i + 1]
    res.push(b ? [a, b] : [a])
  }
  return res
}

function buildItems(code: EquipmentCode, defs: readonly MetricDef[]): MetricItem[] {
  const data = ventilatorByCode[code]
  const record = (data ?? {}) as Record<string, unknown>
  return defs.map(def => ({ ...def, value: record[def.key] }))
}

const airDefs = [
  { key: 'air_speed', label: '风速', unit: 'm/s', type: 'number' },
  { key: 'air_volume', label: '风量', unit: 'm³/s', type: 'number' },
  { key: 'total_pressure', label: '全压', unit: 'Pa', type: 'number' },
  { key: 'neg_pressure', label: '负压', unit: 'Pa', type: 'number' },
  { key: 'inverter_freq', label: '变频频率', unit: 'Hz', type: 'number' },
  { key: 'inverter_current', label: '变频电流', unit: 'A', type: 'number' }
] as const satisfies readonly MetricDef[]

const motor1Defs = [
  { key: 'motor1_voltage', label: '电压', unit: 'V', type: 'number' },
  { key: 'motor1_current', label: '电流', unit: 'A', type: 'number' },
  { key: 'motor1_active_power', label: '有功', unit: 'kW', type: 'number' },
  { key: 'motor1_vert_vibration', label: '垂直振动', unit: 'mm/s', type: 'number' },
  { key: 'motor1_horiz_vibration', label: '水平振动', unit: 'mm/s', type: 'number' },
  { key: 'motor1_north_axis_temp', label: '北轴温度', unit: '℃', type: 'number' }
] as const satisfies readonly MetricDef[]

const motor2Defs = [
  { key: 'motor2_voltage', label: '电压', unit: 'V', type: 'number' },
  { key: 'motor2_current', label: '电流', unit: 'A', type: 'number' },
  { key: 'motor2_active_power', label: '有功', unit: 'kW', type: 'number' },
  { key: 'motor2_vert_vibration', label: '垂直振动', unit: 'mm/s', type: 'number' },
  { key: 'motor2_horiz_vibration', label: '水平振动', unit: 'mm/s', type: 'number' },
  { key: 'motor2_north_axis_temp', label: '北轴温度', unit: '℃', type: 'number' }
] as const satisfies readonly MetricDef[]

const statusDefs = [
  { key: 'run_feedback', label: '运行反馈', type: 'bool' },
  { key: 'inverter_run_feedback', label: '变频运行', type: 'bool' },
  { key: 'auto_mode', label: '自动', type: 'bool' },
  { key: 'manual_mode', label: '手动', type: 'bool' },
  { key: 'standby_mode', label: '待机', type: 'bool' },
  { key: 'exhaust_wind_mode', label: '抽风', type: 'bool' }
] as const satisfies readonly MetricDef[]

const alarmDefs = [
  { key: 'general_alarm', label: '报警', type: 'bool' },
  { key: 'main_motor_alarm', label: '主电机报警', type: 'bool' },
  { key: 'lube_general_alarm', label: '润滑站报警', type: 'bool' },
  { key: 'stator_temp_alarm', label: '定子温度报警', type: 'bool' },
  { key: 'bearing_temp_alarm', label: '主轴承温度报警', type: 'bool' },
  { key: 'bearing_vibration_alarm', label: '主轴承振动报警', type: 'bool' }
] as const satisfies readonly MetricDef[]

const tf001AirItems = computed(() => buildItems('TF001', airDefs))
const tf001Motor1Items = computed(() => buildItems('TF001', motor1Defs))
const tf001Motor2Items = computed(() => buildItems('TF001', motor2Defs))
const tf001StatusItems = computed(() => buildItems('TF001', statusDefs))
const tf001AlarmItems = computed(() => buildItems('TF001', alarmDefs))

const tf001AirPairs = computed(() => pairMetrics(tf001AirItems.value))
const tf001Motor1Pairs = computed(() => pairMetrics(tf001Motor1Items.value))
const tf001Motor2Pairs = computed(() => pairMetrics(tf001Motor2Items.value))
const tf001StatusPairs = computed(() => pairMetrics(tf001StatusItems.value))
const tf001AlarmPairs = computed(() => pairMetrics(tf001AlarmItems.value))

const tf002AirItems = computed(() => buildItems('TF002', airDefs))
const tf002Motor1Items = computed(() => buildItems('TF002', motor1Defs))
const tf002Motor2Items = computed(() => buildItems('TF002', motor2Defs))
const tf002StatusItems = computed(() => buildItems('TF002', statusDefs))
const tf002AlarmItems = computed(() => buildItems('TF002', alarmDefs))

const tf002AirPairs = computed(() => pairMetrics(tf002AirItems.value))
const tf002Motor1Pairs = computed(() => pairMetrics(tf002Motor1Items.value))
const tf002Motor2Pairs = computed(() => pairMetrics(tf002Motor2Items.value))
const tf002StatusPairs = computed(() => pairMetrics(tf002StatusItems.value))
const tf002AlarmPairs = computed(() => pairMetrics(tf002AlarmItems.value))

// ----------------------------------------------------------------------
// 3. Unity 集成与核心逻辑
// ----------------------------------------------------------------------
const canvasRef = ref<HTMLCanvasElement | null>(null)
let unityInstance: UnityInstance | null = null
let refreshTimer: number | undefined

/**
 * 辅助函数：将数据对象转换为 Unity 需要的字符串格式
 */
function formatDataForUnity(data: VentilatorRealtimeData): string {
  if (!data) return "0|0";

  const val1 = data.air_speed || 0;
  const val2 = data.air_volume || 0;
  const val3 = data.total_pressure || 0;
  const val4 = data.neg_pressure || 0;
  const val5 = data.motor1_voltage || 0;
  const val6 = data.motor1_current || 0;
  const val7 = data.motor1_horiz_vibration || 0;
  const val8 = data.motor1_vert_vibration || 0;
  const val9 = data.motor2_voltage || 0;
  const val10 = data.motor2_current || 0;
  const val11 = data.motor2_horiz_vibration || 0;
  const val12 = data.motor2_vert_vibration || 0;

  return `风速:${val1}m/s,风量:${val2}m³/s,总压:${val3}Pa,负压:${val4}Pa|电压${val5}V,电流:${val6}A,水平振动:${val7}mm/s,垂直振动:${val8}mm/s|电压${val9}V,电流:${val10}A,水平振动:${val11}mm/s,垂直振动:${val12}mm/s`;
}

/**
 * 核心逻辑：获取数据 -> 更新Vue -> 发送给Unity
 */
async function loadRealtimeAndSync() {
  try {
    const results = await Promise.allSettled(
      EQUIPMENT_CODES.map(code => getRealtimeDataApi(code))
    )

    results.forEach((r, idx) => {
      const code = EQUIPMENT_CODES[idx]
      if (r.status === 'fulfilled') {
        ventilatorByCode[code] = r.value.data as VentilatorRealtimeData
      } else {
        console.error(`获取数据失败(${code})`, r.reason)
      }
    })

    // 发送给 Unity：默认同步 TF001，避免破坏现有 Unity 逻辑
    const unityData = ventilatorByCode.TF001
    if (unityInstance && unityData) {
      const messageToSend = formatDataForUnity(unityData)
      unityInstance.SendMessage(UNITY_TARGET_OBJ, UNITY_METHOD_NAME, messageToSend)
      unityInstance.SendMessage(UNITY_TARGET_OBJ, UNITY_METHOD_NAME_2, messageToSend)
    }

  } catch (e) {
    console.error('获取数据失败', e)
  }
}

/**
 * 初始化 Unity
 */
function initUnity() {
  const canvas = canvasRef.value
  if (!canvas) {
    console.error("Canvas 未找到，请检查 DOM 结构")
    return
  }

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
        .then((instance) => {
          console.log("Unity 实例加载成功")
          unityInstance = instance

          // 加载完成后，如果有缓存数据，立即发送一次
          const cached = ventilatorByCode.TF001
          if (unityInstance && cached) {
            const messageToSend = formatDataForUnity(cached)

            // 发送给第一个方法
            unityInstance?.SendMessage(UNITY_TARGET_OBJ, UNITY_METHOD_NAME, messageToSend)

            // 【修改点】发送给第二个方法
            unityInstance?.SendMessage(UNITY_TARGET_OBJ, UNITY_METHOD_NAME_2, messageToSend)
          }
        })
        .catch((message: unknown) => {
          console.error("Unity 加载报错:", message)
        })
    }
  }

  script.onerror = () => {
    console.error("Loader.js 加载失败，请检查 public 路径配置是否正确:", UNITY_CONFIG.loaderUrl)
  }

  document.body.appendChild(script)
}

// ----------------------------------------------------------------------
// 4. 生命周期
// ----------------------------------------------------------------------
onMounted(() => {
  // 先拉取一次数据
  loadRealtimeAndSync()

  // 初始化 3D 场景
  initUnity()

  // 启动 1秒 轮询
  refreshTimer = window.setInterval(() => {
    loadRealtimeAndSync()
  }, 1000)
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

/* 取消全局滚动条隐藏，允许按需显示 */

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
	width: min(400px, 26vw); /* 增加宽度 */
	min-width: 320px; /* 增加最小宽度 */
	max-width: 480px; /* 增加最大宽度 */
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
	width: min(400px, 26vw); /* 增加宽度 */
	min-width: 320px; /* 增加最小宽度 */
	max-width: 480px; /* 增加最大宽度 */
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
	scrollbar-width: auto; /* Firefox */
	-ms-overflow-style: auto; /* IE and Edge */
}

.right-panel::-webkit-scrollbar { width: 8px; }
.right-panel::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.08); border-radius: 8px; }
.right-panel::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.25); border-radius: 8px; }

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
  flex: 0 0 auto; /* 禁止缩小，确保背景撑开包裹所有内容 */
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

.collected-at {
  margin: -6px 0 10px;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
}

.sub-title {
  margin: 10px 0 8px;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  background: rgba(0, 188, 212, 0.08);
  border: 1px solid rgba(0, 188, 212, 0.18);
  border-left: 3px solid rgba(0, 188, 212, 0.75);
  border-radius: 6px;
}

/* 两列紧凑行：每行展示两条数据 */
.kv-rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kv-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.kv-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  height: 32px;
  padding: 5px 8px;
  border-radius: 8px;
  background: rgba(0, 188, 212, 0.08);
  border: 1px solid rgba(0, 188, 212, 0.18);
  overflow: hidden;
}

.kv-label {
  flex: 1 1 46%;
  font-size: 10px;
  line-height: 1.1;
  color: rgba(255, 255, 255, 0.78);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  padding-right: 6px;
}

.kv-value {
  flex: 0 1 54%;
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  justify-content: flex-end;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.kv-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  flex: 1; /* 使卡片区域能够扩展和收缩 */
  min-height: 80px; /* 设置最小高度，确保至少能显示2行卡片 */
  max-height: 100%; /* 限制最大高度不超过父容器 */
  overflow-y: visible; /* 自身不滚动，交给父容器滚动 */
  overflow-x: hidden; /* 隐藏水平滚动条 */
  align-content: start; /* 卡片从顶部开始排列 */
}

:deep(.right-panel .data-cards) {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
:deep(.right-panel .data-cards::-webkit-scrollbar) {
  display: none;
}

.data-card {
  background: rgba(0, 188, 212, 0.1);
  border: 1px solid rgba(0, 188, 212, 0.3);
  border-radius: 6px;
  padding: 8px 8px 7px 10px; /* 更紧凑，避免溢出 */
  display: flex;
  align-items: center;
  gap: 8px; /* 减小间距 */
  width: 100%;
  height: auto; /* 让高度自适应内容 */
  min-height: 52px; /* 轻微提高，避免挤压 */
  min-width: 0; /* 关键：允许在 grid 中收缩，避免撑破 */
}

.card-icon {
  font-size: 18px;
  color: #00bcd4;
  flex: 0 0 auto;
}

.card-content {
  flex: 1;
  min-width: 0; /* 关键：允许文本区域收缩 */
}

.card-value {
  font-size: 14px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 2px;
  line-height: 1.15;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0;
  vertical-align: middle;
}

.dot.on {
  background: #49f343;
  box-shadow: 0 0 10px rgba(73, 243, 67, 0.65);
}

.dot.off {
  background: #ff3d00;
  box-shadow: 0 0 10px rgba(255, 61, 0, 0.55);
}

/* 更紧凑：减少左右侧栏的内边距，让更多内容进屏 */
.left-panel {
  padding: 12px 12px 12px 18px;
}
.right-panel {
  padding: 12px 18px 12px 12px;
}

/* 小高度屏幕进一步压缩行高 */
@media (max-height: 760px) {
  .sub-title {
    margin: 8px 0 6px;
    padding: 5px 9px;
    font-size: 12px;
  }
  .kv-item {
    height: 30px;
    padding: 5px 9px;
  }
  .kv-label { font-size: 10px; }
  .kv-value { font-size: 10px; }
}

.card-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.78);
  margin-bottom: 0;
  line-height: 1.15;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
    width: min(450px, 25vw);
  }
}

/* 中等屏幕 */
@media (max-width: 1400px) and (min-width: 1200px) {
  .left-panel, .right-panel {
    width: min(350px, 25vw);
    min-width: 280px;
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
    width: min(320px, 28vw);
    min-width: 260px;
  }

  .left-panel {
    left: 10px; /* 减小左边距 */
  }

  .right-panel {
    right: 10px; /* 减小右边距 */
  }

  .kv-row {
    grid-template-columns: 1fr;
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



