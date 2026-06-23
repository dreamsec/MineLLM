<template>
  <div class="dashboard-container" >
    <!-- 顶部标题区 -->
    <div class="dashboard-header">
      <img src="@/assets/img/up.png" class="header-bg" alt="header-bg" />
      <div class="header-title">排水泵孪生平台</div>
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

      <!-- 下方三台泵实时数据卡片 -->
      <div class="bottom-panel">
        <div class="pump-card" v-for="code in PUMP_CODES" :key="code">
          <div class="pump-card-header">
            <div class="pump-card-title">{{ code }} 实时数据</div>
            <div class="pump-card-time">采集时间：{{ formatTime(pumpByCode[code]?.collected_at) }}</div>
          </div>

          <div class="kv-rows">
            <div class="kv-row" v-for="(pair, idx) in pumpPairsByCode[code]" :key="`${code}-${idx}`">
              <div class="kv-item" v-for="it in pair" :key="it.key">
                <div class="kv-label">{{ it.label }}</div>
                <div class="kv-value">
                  <span v-if="it.type === 'bool'" class="dot" :class="toBool(it.value) ? 'on' : 'off'"></span>
                  {{ formatMetricInline(it) }}
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
// 智慧楼宇可视化指挥中心
defineOptions({
  name: 'PaishuiIndex'
})

import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { getRealtimeDataApi } from '@/api/device'
import type { PumpRealtimeData } from '@/api/device/types/device'

// ----------------------------------------------------------------------
// 1. Unity 配置 (假设路径在 /waterMachine/Build/ 下)
// ----------------------------------------------------------------------
// Unity 文件重新打包后只需要修改这个版本号，用于绕过浏览器旧缓存。
const UNITY_BUILD_VERSION = "20260616"
const withUnityVersion = (url: string) => `${url}?v=${UNITY_BUILD_VERSION}`

const UNITY_CONFIG = {
  loaderUrl: withUnityVersion("/waterMachine/Build/waterMachine.loader.js"),
  dataUrl: withUnityVersion("/waterMachine/Build/waterMachine.data.unityweb"),
  frameworkUrl: withUnityVersion("/waterMachine/Build/waterMachine.framework.js.unityweb"),
  codeUrl: withUnityVersion("/waterMachine/Build/waterMachine.wasm.unityweb"),
  streamingAssetsUrl: "StreamingAssets",
  productVersion: "0.1",
  companyName: "DefaultCompany",
  productName: "My Project",
}

const UNITY_TARGET_OBJ = "SendMessagepaishui" // Unity场景接收数据的物体名
const UNITY_METHOD_NAME = "UpdateTMPTexts"   // Unity脚本接收数据的函数名

type UnityInstance = {
  SendMessage: (gameObject: string, methodName: string, message: string) => void
}

declare global {
  interface Window {
    createUnityInstance: (canvas: HTMLCanvasElement, config: Record<string, unknown>) => Promise<UnityInstance>;
  }
}

// ----------------------------------------------------------------------
// 2. 业务数据定义（PS001~PS003）
// ----------------------------------------------------------------------
const PUMP_CODES = ['PS001', 'PS002', 'PS003'] as const
type PumpCode = typeof PUMP_CODES[number]

