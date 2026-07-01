<template>
  <div class="dashboard-container">
    <!-- 顶部标题区 -->
    <div class="dashboard-header">
      <img src="@/assets/img/up.png" class="header-bg" alt="header-bg" />
      <div class="header-title">压风机孪生平台</div>
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

      <!-- 底部横向 7 台压风机卡片（从左到右） -->
      <div class="bottom-panel">
        <div class="bottom-panel-title">压风机系统</div>
        <div class="unit-row">
          <div
            v-for="unit in units"
            :key="unit.code"
            class="unit-card"
            :class="{ active: unit.code === activeUnityCode }"
            @click="activeUnityCode = unit.code"
          >
            <div class="unit-card-header">
              <div class="unit-code">{{ unit.code }}</div>
              <div class="unit-status-dots">
                <span class="dot" :class="dotClass(unit.data?.comm_status)"></span>
                <span class="dot" :class="dotClass(unit.data?.running_feedback)"></span>
                <span class="dot" :class="dotClass(unit.data?.fault_exist, true)"></span>
              </div>
            </div>

            <div class="unit-subheader">
              <span class="subitem">通讯</span>
              <span class="subitem">运行</span>
              <span class="subitem">故障</span>
              <span class="unit-time">{{ formatCollectedAt(unit.data?.collected_at) }}</span>
            </div>

            <div class="unit-scroll">
              <div class="unit-groups">
                <div v-for="group in fieldGroups" :key="group.title" class="group-block">
                  <div class="group-title">{{ group.title }}</div>
                  <div class="field-grid">
                    <div
                      v-for="field in group.fields"
                      :key="String(field.key)"
                      class="field-row"
                      :class="fieldRowClass(field)"
                    >
                      <div class="field-label">{{ field.label }}</div>
                      <div class="field-value" :class="fieldValueClass(unit.data, field)">
                        {{ formatFieldValue(unit.data, field) }}
                        <span v-if="field.unit && field.kind !== 'boolean'"> {{ field.unit }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <CameraVideoDialog
      v-model="cameraDialogVisible"
      :camera-id="activeCameraId"
    />

    <el-dialog
      v-model="addUnityCameraDialogVisible"
      width="560px"
      append-to-body
      :close-on-click-modal="false"
      class="unity-camera-dialog"
    >
      <template #header>
        <div class="unity-camera-header">
          <div>
            <div class="unity-camera-kicker">Unity 摄像头绑定</div>
            <div class="unity-camera-title">压风机图标 {{ pendingUnityIconId ?? '--' }}</div>
          </div>
          <div class="unity-camera-location">{{ unityCameraAddForm.location || '未分配' }}</div>
        </div>
      </template>

      <div class="unity-camera-panel">
        <div class="unity-camera-summary">
          <div class="unity-camera-summary-icon" aria-hidden="true"></div>
          <div class="unity-camera-summary-content">
            <div class="unity-camera-summary-title">未检测到已绑定摄像头</div>
            <div class="unity-camera-summary-text">
              填写摄像头信息后会写入当前 location，保存成功后立即打开实时视频。
            </div>
          </div>
        </div>

        <el-form label-position="top" class="unity-camera-form">
          <div class="unity-camera-grid">
            <el-form-item label="摄像头名称">
              <el-input v-model="unityCameraAddForm.name" placeholder="例如：压风机房东侧摄像头" />
            </el-form-item>
            <el-form-item label="IP地址">
              <el-input v-model="unityCameraAddForm.ip" placeholder="例如：192.168.1.20" />
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="unityCameraAddForm.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input
                v-model="unityCameraAddForm.password"
                type="password"
                show-password
                placeholder="请输入密码"
              />
            </el-form-item>
            <el-form-item class="unity-camera-full" label="RTSP地址">
              <el-input v-model="unityCameraAddForm.rtsp" placeholder="rtsp://..." />
            </el-form-item>
          </div>
        </el-form>
      </div>

      <template #footer>
        <div class="unity-camera-actions">
          <el-button class="unity-camera-cancel" @click="cancelAddUnityCamera">取消</el-button>
          <el-button
            class="unity-camera-submit"
            type="primary"
            :loading="addUnityCameraLoading"
            @click="submitAddUnityCamera"
          >
            保存并打开
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { formatDecimal } from '@/utils/format'

defineOptions({
  name: 'YafengIndex'
})

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getRealtimeDataApi } from '@/api/device'
import type { CompressorRealtimeData } from '@/api/device/types/device'
import { addCameraApi, getAllCamerasApi } from '@/api/camera'
import type { AddCameraRequestParams, CameraData } from '@/api/camera/types/camera'
import { getYafengIconIdFromLocation, getYafengCameraLocation } from '@/constants/cameraLocation'
import CameraVideoDialog from '@/components/CameraVideoDialog/index.vue'

