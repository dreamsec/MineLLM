<template>
  <div class="ai-fault-diagnosis">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <h1>AI多模态智能故障诊断</h1>
        <p>基于大模型的多模态数据分析与故障诊断</p>
      </div>
      <div class="header-actions">
        <button class="action-btn primary" @click="startDiagnosis" :disabled="!selectedDevice">
          <i class="fas fa-search"></i>
          开始诊断
        </button>
        <button class="action-btn secondary" @click="exportReport" :disabled="!diagnosisResult">
          <i class="fas fa-download"></i>
          导出报告
        </button>
      </div>
    </div>

    <!-- 设备选择区域 -->
    <div class="device-selection-panel">
      <h3>设备选择</h3>
      <div class="device-grid">
        <div
          v-for="device in devices"
          :key="device.id"
          :class="[
            'device-card',
            { active: selectedDevice?.id === device.id, fault: device.hasFault },
          ]"
          @click="selectDevice(device)"
        >
          <div class="device-icon">
            <i :class="device.icon"></i>
          </div>
          <div class="device-info">
            <h4>{{ device.name }}</h4>
            <p>{{ device.location }}</p>
            <div class="device-status">
              <span :class="['status-dot', device.status]"></span>
              <span class="status-text">{{ getStatusText(device.status) }}</span>
            </div>
          </div>
          <div v-if="device.hasFault" class="fault-indicator">
            <i class="fas fa-exclamation-triangle"></i>
            <span>{{ device.faultCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 多模态数据展示区域 -->
    <div v-if="selectedDevice" class="multimodal-data-panel">
      <h3>多模态数据采集</h3>
      <div class="data-sources">
        <div class="data-source-card">
          <div class="source-header">
            <i class="fas fa-video"></i>
            <h4>视频监控</h4>
            <span :class="['status-indicator', videoStatus]">{{
              videoStatus === 'online' ? '在线' : '离线'
            }}</span>
          </div>
          <div class="video-display">
            <div class="video-frame">
              <div class="video-placeholder">
                <i class="fas fa-play-circle"></i>
                <p>设备实时监控画面</p>
                <p class="device-info">{{ selectedDevice.name }} - 摄像头 #001</p>
              </div>
              <div class="video-overlay">
                <div
                  v-for="detection in videoDetections"
                  :key="detection.id"
                  :class="['detection-box', detection.type]"
                  :style="{
                    left: detection.x + '%',
                    top: detection.y + '%',
                    width: detection.width + '%',
                    height: detection.height + '%',
                  }"
                >
                  <span class="detection-label">{{ detection.label }}</span>
                </div>
              </div>
            </div>
            <div class="video-controls">
              <button class="control-btn" @click="toggleRecording">
                <i :class="isRecording ? 'fas fa-stop' : 'fas fa-record-vinyl'"></i>
                {{ isRecording ? '停止录制' : '开始录制' }}
              </button>
            </div>
          </div>
        </div>

        <div class="data-source-card">
          <div class="source-header">
            <i class="fas fa-volume-up"></i>
            <h4>音频分析</h4>
            <span class="status-indicator online">采集中</span>
          </div>
          <div class="audio-analysis">
            <div class="audio-waveform">
              <canvas ref="audioCanvas" width="300" height="120"></canvas>
            </div>
            <div class="audio-metrics">
              <div class="metric-item">
                <span class="label">音量等级:</span>
                <span class="value">{{ audioMetrics.volume }}dB</span>
              </div>
              <div class="metric-item">
                <span class="label">主频率:</span>
                <span class="value">{{ audioMetrics.frequency }}Hz</span>
              </div>
              <div class="metric-item">
                <span class="label">异常检测:</span>
                <span :class="['value', audioMetrics.anomaly ? 'warning' : 'normal']">
                  {{ audioMetrics.anomaly ? '异常' : '正常' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="data-source-card">
          <div class="source-header">
            <i class="fas fa-wave-square"></i>
            <h4>振动监测</h4>
            <span class="status-indicator online">实时监测</span>
          </div>
          <div class="vibration-data">
            <div class="vibration-chart">
              <canvas ref="vibrationCanvas" width="300" height="180"></canvas>
            </div>
            <div class="vibration-analysis">
              <div class="frequency-bands">
                <div v-for="band in vibrationBands" :key="band.name" class="band-item">
                  <span class="band-name">{{ band.name }}</span>
                  <div class="band-bar">
                    <div
                      class="bar-fill"
                      :style="{
                        width: band.value + '%',
                        backgroundColor: getBandColor(band.value),
                      }"
                    ></div>
                  </div>
                  <span class="band-value">{{ band.value }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="data-source-card">
          <div class="source-header">
            <i class="fas fa-thermometer-half"></i>
            <h4>温度监测</h4>
            <span class="status-indicator online">实时监测</span>
          </div>
          <div class="temperature-data">
            <div class="temperature-grid">
              <div v-for="sensor in temperatureSensors" :key="sensor.id" class="temp-sensor">
                <div class="sensor-name">{{ sensor.name }}</div>
                <div class="sensor-value">
                  <span :class="['temp-value', getTempStatus(sensor.value)]"
                    >{{ sensor.value }}°C</span
                  >
                </div>
                <div class="sensor-trend">
                  <i :class="getTrendIcon(sensor.trend)"></i>
                  <span>{{ sensor.trend > 0 ? '+' : '' }}{{ sensor.trend }}°C/h</span>
                </div>
              </div>
            </div>
            <div class="temperature-map">
              <div class="heatmap-placeholder">温度分布热力图</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI诊断结果 -->
    <div v-if="diagnosisResult" class="diagnosis-result-panel">
      <h3>AI诊断结果</h3>
      <div class="diagnosis-content">
        <div class="diagnosis-summary">
          <div class="summary-card">
            <div class="summary-header">
              <i :class="['status-icon', diagnosisResult.severity]"></i>
              <h4>{{ diagnosisResult.title }}</h4>
              <span class="confidence-badge">置信度: {{ diagnosisResult.confidence }}%</span>
            </div>
            <p class="diagnosis-description">{{ diagnosisResult.description }}</p>
            <div class="diagnosis-time">
              <span>诊断时间: {{ diagnosisResult.timestamp }}</span>
              <span>耗时: {{ diagnosisResult.duration }}秒</span>
            </div>
          </div>
        </div>

        <div class="evidence-analysis">
          <h4>证据链分析</h4>
          <div class="evidence-list">
            <div
              v-for="evidence in diagnosisResult.evidences"
              :key="evidence.id"
              class="evidence-item"
            >
              <div class="evidence-header">
                <i :class="evidence.icon"></i>
                <span class="evidence-type">{{ evidence.type }}</span>
                <span class="evidence-weight">权重: {{ evidence.weight }}%</span>
              </div>
              <p class="evidence-description">{{ evidence.description }}</p>
              <div class="evidence-data">
                <span class="data-value">{{ evidence.value }}</span>
                <span class="data-threshold">阈值: {{ evidence.threshold }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="solution-recommendations">
          <h4>解决方案推荐</h4>
          <div class="solution-steps">
            <div
              v-for="(step, index) in diagnosisResult.solutions"
              :key="index"
              class="solution-step"
            >
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-content">
                <h5>{{ step.title }}</h5>
                <p>{{ step.description }}</p>
                <div class="step-details">
                  <span class="priority" :class="step.priority">{{
                    getPriorityText(step.priority)
                  }}</span>
                  <span class="duration">预计耗时: {{ step.duration }}</span>
                  <span class="cost">预计成本: ¥{{ step.cost }}</span>
                </div>
              </div>
              <div class="step-actions">
                <button class="action-btn small" @click="createWorkOrder(step)">生成工单</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史诊断记录 -->
    <div class="diagnosis-history-panel">
      <h3>历史诊断记录</h3>
      <div class="history-filters">
        <select v-model="historyFilter.device" class="filter-select">
          <option value="">全部设备</option>
          <option v-for="device in devices" :key="device.id" :value="device.id">
            {{ device.name }}
          </option>
        </select>
        <select v-model="historyFilter.severity" class="filter-select">
          <option value="">全部级别</option>
          <option value="critical">严重</option>
          <option value="warning">警告</option>
          <option value="normal">正常</option>
        </select>
        <input type="date" v-model="historyFilter.date" class="filter-input" />
      </div>
      <div class="history-table">
        <table>
          <thead>
            <tr>
              <th>设备名称</th>
              <th>故障类型</th>
              <th>严重程度</th>
              <th>诊断时间</th>
              <th>处理状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in filteredHistory" :key="record.id">
              <td>{{ record.deviceName }}</td>
              <td>{{ record.faultType }}</td>
              <td>
                <span :class="['severity-badge', record.severity]">{{
                  getSeverityText(record.severity)
                }}</span>
              </td>
              <td>{{ record.timestamp }}</td>
              <td>
                <span :class="['status-badge', record.status]">{{
                  getStatusText(record.status)
                }}</span>
              </td>
              <td>
                <button class="action-btn small" @click="viewRecord(record)">查看</button>
                <button class="action-btn small secondary" @click="downloadReport(record)">
                  下载
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

// 定义组件名称
defineOptions({
  name: 'AIDiagnosisCenter'
})

// 定义类型接口
interface Device {
  id: string
  name: string
  location: string
  status: 'normal' | 'warning' | 'critical'
  icon: string
  hasFault: boolean
  faultCount: number
  videoFeed: string
}

interface VideoDetection {
  id: number
  x: number
  y: number
  width: number
  height: number
  type: string
  label: string
}

interface VibrationBand {
  name: string
  value: number
}

interface TemperatureSensor {
  id: number
  name: string
  value: number
  trend: number
}

interface Evidence {
  id: number
  type: string
  icon: string
  weight: number
  description: string
  value: string
  threshold: string
}

interface Solution {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  duration: string
  cost: number
}

interface DiagnosisResult {
  title: string
  description: string
  confidence: number
  severity: string
  timestamp: string
  duration: number
  evidences: Evidence[]
  solutions: Solution[]
}

interface HistoryRecord {
  id: number
  deviceName: string
  faultType: string
  severity: string
  timestamp: string
  status: string
}

// 响应式数据
const selectedDevice = ref<Device | null>(null)
const diagnosisResult = ref<DiagnosisResult | null>(null)
const isRecording = ref<boolean>(false)
const videoStatus = ref<string>('online')
const audioCanvas = ref<HTMLCanvasElement | null>(null)
const vibrationCanvas = ref<HTMLCanvasElement | null>(null)

// 设备列表
const devices = ref<Device[]>([
  {
    id: '1',
    name: '主提升机1#',
    location: '主井井口',
    status: 'warning',
    icon: 'fas fa-arrow-up',
    hasFault: true,
    faultCount: 2,
    videoFeed: '/api/video/device1',
  },
  {
    id: '2',
    name: '主通风机1#',
    location: '通风机房',
    status: 'normal',
    icon: 'fas fa-wind',
    hasFault: false,
    faultCount: 0,
    videoFeed: '/api/video/device2',
  },
  {
    id: '3',
    name: '排水泵1#',
    location: '水泵房',
    status: 'critical',
    icon: 'fas fa-tint',
    hasFault: true,
    faultCount: 1,
    videoFeed: '/api/video/device3',
  },
  {
    id: '4',
    name: '皮带运输机1#',
    location: '主运输巷道',
    status: 'normal',
    icon: 'fas fa-truck',
    hasFault: false,
    faultCount: 0,
    videoFeed: '/api/video/device4',
  },
])

// 视频检测结果
const videoDetections = ref<VideoDetection[]>([
  {
    id: 1,
    x: 30,
    y: 40,
    width: 20,
    height: 15,
    type: 'anomaly',
    label: '异常振动',
  },
  {
    id: 2,
    x: 60,
    y: 25,
    width: 15,
    height: 20,
    type: 'normal',
    label: '正常运行',
  },
])

// 音频指标
const audioMetrics = reactive({
  volume: 72,
  frequency: 1250,
  anomaly: true,
})

// 振动频段数据
const vibrationBands = ref<VibrationBand[]>([
  { name: '0-50Hz', value: 85 },
  { name: '50-100Hz', value: 45 },
  { name: '100-200Hz', value: 92 },
  { name: '200-500Hz', value: 38 },
  { name: '500Hz+', value: 15 },
])

// 温度传感器数据
const temperatureSensors = ref<TemperatureSensor[]>([
  { id: 1, name: '轴承1', value: 85, trend: 2.5 },
  { id: 2, name: '轴承2', value: 78, trend: -1.2 },
  { id: 3, name: '电机', value: 92, trend: 3.8 },
  { id: 4, name: '减速器', value: 75, trend: 0.5 },
])

// 历史记录过滤器
const historyFilter = reactive({
  device: '',
  severity: '',
  date: '',
})

// 历史记录数据
const diagnosisHistory = ref<HistoryRecord[]>([
  {
    id: 1,
    deviceName: '主提升机1#',
    faultType: '轴承磨损',
    severity: 'warning',
    timestamp: '2025-08-07 10:30:00',
    status: 'processing',
  },
  {
    id: 2,
    deviceName: '排水泵1#',
    faultType: '密封泄漏',
    severity: 'critical',
    timestamp: '2025-08-07 09:15:00',
    status: 'completed',
  },
  {
    id: 3,
    deviceName: '主通风机1#',
    faultType: '正常检测',
    severity: 'normal',
    timestamp: '2025-08-07 08:45:00',
    status: 'completed',
  },
])

// 计算属性
const filteredHistory = computed(() => {
  return diagnosisHistory.value.filter((record) => {
    if (historyFilter.device && record.deviceName !== getDeviceName(historyFilter.device))
      return false
    if (historyFilter.severity && record.severity !== historyFilter.severity) return false
    if (historyFilter.date && !record.timestamp.includes(historyFilter.date)) return false
    return true
  })
})

// 方法
const selectDevice = (device: Device) => {
  selectedDevice.value = device
  // 重置诊断结果
  diagnosisResult.value = null
}

const startDiagnosis = async () => {
  if (!selectedDevice.value) return

  // 模拟AI诊断过程
  // 这里可以调用实际的AI诊断API
  setTimeout(() => {
    diagnosisResult.value = {
      title: '轴承异常磨损检测',
      description: '通过多模态数据分析，检测到主轴承存在异常磨损现象，建议及时维护。',
      confidence: 92,
      severity: 'warning',
      timestamp: new Date().toLocaleString(),
      duration: 3.2,
      evidences: [
        {
          id: 1,
          type: '振动分析',
          icon: 'fas fa-wave-square',
          weight: 35,
          description: '100-200Hz频段振动幅值超出正常范围',
          value: '0.8mm/s',
          threshold: '< 0.5mm/s',
        },
        {
          id: 2,
          type: '温度监测',
          icon: 'fas fa-thermometer-half',
          weight: 30,
          description: '轴承温度持续上升，超出预警阈值',
          value: '85°C',
          threshold: '< 80°C',
        },
        {
          id: 3,
          type: '音频分析',
          icon: 'fas fa-volume-up',
          weight: 25,
          description: '检测到异常摩擦声音特征',
          value: '异常',
          threshold: '正常',
        },
        {
          id: 4,
          type: '视频分析',
          icon: 'fas fa-video',
          weight: 10,
          description: '轴承部位可见异常振动',
          value: '检测到',
          threshold: '无',
        },
      ],
      solutions: [
        {
          title: '紧急停机检查',
          description: '立即停止设备运行，进行详细检查',
          priority: 'high',
          duration: '30分钟',
          cost: 500,
        },
        {
          title: '轴承更换',
          description: '更换磨损的轴承及相关配件',
          priority: 'high',
          duration: '4小时',
          cost: 8500,
        },
        {
          title: '润滑系统检查',
          description: '检查润滑油质量和供油系统',
          priority: 'medium',
          duration: '1小时',
          cost: 200,
        },
      ],
    }
  }, 3000)
}

const exportReport = () => {
  // 导出诊断报告逻辑
  console.log('导出报告')
}

const toggleRecording = () => {
  isRecording.value = !isRecording.value
}

const createWorkOrder = (step: Solution) => {
  // 生成工单逻辑
  console.log('生成工单:', step)
}

const viewRecord = (record: HistoryRecord) => {
  // 查看历史记录详情
  console.log('查看记录:', record)
}

const downloadReport = (record: HistoryRecord) => {
  // 下载报告
  console.log('下载报告:', record)
}

// 辅助方法
const getStatusText = (status: string) => {
  const statusMap = {
    normal: '正常',
    warning: '警告',
    critical: '严重',
    processing: '处理中',
    completed: '已完成',
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const getSeverityText = (severity: string) => {
  const severityMap = {
    normal: '正常',
    warning: '警告',
    critical: '严重',
  }
  return severityMap[severity as keyof typeof severityMap] || severity
}

const getPriorityText = (priority: string) => {
  const priorityMap = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级',
  }
  return priorityMap[priority as keyof typeof priorityMap] || priority
}

const getBandColor = (value: number) => {
  if (value > 80) return '#f44336'
  if (value > 60) return '#ff9800'
  return '#4caf50'
}

const getTempStatus = (temp: number) => {
  if (temp > 85) return 'critical'
  if (temp > 75) return 'warning'
  return 'normal'
}

const getTrendIcon = (trend: number) => {
  if (trend > 0) return 'fas fa-arrow-up'
  if (trend < 0) return 'fas fa-arrow-down'
  return 'fas fa-minus'
}

const getDeviceName = (deviceId: string) => {
  const device = devices.value.find((d) => d.id === deviceId)
  return device ? device.name : ''
}

// 绘制图表
const drawCharts = () => {
  // 音频波形图
  if (audioCanvas.value) {
    const ctx = audioCanvas.value.getContext('2d')
    if (ctx) {
      // 绘制音频波形
      ctx.clearRect(0, 0, 300, 120)
      ctx.strokeStyle = '#1890ff'
      ctx.lineWidth = 2
      ctx.beginPath()
      for (let i = 0; i < 300; i++) {
        const y = 60 + Math.sin(i * 0.1) * 30 + Math.random() * 10
        if (i === 0) ctx.moveTo(i, y)
        else ctx.lineTo(i, y)
      }
      ctx.stroke()
    }
  }

  // 振动频谱图
  if (vibrationCanvas.value) {
    const ctx = vibrationCanvas.value.getContext('2d')
    if (ctx) {
      // 绘制振动频谱
      ctx.clearRect(0, 0, 300, 180)
      ctx.fillStyle = '#1890ff'
      for (let i = 0; i < 50; i++) {
        const height = Math.random() * 150 + 10
        ctx.fillRect(i * 6, 180 - height, 4, height)
      }
    }
  }
}

// 生命周期
onMounted(() => {
  drawCharts()
  // 启动实时数据更新
  const updateInterval = setInterval(() => {
    // 更新实时数据
    drawCharts()
  }, 5000)

  onUnmounted(() => {
    clearInterval(updateInterval)
  })
})
</script>

<style scoped>
.ai-fault-diagnosis {
  background: #f5f5f5;
  height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px 20px 10px 20px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left h1 {
  margin: 0 0 8px 0;
  color: #333333;
  font-size: 24px;
  font-weight: 600;
}

.header-left p {
  margin: 0;
  color: #999999;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.action-btn.primary {
  background: #1890ff;
  color: white;
  border: 1px solid #1890ff;
}

.action-btn.primary:hover:not(:disabled) {
  background: #40a9ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  transform: translateY(-2px);
}

.action-btn.secondary {
  background: #ffffff;
  color: #666666;
  border: 1px solid #d9d9d9;
}

.action-btn.secondary:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
  background: #f0f8ff;
}

.action-btn.small {
  padding: 6px 12px;
  font-size: 12px;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

/* 设备选择样式 */
.device-selection-panel,
.multimodal-data-panel,
.diagnosis-result-panel,
.diagnosis-history-panel {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.device-selection-panel h3,
.multimodal-data-panel h3,
.diagnosis-result-panel h3,
.diagnosis-history-panel h3 {
  margin: 0 0 20px 0;
  color: #333333;
  font-size: 18px;
  font-weight: 600;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.device-card {
  padding: 20px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: #fafafa;
}

.device-card:hover {
  border-color: #1890ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

.device-card.active {
  border-color: #1890ff;
  background: #f0f8ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

.device-card.fault {
  border-color: #ff4d4f;
  background: rgba(255, 77, 79, 0.05);
}

.device-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.device-icon i {
  font-size: 24px;
  color: white;
}

.device-info h4 {
  margin: 0 0 8px 0;
  color: #333333;
  font-size: 16px;
  font-weight: 600;
}

.device-info p {
  margin: 0 0 12px 0;
  color: #999999;
  font-size: 14px;
}

.device-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.normal {
  background: #52c41a;
  animation: pulse 2s infinite;
}
.status-dot.warning {
  background: #faad14;
  animation: pulse 2s infinite;
}
.status-dot.critical {
  background: #ff4d4f;
  animation: pulse 2s infinite;
}

.status-text {
  color: #666666;
  font-size: 12px;
}

.fault-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #ff4d4f;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  animation: pulse 2s infinite;
}

/* 多模态数据样式 */
.data-sources {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.data-source-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
  background: #fafafa;
  transition: all 0.3s ease;
}

.data-source-card:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.source-header {
  padding: 16px;
  background: #f0f8ff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  gap: 12px;
}

.source-header i {
  color: #1890ff;
  font-size: 18px;
}

.source-header h4 {
  margin: 0;
  flex: 1;
  color: #333333;
  font-weight: 600;
}

.status-indicator {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-indicator.online {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  border: 1px solid #52c41a;
}

.video-display,
.audio-analysis,
.vibration-data,
.temperature-data {
  padding: 16px;
}

.video-frame {
  position: relative;
  background: #000000;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  height: 200px;
  overflow: hidden;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.video-placeholder i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.7;
}

.video-placeholder p {
  margin: 4px 0;
  opacity: 0.8;
}

.device-info {
  font-size: 12px !important;
  opacity: 0.6 !important;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.detection-box {
  position: absolute;
  border: 2px solid;
}

.detection-box.anomaly {
  border-color: #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
}

.detection-box.normal {
  border-color: #52c41a;
  background: rgba(82, 196, 26, 0.1);
}

.detection-label {
  position: absolute;
  top: -24px;
  left: 0;
  background: #ffffff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #333333;
  border: 1px solid #e8e8e8;
}

.video-controls {
  margin-top: 12px;
  text-align: center;
}

.control-btn {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: 1px solid #1890ff;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: #40a9ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  transform: translateY(-1px);
}

.audio-waveform,
.vibration-chart {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.audio-metrics {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.metric-item .label {
  color: #999999;
}

.metric-item .value {
  font-weight: 600;
  color: #666666;
}

.metric-item .value.warning {
  color: #ff4d4f;
}

.metric-item .value.normal {
  color: #52c41a;
}

.band-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.band-name {
  min-width: 80px;
  font-size: 12px;
  color: #999999;
}

.band-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.band-value {
  min-width: 40px;
  text-align: right;
  font-size: 12px;
  color: #999999;
}

.temperature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.temp-sensor {
  padding: 12px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  text-align: center;
  transition: all 0.3s ease;
}

.temp-sensor:hover {
  border-color: #1890ff;
}

.sensor-name {
  font-size: 12px;
  color: #999999;
  margin-bottom: 8px;
}

.temp-value {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.temp-value.normal {
  color: #52c41a;
}
.temp-value.warning {
  color: #faad14;
}
.temp-value.critical {
  color: #ff4d4f;
}

.sensor-trend {
  font-size: 12px;
  color: #999999;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.temperature-map {
  height: 120px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999999;
}

/* 诊断结果样式 */
.diagnosis-content {
  display: grid;
  gap: 24px;
}

.summary-card {
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fafafa;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.status-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.status-icon.warning {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
  border: 1px solid #faad14;
}

.status-icon.critical {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
}

.summary-header h4 {
  margin: 0;
  flex: 1;
  color: #333333;
  font-weight: 600;
}

.confidence-badge {
  padding: 4px 12px;
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
  border: 1px solid #1890ff;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.diagnosis-description {
  color: #666666;
  line-height: 1.6;
  margin-bottom: 16px;
}

.diagnosis-time {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999999;
}

.evidence-analysis h4,
.solution-recommendations h4 {
  margin: 0 0 16px 0;
  color: #333333;
  font-size: 16px;
  font-weight: 600;
}

.evidence-list {
  display: grid;
  gap: 12px;
}

.evidence-item {
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: #ffffff;
  transition: all 0.3s ease;
}

.evidence-item:hover {
  border-color: #1890ff;
}

.evidence-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.evidence-header i {
  color: #1890ff;
}

.evidence-type {
  font-weight: 600;
  color: #333333;
  flex: 1;
}

.evidence-weight {
  padding: 2px 8px;
  background: #f0f0f0;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-size: 12px;
  color: #999999;
}

.evidence-description {
  color: #666666;
  margin-bottom: 8px;
  line-height: 1.5;
}

.evidence-data {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.data-value {
  font-weight: 600;
  color: #ff4d4f;
}

.data-threshold {
  color: #999999;
}

.solution-steps {
  display: grid;
  gap: 16px;
}

.solution-step {
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: #ffffff;
  transition: all 0.3s ease;
}

.solution-step:hover {
  border-color: #1890ff;
}

.step-number {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.step-content {
  flex: 1;
}

.step-content h5 {
  margin: 0 0 8px 0;
  color: #333333;
  font-weight: 600;
}

.step-content p {
  margin: 0 0 12px 0;
  color: #666666;
  line-height: 1.5;
}

.step-details {
  display: flex;
  gap: 16px;
  font-size: 12px;
}

.priority {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  border: 1px solid;
}

.priority.high {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.priority.medium {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
  border-color: #faad14;
}

.priority.low {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  border-color: #52c41a;
}

.duration,
.cost {
  color: #999999;
}

.step-actions {
  display: flex;
  align-items: center;
}

/* 历史记录样式 */
.history-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-select,
.filter-input {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  background: #ffffff;
  color: #666666;
  transition: all 0.3s ease;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.history-table {
  overflow-x: auto;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: #ffffff;
}

.history-table table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th,
.history-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e8e8e8;
}

.history-table th {
  background: #f0f8ff;
  font-weight: 600;
  color: #333333;
}

.history-table td {
  color: #666666;
}

.severity-badge,
.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid;
}

.severity-badge.normal {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  border-color: #52c41a;
}

.severity-badge.warning {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
  border-color: #faad14;
}

.severity-badge.critical {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.status-badge.processing {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
  border-color: #1890ff;
}

.status-badge.completed {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  border-color: #52c41a;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
  }

  .device-grid {
    grid-template-columns: 1fr;
  }

  .data-sources {
    grid-template-columns: 1fr;
  }

  .temperature-grid {
    grid-template-columns: 1fr;
  }

  .solution-step {
    flex-direction: column;
    gap: 12px;
  }

  .step-details {
    flex-direction: column;
    gap: 8px;
  }

  .history-filters {
    flex-direction: column;
  }
}
</style>