const pumpByCode = reactive<Record<PumpCode, PumpRealtimeData | null>>({
  PS001: null,
  PS002: null,
  PS003: null
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

const pumpMetricDefs = [
  { key: 'current', label: '电流', unit: 'A', type: 'number' },
  { key: 'pos_pressure', label: '正压', unit: 'MPa', type: 'number' },
  { key: 'neg_pressure', label: '负压', unit: 'MPa', type: 'number' },
  { key: 'total_run_time', label: '累计运行', type: 'text' },

  { key: 'motor_temp_u', label: '电机U温', unit: '℃', type: 'number' },
  { key: 'motor_temp_v', label: '电机V温', unit: '℃', type: 'number' },
  { key: 'motor_temp_w', label: '电机W温', unit: '℃', type: 'number' },
  { key: 'motor_front_axis_temp', label: '电机前轴温', unit: '℃', type: 'number' },
  { key: 'motor_rear_axis_temp', label: '电机后轴温', unit: '℃', type: 'number' },
  { key: 'pump_front_axis_temp', label: '水泵前轴温', unit: '℃', type: 'number' },
  { key: 'pump_rear_axis_temp', label: '水泵后轴温', unit: '℃', type: 'number' },

  { key: 'run_status', label: '运行状态', type: 'bool' },
  { key: 'run_feedback', label: '运行反馈', type: 'bool' },
  { key: 'standby_status', label: '备用', type: 'bool' },
  { key: 'maintenance_status', label: '检修', type: 'bool' },
  { key: 'forbid_start', label: '禁起', type: 'bool' },
  { key: 'total_fault', label: '总故障', type: 'bool' }
] as const satisfies readonly MetricDef[]

function buildItems(code: PumpCode, defs: readonly MetricDef[]): MetricItem[] {
  const data = pumpByCode[code]
  const dict = (data ?? {}) as Record<string, unknown>
  return defs.map(def => {
    if (def.key === 'total_run_time') {
      const h = dict.total_run_hours as number | undefined
      const m = dict.total_run_minutes as number | undefined
      const has = (h !== null && h !== undefined) || (m !== null && m !== undefined)
      return { ...def, value: has ? `${h ?? 0}h${m ?? 0}m` : '--' }
    }
    return { ...def, value: dict[def.key] }
  })
}

const pumpItemsByCode = computed(() => {
  return {
    PS001: buildItems('PS001', pumpMetricDefs),
    PS002: buildItems('PS002', pumpMetricDefs),
    PS003: buildItems('PS003', pumpMetricDefs)
  } satisfies Record<PumpCode, MetricItem[]>
})

const pumpPairsByCode = computed(() => {
  return {
    PS001: pairMetrics(pumpItemsByCode.value.PS001),
    PS002: pairMetrics(pumpItemsByCode.value.PS002),
    PS003: pairMetrics(pumpItemsByCode.value.PS003)
  } satisfies Record<PumpCode, MetricItem[][]>
})

// ----------------------------------------------------------------------
// 3. Unity 交互逻辑
// ----------------------------------------------------------------------
const canvasRef = ref<HTMLCanvasElement | null>(null)
let unityInstance: UnityInstance | null = null
let refreshTimer: number | undefined

/**
 * 按照要求格式化数据发送给 Unity
 */
function formatDataForUnity(data: PumpRealtimeData): string {
  if (!data) return "";

  const num = (v: unknown) => (typeof v === 'number' ? formatDecimal(v) : (v ?? '--'))
  const boolText = (v: unknown) => (toBool(v) ? '是' : '否')
  const runTime = `${data.total_run_hours ?? 0}h${data.total_run_minutes ?? 0}m`

  return "电流：" + num(data.current) + "A"
    + ",正压：" + num(data.pos_pressure) + "MPa"
    + ",负压：" + num(data.neg_pressure) + "MPa"
    + "|累计运行：" + runTime
    + "|电机U温：" + num(data.motor_temp_u) + "℃,电机V温：" + num(data.motor_temp_v) + "℃,电机W温：" + num(data.motor_temp_w) + "℃"
    + "|电机前轴温：" + num(data.motor_front_axis_temp) + "℃,电机后轴温：" + num(data.motor_rear_axis_temp) + "℃"
    + "|水泵前轴温：" + num(data.pump_front_axis_temp) + "℃,水泵后轴温：" + num(data.pump_rear_axis_temp) + "℃"
    + "|运行状态：" + boolText(data.run_status) + ",运行反馈：" + boolText(data.run_feedback)
    + ",备用：" + boolText(data.standby_status) + ",检修：" + boolText(data.maintenance_status)
    + ",禁起：" + boolText(data.forbid_start) + ",总故障：" + boolText(data.total_fault);
}

async function loadRealtime() {
  try {
    const results = await Promise.allSettled(PUMP_CODES.map(code => getRealtimeDataApi(code)))
    results.forEach((r, idx) => {
      const code = PUMP_CODES[idx]
      if (r.status === 'fulfilled') {
        pumpByCode[code] = r.value.data as PumpRealtimeData
      } else {
        console.error(`获取数据失败(${code})`, r.reason)
      }
    })

    // 同步数据到 Unity：默认同步 PS001，避免破坏现有 Unity 逻辑
    const data = pumpByCode.PS001
    if (unityInstance && data) {
      const msg = formatDataForUnity(data)
      unityInstance.SendMessage(UNITY_TARGET_OBJ, UNITY_METHOD_NAME, msg)
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
        .then((instance) => {
          console.log("Unity Loaded Successfully")
          unityInstance = instance
          // 加载完成后立即发送一次数据
          const data = pumpByCode.PS001
          if (data) {
            const msg = formatDataForUnity(data)
            unityInstance?.SendMessage(UNITY_TARGET_OBJ, UNITY_METHOD_NAME, msg)
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
  // refreshTimer = window.setInterval(loadRealtime, 1000)
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
/* 保持原有样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard-container {
  width: 100%;
  height: calc(100vh - 100px);
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
  z-index: 1;
  overflow: hidden;
}

/* 左右面板样式 */
.left-panel, .right-panel {
  width: min(320px, 22vw);
  min-width: 250px;
  height: calc(100vh - 190px);
  display: flex;
  flex-direction: column;
  gap: 15px;
  position: absolute;
  top: 80px;
  z-index: 10;
  overflow-y: auto;
  scrollbar-width: none;            /* Firefox */
  -ms-overflow-style: none;         /* IE/旧 Edge */
  scrollbar-color: transparent transparent; /* Firefox 进一步兜底 */
}
.left-panel::-webkit-scrollbar,
.right-panel::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
}

.left-panel::-webkit-scrollbar-thumb,
.right-panel::-webkit-scrollbar-thumb,
.left-panel::-webkit-scrollbar-track,
.right-panel::-webkit-scrollbar-track {
  background: transparent !important;
  border: 0 !important;
}

.left-panel::-webkit-scrollbar-button,
.right-panel::-webkit-scrollbar-button {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.left-panel {
  left: 15px;
}

.right-panel {
  right: 15px;
}

.panel-section {
  padding: 10px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 188, 212, 0.25);
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(0, 188, 212, 0.08), rgba(0, 188, 212, 0.04));
  box-shadow: 0 8px 18px rgba(0,0,0,0.25);
}

.section-title {
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

/* 底部三台泵卡片 */
.bottom-panel {
  position: absolute;
  left: 15px;
  right: 15px;
  bottom: 16px;
  z-index: 12;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  pointer-events: none; /* 不挡 3D 交互；卡片内需要交互可再开启 */
}

.pump-card {
  pointer-events: auto;
  padding: 12px 12px 10px;
  border: 1px solid rgba(0, 188, 212, 0.25);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(0, 188, 212, 0.10), rgba(0, 188, 212, 0.05));
  box-shadow: 0 10px 22px rgba(0,0,0,0.22), inset 0 0 30px rgba(0, 188, 212, 0.06);
  backdrop-filter: blur(10px);
  min-width: 0;
}

.pump-card-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.pump-card-title {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #ffffff;
  text-shadow: 0 2px 10px rgba(30, 144, 255, 0.35);
  white-space: nowrap;
}

.pump-card-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.72);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kv-rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kv-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.kv-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  height: 28px;
  padding: 4px 10px;
  border-radius: 10px;
  background: rgba(0, 188, 212, 0.08);
  border: 1px solid rgba(0, 188, 212, 0.18);
}

.kv-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.78);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  padding-right: 6px;
}

.kv-value {
  font-size: 11px;
  font-weight: 800;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  max-width: 62%;
  justify-content: flex-end;
}

.dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.dot.on {
  background: #49f343;
  box-shadow: 0 0 10px rgba(73, 243, 67, 0.55);
}

.dot.off {
  background: #ff3d00;
  box-shadow: 0 0 10px rgba(255, 61, 0, 0.45);
}

@media (max-width: 1400px) {
  .bottom-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-height: 820px) {
  .kv-item { height: 26px; padding: 4px 9px; }
  .kv-label { font-size: 9px; }
  .kv-value { font-size: 10px; }
  .pump-card-title { font-size: 15px; }
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
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

.panel-section::-webkit-scrollbar,
.panel-section1::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Webkit */
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