// ----------------------------------------------------------------------
// 1. Unity 配置区域 (请根据实际打包生成的文件名修改)
// ----------------------------------------------------------------------
// 假设你的 Unity 打包输出在 /CompressorFan/Build/ 目录下，且文件名通常与文件夹一致
// Unity 文件重新打包后只需要修改这个版本号，用于绕过浏览器旧缓存。
const UNITY_BUILD_VERSION = "20260616"
const withUnityVersion = (url: string) => `${url}?v=${UNITY_BUILD_VERSION}`

const UNITY_CONFIG = {
  loaderUrl: withUnityVersion("/CompressorFan/Build/CompressorFan.loader.js"),
  dataUrl: withUnityVersion("/CompressorFan/Build/CompressorFan.data.unityweb"),
  frameworkUrl: withUnityVersion("/CompressorFan/Build/CompressorFan.framework.js.unityweb"),
  codeUrl: withUnityVersion("/CompressorFan/Build/CompressorFan.wasm.unityweb"),
  streamingAssetsUrl: "StreamingAssets",
  productVersion: "0.1",
  companyName: "DefaultCompany",
  productName: "Myproject", // 对应 Unity 设置的 ProductName
}

// ★★★ 注意：这里的对象名和方法名必须与 Unity C# 脚本中挂载的 GameObject 和方法名一致 ★★★
const UNITY_TARGET_OBJ = "SendMessageYaFeng" // Unity场景中挂载脚本的物体名称
const UNITY_METHOD_NAME = "UpdateTMPTexts"   // Unity脚本中接收字符串的 public 方法名

type UnityInstance = {
  SendMessage: (gameObject: string, methodName: string, message: string) => void
}

declare global {
  interface Window {
    createUnityInstance: (canvas: HTMLCanvasElement, config: Record<string, unknown>) => Promise<UnityInstance>;
    handleUnityIconClick?: (id: number | string) => void;
  }
}

// ----------------------------------------------------------------------
// 2. 业务数据定义
// ----------------------------------------------------------------------
type BooleanLike = boolean | number | null | undefined

type FieldDef = {
  key: keyof CompressorRealtimeData
  label: string
  unit?: string
  kind?: 'number' | 'boolean'
  fullRow?: boolean
}

type FieldGroupDef = {
  title: string
  open?: boolean
  fields: FieldDef[]
}

const EQUIPMENT_CODES = Array.from({ length: 7 }, (_, i) => `YF${String(i + 1).padStart(3, '0')}`)
const activeUnityCode = ref<string>(EQUIPMENT_CODES[0])

const unitState = ref<Record<string, { data: CompressorRealtimeData | null; error: string | null }>>(
  Object.fromEntries(EQUIPMENT_CODES.map(code => [code, { data: null, error: null }]))
)

const units = computed(() => EQUIPMENT_CODES.map(code => ({ code, ...unitState.value[code] })))

const fieldGroups: FieldGroupDef[] = [
  {
    title: '实时运行监测（温度）',
    open: true,
    fields: [
      { key: 'unit_exhaust_temp', label: '机组排气温度', unit: '°C', kind: 'number' },
      { key: 'host_exhaust_temp', label: '主机排气温度', unit: '°C', kind: 'number' },
      { key: 'air_tank_temp', label: '风包温度', unit: '°C', kind: 'number' },
      { key: 'running_temp', label: '运行温度', unit: '°C', kind: 'number' }
    ]
  },
  {
    title: '实时运行监测（压力/真空）',
    fields: [
      { key: 'exhaust_pressure', label: '排气压力', unit: 'MPa', kind: 'number' },
      { key: 'separation_pressure', label: '分离压力', unit: 'MPa', kind: 'number' }
    ]
  },
  {
    title: '实时运行监测（电气/振动/时间）',
    fields: [
      { key: 'voltage', label: '电压', unit: 'V', kind: 'number' },
      { key: 'current', label: '电流', unit: 'A', kind: 'number' },
      { key: 'host_vibration', label: '主机振动', unit: 'mm/s', kind: 'number' },
      { key: 'motor_vibration', label: '电机振动', unit: 'mm/s', kind: 'number' },
      { key: 'current_run_time', label: '当次运行时间', unit: 'h', kind: 'number' },
      { key: 'host_run_time', label: '主机运行时间', unit: 'h', kind: 'number' },
      { key: 'host_load_time', label: '主机加载时间', unit: 'h', kind: 'number' }
    ]
  },
  {
    title: '设备/模式状态',
    fields: [
      { key: 'standby_status', label: '待机状态', kind: 'boolean' },
      { key: 'running_feedback', label: '运行反馈', kind: 'boolean' },
      { key: 'fault_exist', label: '故障存在', kind: 'boolean' },
      { key: 'comm_status', label: '通信状态', kind: 'boolean' },
      { key: 'remote_mode', label: '远控模式', kind: 'boolean' },
      { key: 'local_mode', label: '就地模式', kind: 'boolean' },
      { key: 'load_unload_mode', label: '加卸载模式', kind: 'boolean' },
      { key: 'auto_toggle_status', label: '自动投退状态', kind: 'boolean' }
    ]
  },
  {
    title: '控制指令',
    fields: [
      { key: 'start_btn', label: '启动按钮', kind: 'boolean' },
      { key: 'stop_btn', label: '停止按钮', kind: 'boolean' },
      { key: 'auto_toggle_btn', label: '自动投退按钮', kind: 'boolean' }
    ]
  },
  {
    title: '排污阀系统',
    fields: [
      { key: 'drain_valve_open', label: '排污阀开状态', kind: 'boolean' },
      { key: 'drain_valve_close', label: '排污阀关状态', kind: 'boolean' },
      { key: 'drain_valve_manual_open_btn', label: '排污阀手动开按钮', kind: 'boolean' },
      { key: 'drain_valve_manual_close_btn', label: '排污阀手动关按钮', kind: 'boolean' },
      { key: 'drain_valve_manual_stop_btn', label: '排污阀手动停按钮', kind: 'boolean' },
      { key: 'drain_valve_mode_btn_status', label: '排污阀手自动按钮状态', kind: 'number', fullRow: true },
      { key: 'drain_valve_interval_setting', label: '排污阀时间间隔设定', kind: 'number', fullRow: true },
      { key: 'drain_valve_duration_setting', label: '排污阀时长设定', kind: 'number', fullRow: true }
    ]
  },
  {
    title: '保护设定与投退',
    fields: [
      { key: 'air_tank_temp_alarm_setting', label: '风包温度报警值设定', unit: '°C', kind: 'number', fullRow: true },
      { key: 'air_tank_temp_trip_setting', label: '风包温度跳闸值设定', unit: '°C', kind: 'number', fullRow: true },
      { key: 'air_tank_temp_protect_active', label: '风包温度保护投退状态', kind: 'boolean' },
      { key: 'air_tank_temp_protect_btn', label: '风包温度保护投退按钮', kind: 'number', fullRow: true },

      { key: 'host_temp_alarm_setting', label: '主机温度报警值设定', unit: '°C', kind: 'number', fullRow: true },
      { key: 'host_temp_trip_setting', label: '主机温度跳闸值设定', unit: '°C', kind: 'number', fullRow: true },
      { key: 'host_temp_protect_active', label: '主机温度保护投退状态', kind: 'boolean' },
      { key: 'host_temp_protect_btn', label: '主机温度保护投退按钮', kind: 'number', fullRow: true },

      { key: 'exhaust_temp_alarm_setting', label: '排气温度报警值设定', unit: '°C', kind: 'number', fullRow: true },
      { key: 'exhaust_temp_trip_setting', label: '排气温度跳闸值设定', unit: '°C', kind: 'number', fullRow: true },
      { key: 'exhaust_temp_protect_active', label: '排气温度保护投退状态', kind: 'boolean' },
      { key: 'exhaust_temp_protect_btn', label: '排气温度保护投退按钮', kind: 'number', fullRow: true },

      { key: 'vibration_alarm_setting', label: '振动报警值设定', unit: 'mm/s', kind: 'number', fullRow: true },
      { key: 'vibration_trip_setting', label: '振动跳闸值设定', unit: 'mm/s', kind: 'number', fullRow: true },
      { key: 'vibration_protect_active', label: '振动保护投退状态', kind: 'boolean' },
      { key: 'vibration_protect_btn', label: '振动保护投退按钮', kind: 'number', fullRow: true }
    ]
  }
]

function fieldRowClass(field: FieldDef): string {
  // 长字段独占一行：优先使用手动标记，其次用 label 长度做兜底
  // 中文字符计数：7+ 一般就会比较挤，独占一行更清晰
  const isFull = field.fullRow === true || field.label.length >= 6
  return isFull ? 'full-row' : ''
}

function toBool(value: BooleanLike): boolean | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  return null
}

function formatCollectedAt(value: string | null | undefined): string {
  if (!value) return '--'
  return value
}

function formatFieldValue(data: CompressorRealtimeData | null, field: FieldDef): string {
  if (!data) return '--'
  const raw = data[field.key]
  if (raw === null || raw === undefined || raw === '') return '--'

  if (field.kind === 'boolean') {
    const b = toBool(raw as BooleanLike)
    if (b === null) return '--'
    return b ? '开' : '关'
  }

  return formatDecimal(raw as number | string | null | undefined)
}

function fieldValueClass(data: CompressorRealtimeData | null, field: FieldDef): string {
  if (field.kind !== 'boolean') return ''
  const b = toBool((data?.[field.key] ?? null) as BooleanLike)
  if (b === null) return 'is-unknown'
  return b ? 'is-on' : 'is-off'
}

function dotClass(value: BooleanLike, invert = false): string {
  const b = toBool(value)
  if (b === null) return 'dot-unknown'
  const normalized = invert ? !b : b
  return normalized ? 'dot-on' : 'dot-off'
}

// ----------------------------------------------------------------------
// 3. Unity 集成与核心逻辑
// ----------------------------------------------------------------------
const canvasRef = ref<HTMLCanvasElement | null>(null)
let unityInstance: UnityInstance | null = null
let refreshTimer: number | undefined

// Unity 场景中的图标编号 -> 后端摄像头真实 id，由摄像头 location 自动生成。
const unityCameraMap = ref<Record<number, number>>({})
const cameraDialogVisible = ref(false)
const activeCameraId = ref<number | null>(null)
const addUnityCameraDialogVisible = ref(false)
const addUnityCameraLoading = ref(false)
const pendingUnityIconId = ref<number | null>(null)
const unityCameraAddForm = ref<AddCameraRequestParams>({
  name: '',
  ip: '',
  username: '',
  password: '',
  rtsp: '',
  location: '',
  // Unity 摄像头不依赖 GIS 坐标，后端仍要求 x/y 时统一写 0。
  x: 0,
  y: 0
})

function resetUnityCameraAddForm(iconId: number) {
  unityCameraAddForm.value = {
    name: `压风机摄像头${iconId}`,
    ip: '',
    username: '',
    password: '',
    rtsp: '',
    location: getYafengCameraLocation(iconId),
    x: 0,
    y: 0
  }
}

function openAddUnityCameraDialog(iconId: number) {
  pendingUnityIconId.value = iconId
  resetUnityCameraAddForm(iconId)
  addUnityCameraDialogVisible.value = true
}

function cancelAddUnityCamera() {
  addUnityCameraDialogVisible.value = false
  pendingUnityIconId.value = null
}

async function findUnityCameraByIcon(iconId: number): Promise<CameraData | null> {
  const location = getYafengCameraLocation(iconId)
  const response = await getAllCamerasApi(location)
  const list = response.data?.list || []
  return list.find(camera => camera.location === location) || null
}

async function loadUnityCameraMap() {
  try {
    const response = await getAllCamerasApi()
    const nextMap: Record<number, number> = {}
    const list = response.data?.list || []

    list.forEach((camera) => {
      const iconId = getYafengIconIdFromLocation(camera.location)
      if (!iconId) return
      // location 约定为 yafeng-1 / yafeng-2 / yafeng-3，对应 Unity 传来的图标编号。
      nextMap[iconId] = camera.id
    })

    unityCameraMap.value = nextMap
  } catch (error) {
    console.error('获取压风机 Unity 摄像头映射失败:', error)
    ElMessage.error('获取压风机摄像头配置失败')
  }
}

async function openCameraFromUnity(unityIconId: number | string) {
  const iconId = Number(unityIconId)

  if (!Number.isFinite(iconId)) {
    ElMessage.warning(`Unity 摄像头编号无效：${unityIconId}`)
    return
  }

  try {
    const camera = await findUnityCameraByIcon(iconId)
    if (!camera) {
      openAddUnityCameraDialog(iconId)
      return
    }

    unityCameraMap.value[iconId] = camera.id
    activeCameraId.value = camera.id
    cameraDialogVisible.value = true
  } catch (error) {
    console.error('查询压风机 Unity 摄像头失败:', error)
    ElMessage.error('查询压风机摄像头失败')
  }
}

async function submitAddUnityCamera() {
  const iconId = pendingUnityIconId.value
  if (!iconId) {
    ElMessage.warning('缺少 Unity 摄像头编号')
    return
  }

  const form = unityCameraAddForm.value
  if (!form.name.trim()) {
    ElMessage.warning('请输入摄像头名称')
    return
  }
  if (!form.ip.trim()) {
    ElMessage.warning('请输入IP地址')
    return
  }
  if (!form.rtsp.trim()) {
    ElMessage.warning('请输入RTSP地址')
    return
  }

  addUnityCameraLoading.value = true
  try {
    const payload: AddCameraRequestParams = {
      ...form,
      location: getYafengCameraLocation(iconId),
      x: 0,
      y: 0
    }
    const res = await addCameraApi(payload)
    const createdCameraId = (res as any).data?.id

    await loadUnityCameraMap()
    const cameraId = createdCameraId || unityCameraMap.value[iconId]

    if (!cameraId) {
      ElMessage.success('摄像头添加成功，请再次点击 Unity 图标打开视频')
      addUnityCameraDialogVisible.value = false
      return
    }

    unityCameraMap.value[iconId] = cameraId
    activeCameraId.value = cameraId
    cameraDialogVisible.value = true
    addUnityCameraDialogVisible.value = false
    pendingUnityIconId.value = null
    ElMessage.success('摄像头添加成功')
  } catch (error) {
    console.error('新增压风机 Unity 摄像头失败:', error)
    ElMessage.error('摄像头添加失败')
  } finally {
    addUnityCameraLoading.value = false
  }
}

/**
 * 将业务数据拼接成 Unity 约定的字符串格式
 * 例如: "0.8|220|15|..." 或者 JSON 字符串，取决于 C# 怎么解析
 */
function formatDataForUnity(data: CompressorRealtimeData): string {
  if (!data) return "";

  const num = (v: unknown) => (typeof v === 'number' ? formatDecimal(v) : (v ?? '--'))
  const boolText = (v: unknown) => (toBool(v as BooleanLike) ? '开' : '关')

  return "电压：" + num(data.voltage) + "V"
    + ",电流：" + num(data.current) + "A"
    + ",电机振动：" + num(data.motor_vibration) + "mm/s"
    + ",主机振动：" + num(data.host_vibration) + "mm/s"
    + "|排气压力：" + num(data.exhaust_pressure) + "MPa"
    + ",分离压力：" + num(data.separation_pressure) + "MPa"
    + "|机组排气温度：" + num(data.unit_exhaust_temp) + "°C"
    + ",主机排气温度：" + num(data.host_exhaust_temp) + "°C"
    + ",风包温度：" + num(data.air_tank_temp) + "°C"
    + ",运行温度：" + num(data.running_temp) + "°C"
    + "|运行反馈：" + boolText(data.running_feedback)
    + ",故障存在：" + boolText(data.fault_exist)
    + ",通信状态：" + boolText(data.comm_status)
    + ",加卸载模式：" + boolText(data.load_unload_mode);
}

/**
 * 获取数据并同步给 Unity
 */
async function loadAllRealtime() {
  await Promise.allSettled(EQUIPMENT_CODES.map(async (code) => {
    try {
      const res = await getRealtimeDataApi(code)
      unitState.value[code].data = res.data as CompressorRealtimeData
      unitState.value[code].error = null
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '加载失败'
      unitState.value[code].error = message
    }
  }))

  const active = unitState.value[activeUnityCode.value]?.data
  if (unityInstance && active) {
    const msg = formatDataForUnity(active)
    unityInstance.SendMessage(UNITY_TARGET_OBJ, UNITY_METHOD_NAME, msg)
  }
}

/**
 * 初始化 Unity 实例
 */
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
          console.log("Unity Load Success")
          unityInstance = instance
          // 加载完成后立即推送一次当前数据
          const active = unitState.value[activeUnityCode.value]?.data
          if (active && unityInstance) {
            const msg = formatDataForUnity(active)
            unityInstance.SendMessage(UNITY_TARGET_OBJ, UNITY_METHOD_NAME, msg)
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
  // Unity WebGL 的 .jslib 会调用这个全局函数，把场景图标编号传给 Vue。
  window.handleUnityIconClick = openCameraFromUnity

  // 1. 先获取一次数据
  loadAllRealtime()

  // 2. 加载压风机 Unity 摄像头映射
  loadUnityCameraMap()

  // 3. 初始化 Unity
  initUnity()

  // 4. 开启轮询 (参考代码是3秒)
  refreshTimer = window.setInterval(loadAllRealtime, 2000)
})

watch(activeUnityCode, () => {
  const active = unitState.value[activeUnityCode.value]?.data
  if (unityInstance && active) {
    const msg = formatDataForUnity(active)
    unityInstance.SendMessage(UNITY_TARGET_OBJ, UNITY_METHOD_NAME, msg)
  }
})

onUnmounted(() => {
  // 离开压风机页面时清理全局回调，避免其他页面误触发旧弹窗逻辑。
  window.handleUnityIconClick = undefined

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

/* Unity 摄像头绑定弹窗：覆盖 Element Plus 默认白底，让它融入压风机大屏风格。 */
:global(.unity-camera-dialog) {
  --el-dialog-bg-color: rgba(4, 18, 42, 0.96);
  --el-text-color-primary: #edf8ff;
  --el-text-color-regular: rgba(237, 248, 255, 0.78);
  --el-border-color: rgba(92, 207, 255, 0.28);
  overflow: hidden;
  border: 1px solid rgba(92, 207, 255, 0.36);
  border-radius: 8px;
  background:
    radial-gradient(circle at 12% 0%, rgba(39, 196, 255, 0.18), transparent 34%),
    linear-gradient(180deg, rgba(10, 39, 82, 0.98), rgba(3, 14, 34, 0.98));
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.45),
    inset 0 0 32px rgba(30, 144, 255, 0.08);
}

:global(.unity-camera-dialog .el-dialog__header) {
  padding: 0;
  margin-right: 0;
}

:global(.unity-camera-dialog .el-dialog__headerbtn) {
  top: 16px;
  right: 18px;
}

:global(.unity-camera-dialog .el-dialog__close) {
  color: rgba(237, 248, 255, 0.72);
}

:global(.unity-camera-dialog .el-dialog__body) {
  padding: 0 22px 18px;
}

:global(.unity-camera-dialog .el-dialog__footer) {
  padding: 0 22px 22px;
}

.unity-camera-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 54px 18px 22px;
  border-bottom: 1px solid rgba(92, 207, 255, 0.16);
}

.unity-camera-kicker {
  margin-bottom: 5px;
  color: #58d8ff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
}

.unity-camera-title {
  color: #f5fbff;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.2;
}

.unity-camera-location {
  max-width: 180px;
  padding: 7px 10px;
  border: 1px solid rgba(76, 211, 255, 0.42);
  border-radius: 6px;
  background: rgba(11, 46, 88, 0.78);
  color: #9feaff;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: inset 0 0 18px rgba(76, 211, 255, 0.08);
}

.unity-camera-panel {
  padding-top: 18px;
}

.unity-camera-summary {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
  padding: 14px;
  border: 1px solid rgba(92, 207, 255, 0.22);
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(15, 61, 105, 0.72), rgba(7, 31, 62, 0.52));
}

.unity-camera-summary-icon {
  position: relative;
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(82, 224, 255, 0.45);
  border-radius: 8px;
  background: rgba(15, 64, 108, 0.92);
  box-shadow: inset 0 0 18px rgba(82, 224, 255, 0.14);
}

.unity-camera-summary-icon::before {
  content: '';
  position: absolute;
  left: 11px;
  top: 13px;
  width: 20px;
  height: 15px;
  border: 2px solid #78e7ff;
  border-radius: 5px;
}

.unity-camera-summary-icon::after {
  content: '';
  position: absolute;
  right: 7px;
  top: 16px;
  width: 8px;
  height: 10px;
  background: #78e7ff;
  clip-path: polygon(0 18%, 100% 0, 100% 100%, 0 82%);
}

.unity-camera-summary-content {
  min-width: 0;
}

.unity-camera-summary-title {
  margin-bottom: 5px;
  color: #f5fbff;
  font-size: 15px;
  font-weight: 800;
}

.unity-camera-summary-text {
  color: rgba(237, 248, 255, 0.68);
  font-size: 13px;
  line-height: 1.5;
}

.unity-camera-form {
  margin-top: 2px;
}

.unity-camera-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 14px;
}

.unity-camera-full {
  grid-column: 1 / -1;
}

:global(.unity-camera-dialog .el-form-item) {
  margin-bottom: 0;
}

:global(.unity-camera-dialog .el-form-item__label) {
  margin-bottom: 7px;
  color: rgba(237, 248, 255, 0.76);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
}

:global(.unity-camera-dialog .el-input__wrapper) {
  min-height: 40px;
  border: 1px solid rgba(92, 207, 255, 0.22);
  border-radius: 6px;
  background: rgba(5, 22, 50, 0.86);
  box-shadow: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

:global(.unity-camera-dialog .el-input__wrapper:hover) {
  border-color: rgba(92, 207, 255, 0.44);
  background: rgba(7, 29, 62, 0.92);
}

:global(.unity-camera-dialog .el-input__wrapper.is-focus) {
  border-color: rgba(74, 163, 255, 0.9);
  box-shadow: 0 0 0 2px rgba(74, 163, 255, 0.16);
}

:global(.unity-camera-dialog .el-input__inner) {
  color: #f5fbff;
}

:global(.unity-camera-dialog .el-input__inner::placeholder) {
  color: rgba(190, 218, 236, 0.44);
}

.unity-camera-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:global(.unity-camera-actions .el-button) {
  min-width: 96px;
  height: 38px;
  border-radius: 6px;
  font-weight: 700;
}

:global(.unity-camera-cancel) {
  border-color: rgba(150, 188, 214, 0.34);
  background: rgba(8, 27, 56, 0.72);
  color: rgba(237, 248, 255, 0.82);
}

:global(.unity-camera-cancel:hover) {
  border-color: rgba(92, 207, 255, 0.48);
  background: rgba(10, 41, 78, 0.86);
  color: #f5fbff;
}

:global(.unity-camera-submit) {
  border: none;
  background: linear-gradient(135deg, #1f8fff, #20d2ff);
  box-shadow: 0 10px 22px rgba(31, 143, 255, 0.28);
}

:global(.unity-camera-submit:hover) {
  background: linear-gradient(135deg, #2ea0ff, #43ddff);
}

@media (max-width: 640px) {
  :global(.unity-camera-dialog) {
    width: calc(100vw - 28px) !important;
  }

  .unity-camera-header {
    align-items: flex-start;
    flex-direction: column;
    padding-right: 48px;
  }

  .unity-camera-location {
    max-width: 100%;
  }

  .unity-camera-grid {
    grid-template-columns: 1fr;
  }
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

/* 底部 7 卡片布局 */
.bottom-panel {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 8px;
  z-index: 12;
  pointer-events: auto;
}

.bottom-panel-title {
  margin: 0 0 6px 0;
  padding: 8px 12px;
  border: 1px solid rgba(0, 188, 212, 0.25);
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(0, 188, 212, 0.10), rgba(0, 188, 212, 0.05));
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 18px rgba(0,0,0,0.25);
  font-weight: 700;
  letter-spacing: 1px;
  font-size: 14px;
}

.unit-row {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
  overflow: hidden;
  padding-bottom: 2px;
}

.unit-card {
  border: 1px solid rgba(0, 188, 212, 0.28);
  border-radius: 9px;
  background: linear-gradient(180deg, rgba(0, 188, 212, 0.10), rgba(0, 188, 212, 0.04));
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.25), inset 0 0 30px rgba(0, 188, 212, 0.05);
  padding: 6px;
  cursor: pointer;
  user-select: none;
  height: 275px;
  display: flex;
  flex-direction: column;
}

.unit-card.active {
  border-color: rgba(30, 144, 255, 0.75);
  box-shadow: 0 10px 24px rgba(30, 144, 255, 0.20), inset 0 0 40px rgba(30, 144, 255, 0.10);
}

.unit-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.unit-code {
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 1px;
}

.unit-status-dots {
  display: flex;
  gap: 6px;
  align-items: center;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.35);
  box-shadow: 0 0 10px rgba(0,0,0,0.3);
}

.dot-on {
  background: #34d399;
}

.dot-off {
  background: #ef4444;
}

.dot-unknown {
  background: #94a3b8;
}

.unit-subheader {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 4px;
}

.subitem {
  width: 26px;
  text-align: center;
}

.unit-time {
  margin-left: auto;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.70);
  white-space: nowrap;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unit-scroll {
  flex: 1;
  overflow: auto;
  padding-right: 2px;
}

.group-block {
  margin-bottom: 5px;
}

.group-title {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
  padding: 3px 4px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.08);
  border: none;
  margin-bottom: 3px;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2px 6px;
}

.field-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  column-gap: 6px;
  align-items: baseline;
  padding: 1px 0;
  border-radius: 0;
  background: transparent;
  border: none;
}

.field-row.full-row {
  grid-column: 1 / -1;
}

.field-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.70);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.field-value {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
  white-space: nowrap;
}

@media (max-width: 1600px) {
  .unit-card {
    height: 255px;
    padding: 5px;
  }
  .bottom-panel-title {
    font-size: 13px;
    padding: 7px 10px;
  }
  .group-title,
  .field-label,
  .field-value,
  .unit-subheader,
  .unit-time {
    font-size: 9px;
  }
}

.field-value.is-on {
  color: #34d399;
}

.field-value.is-off {
  color: #ef4444;
}

.field-value.is-unknown {
  color: #cbd5e1;
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
