<template>
  <div class="monitoring-center">
    <!-- 二级菜单导航 -->
    <div class="category-nav">
      <div
        v-for="category in categories"
        :key="category.id"
        :class="['nav-item', { active: activeCategory === category.id }]"
        @click="switchCategory(category.id)"
      >
        <i :class="category.icon"></i>
        <span>{{ category.name }}</span>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧设备树形列表 -->
      <div class="equipment-panel">
        <div class="panel-header">
          <h3>{{ currentCategory?.name }}设备列表</h3>
          <div class="status-summary">
            <span class="status-item normal">正常: {{ equipmentStats.normal }}</span>
            <span class="status-item warning">警告: {{ equipmentStats.warning }}</span>
            <span class="status-item error">故障: {{ equipmentStats.error }}</span>
          </div>
        </div>

        <div class="equipment-tree">
          <div
            v-for="equipment in filteredEquipment"
            :key="equipment.id"
            :class="['equipment-item', { active: selectedEquipment?.id === equipment.id }]"
            @click="selectEquipment(equipment)"
          >
            <div class="equipment-header">
              <i :class="getStatusIcon(equipment.status)"></i>
              <span class="equipment-name">{{ equipment.name }}</span>
              <div :class="['status-badge', equipment.status]">
                {{ getStatusText(equipment.status) }}
              </div>
            </div>

            <!-- 传感器子节点 -->
            <div v-if="equipment.sensors?.length" class="sensors-list">
              <div
                v-for="sensor in equipment.sensors"
                :key="sensor.id"
                :class="['sensor-item', { active: selectedSensor?.id === sensor.id }]"
                @click.stop="selectSensor(sensor, equipment)"
              >
                <i class="fas fa-circle sensor-dot"></i>
                <span>{{ sensor.name }}</span>
                <span class="sensor-value">{{ sensor.currentValue }}{{ sensor.unit }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧多模态监控区 -->
      <div class="monitoring-panel">
        <div v-if="selectedEquipment" class="monitoring-content">
          <!-- 第一行：视频监控 + 传感器仪表盘 -->
          <div class="monitoring-row">
            <!-- 视频监控区 -->
            <div class="video-panel">
              <div class="panel-title">
                <i class="fas fa-video"></i>
                实时视频监控
              </div>
              <div class="video-container">
                <div class="video-placeholder">
                  <i class="fas fa-play-circle"></i>
                  <p>设备实时监控画面</p>
                  <p class="device-info">{{ selectedEquipment.name }} - 摄像头 #001</p>
                </div>
                <div class="video-controls">
                  <button class="control-btn"><i class="fas fa-play"></i></button>
                  <button class="control-btn"><i class="fas fa-pause"></i></button>
                  <button class="control-btn"><i class="fas fa-expand"></i></button>
                </div>
              </div>
            </div>

            <!-- 传感器数据仪表盘 -->
            <div class="dashboard-panel">
              <div class="panel-title">
                <i class="fas fa-tachometer-alt"></i>
                传感器数据仪表盘
              </div>
              <div class="gauges-container">
                <div
                  v-for="sensor in selectedEquipment.sensors"
                  :key="sensor.id"
                  class="gauge-item"
                >
                  <div class="gauge-chart">
                    <svg viewBox="0 0 100 60" class="gauge-svg">
                      <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        stroke="#e0e0e0"
                        stroke-width="8"
                        fill="none"
                      />
                      <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        :stroke="getGaugeColor(sensor)"
                        stroke-width="8"
                        fill="none"
                        :stroke-dasharray="getGaugeDashArray(sensor)"
                        stroke-dashoffset="0"
                        stroke-linecap="round"
                      />
                      <text x="50" y="45" text-anchor="middle" class="gauge-value">
                        {{ sensor.currentValue }}
                      </text>
                      <text x="50" y="55" text-anchor="middle" class="gauge-unit">
                        {{ sensor.unit }}
                      </text>
                    </svg>
                  </div>
                  <div class="gauge-info">
                    <div class="gauge-name">{{ sensor.name }}</div>
                    <div class="gauge-range">
                      {{ sensor.currentValue }}/{{ sensor.maxValue }}{{ sensor.unit }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 第二行：音频频谱分析 + 故障预测曲线 -->
          <div class="monitoring-row">
            <!-- 音频频谱分析 -->
            <div class="spectrum-panel">
              <div class="panel-title">
                <i class="fas fa-wave-square"></i>
                音频频谱分析 (Mel频谱图)
              </div>
              <div class="spectrum-container">
                <canvas ref="spectrumCanvas" class="spectrum-canvas"></canvas>
                <div class="spectrum-controls">
                  <button class="control-btn" @click="toggleSpectrumRecording">
                    <i :class="isRecording ? 'fas fa-stop' : 'fas fa-microphone'"></i>
                    {{ isRecording ? '停止' : '开始' }}分析
                  </button>
                  <div class="frequency-info">
                    <span>频率范围: 0-8kHz</span>
                    <span>分辨率: 64 Mel</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 故障预测曲线 -->
            <div class="prediction-panel">
              <div class="panel-title">
                <i class="fas fa-chart-line"></i>
                故障预测曲线 (3天趋势)
              </div>
              <div class="prediction-container">
                <canvas ref="predictionCanvas" class="prediction-canvas"></canvas>
                <div class="prediction-legend">
                  <div class="legend-item">
                    <span class="legend-color normal"></span>
                    <span>正常范围</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color warning"></span>
                    <span>预警区间</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color danger"></span>
                    <span>危险区间</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 详细数据表格 -->
          <div class="data-table-panel">
            <div class="panel-title">
              <i class="fas fa-table"></i>
              实时数据详情
            </div>
            <div class="data-table">
              <table>
                <thead>
                  <tr>
                    <th>传感器</th>
                    <th>当前值</th>
                    <th>正常范围</th>
                    <th>状态</th>
                    <th>最后更新</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sensor in selectedEquipment.sensors" :key="sensor.id">
                    <td>{{ sensor.name }}</td>
                    <td class="value">{{ sensor.currentValue }}{{ sensor.unit }}</td>
                    <td>{{ sensor.minValue }}-{{ sensor.maxValue }}{{ sensor.unit }}</td>
                    <td>
                      <span :class="['status-tag', getSensorStatus(sensor)]">
                        {{ getSensorStatusText(sensor) }}
                      </span>
                    </td>
                    <td>{{ formatTime(sensor.lastUpdate) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 未选择设备时的提示 -->
        <div v-else class="empty-state">
          <i class="fas fa-mouse-pointer"></i>
          <h3>请选择设备</h3>
          <p>从左侧设备列表中选择一个设备来查看详细监控信息</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

// 定义组件名称
defineOptions({
  name: 'MonitoringCenter'
})

// 定义类型接口
interface Sensor {
  id: string
  name: string
  currentValue: number
  minValue: number
  maxValue: number
  unit: string
  lastUpdate: Date
}

interface Equipment {
  id: string
  name: string
  status: 'normal' | 'warning' | 'error'
  sensors: Sensor[]
}

interface Category {
  id: string
  name: string
  icon: string
}

// 设备分类
const categories: Category[] = [
  { id: 'lifting', name: '提升系统', icon: 'fas fa-arrow-up' },
  { id: 'ventilation', name: '通风系统', icon: 'fas fa-wind' },
  { id: 'air', name: '压风系统', icon: 'fas fa-compress-arrows-alt' },
  { id: 'drainage', name: '排水系统', icon: 'fas fa-tint' },
  { id: 'transport', name: '运输系统', icon: 'fas fa-truck' },
  { id: 'safety', name: '安全监测', icon: 'fas fa-shield-alt' },
]

const activeCategory = ref<string>('lifting')
const selectedEquipment = ref<Equipment | null>(null)
const selectedSensor = ref<Sensor | null>(null)
const isRecording = ref<boolean>(false)

// 设备数据
const equipmentData = ref<Record<string, Equipment[]>>({
  lifting: [
    {
      id: 'lift1',
      name: '主提升机1#',
      status: 'normal',
      sensors: [
        {
          id: 's1',
          name: '振动传感器',
          currentValue: 2.3,
          minValue: 0,
          maxValue: 5,
          unit: 'mm/s',
          lastUpdate: new Date(),
        },
        {
          id: 's2',
          name: '温度传感器',
          currentValue: 65,
          minValue: 0,
          maxValue: 70,
          unit: '℃',
          lastUpdate: new Date(),
        },
        {
          id: 's3',
          name: '电流传感器',
          currentValue: 28,
          minValue: 0,
          maxValue: 30,
          unit: 'A',
          lastUpdate: new Date(),
        },
      ],
    },
    {
      id: 'lift2',
      name: '副提升机2#',
      status: 'warning',
      sensors: [
        {
          id: 's4',
          name: '振动传感器',
          currentValue: 4.1,
          minValue: 0,
          maxValue: 5,
          unit: 'mm/s',
          lastUpdate: new Date(),
        },
        {
          id: 's5',
          name: '温度传感器',
          currentValue: 68,
          minValue: 0,
          maxValue: 70,
          unit: '℃',
          lastUpdate: new Date(),
        },
      ],
    },
  ],
  ventilation: [
    {
      id: 'vent1',
      name: '主通风机2#',
      status: 'normal',
      sensors: [
        {
          id: 's6',
          name: '风速传感器',
          currentValue: 15.2,
          minValue: 10,
          maxValue: 20,
          unit: 'm/s',
          lastUpdate: new Date(),
        },
        {
          id: 's7',
          name: '压力传感器',
          currentValue: 850,
          minValue: 800,
          maxValue: 1000,
          unit: 'Pa',
          lastUpdate: new Date(),
        },
      ],
    },
  ],
  air: [
    {
      id: 'air1',
      name: '压缩机组A',
      status: 'normal',
      sensors: [
        {
          id: 's8',
          name: '压力传感器',
          currentValue: 0.8,
          minValue: 0.6,
          maxValue: 1.0,
          unit: 'MPa',
          lastUpdate: new Date(),
        },
        {
          id: 's9',
          name: '温度传感器',
          currentValue: 45,
          minValue: 0,
          maxValue: 60,
          unit: '℃',
          lastUpdate: new Date(),
        },
      ],
    },
  ],
  drainage: [
    {
      id: 'drain1',
      name: '主水泵站',
      status: 'normal',
      sensors: [
        {
          id: 's10',
          name: '水位传感器',
          currentValue: 2.3,
          minValue: 0,
          maxValue: 5,
          unit: 'm',
          lastUpdate: new Date(),
        },
        {
          id: 's11',
          name: '流量传感器',
          currentValue: 120,
          minValue: 0,
          maxValue: 200,
          unit: 'm³/h',
          lastUpdate: new Date(),
        },
      ],
    },
  ],
  transport: [
    {
      id: 'trans1',
      name: '皮带输送机',
      status: 'normal',
      sensors: [
        {
          id: 's12',
          name: '速度传感器',
          currentValue: 1.5,
          minValue: 1,
          maxValue: 2,
          unit: 'm/s',
          lastUpdate: new Date(),
        },
        {
          id: 's13',
          name: '张力传感器',
          currentValue: 450,
          minValue: 400,
          maxValue: 600,
          unit: 'N',
          lastUpdate: new Date(),
        },
      ],
    },
  ],
  safety: [
    {
      id: 'gas1',
      name: '瓦斯监测站',
      status: 'normal',
      sensors: [
        {
          id: 's14',
          name: '瓦斯浓度',
          currentValue: 0.3,
          minValue: 0,
          maxValue: 1,
          unit: '%',
          lastUpdate: new Date(),
        },
        {
          id: 's15',
          name: '一氧化碳',
          currentValue: 12,
          minValue: 0,
          maxValue: 24,
          unit: 'ppm',
          lastUpdate: new Date(),
        },
      ],
    },
  ],
})

// 计算属性
const currentCategory = computed(() => categories.find((c) => c.id === activeCategory.value))
const filteredEquipment = computed(() => equipmentData.value[activeCategory.value] || [])
const equipmentStats = computed(() => {
  const equipment = filteredEquipment.value
  return {
    normal: equipment.filter((e) => e.status === 'normal').length,
    warning: equipment.filter((e) => e.status === 'warning').length,
    error: equipment.filter((e) => e.status === 'error').length,
  }
})

// Canvas引用
const spectrumCanvas = ref<HTMLCanvasElement | null>(null)
const predictionCanvas = ref<HTMLCanvasElement | null>(null)

// 方法
const switchCategory = (categoryId: string) => {
  activeCategory.value = categoryId
  selectedEquipment.value = null
  selectedSensor.value = null
}

const selectEquipment = (equipment: Equipment) => {
  selectedEquipment.value = equipment
  selectedSensor.value = null
  nextTick(() => {
    drawSpectrum()
    drawPrediction()
  })
}

const selectSensor = (sensor: Sensor, equipment: Equipment) => {
  selectedSensor.value = sensor
  selectedEquipment.value = equipment
}

const getStatusIcon = (status: string) => {
  const icons = {
    normal: 'fas fa-check-circle text-success',
    warning: 'fas fa-exclamation-triangle text-warning',
    error: 'fas fa-times-circle text-danger',
  }
  return icons[status as keyof typeof icons] || 'fas fa-question-circle'
}

const getStatusText = (status: string) => {
  const texts = {
    normal: '正常',
    warning: '警告',
    error: '故障',
  }
  return texts[status as keyof typeof texts] || '未知'
}

const getGaugeColor = (sensor: Sensor) => {
  const percentage = (sensor.currentValue / sensor.maxValue) * 100
  if (percentage < 60) return '#52c41a'
  if (percentage < 80) return '#faad14'
  return '#ff4d4f'
}

const getGaugeDashArray = (sensor: Sensor) => {
  const percentage = (sensor.currentValue / sensor.maxValue) * 100
  const circumference = 125.6 // 约等于半圆周长
  return `${(circumference * percentage) / 100} ${circumference}`
}

const getSensorStatus = (sensor: Sensor) => {
  const percentage = (sensor.currentValue / sensor.maxValue) * 100
  if (percentage < 60) return 'normal'
  if (percentage < 80) return 'warning'
  return 'danger'
}

const getSensorStatusText = (sensor: Sensor) => {
  const status = getSensorStatus(sensor)
  const texts = {
    normal: '正常',
    warning: '警告',
    danger: '危险',
  }
  return texts[status]
}

const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString()
}

const toggleSpectrumRecording = () => {
  isRecording.value = !isRecording.value
  if (isRecording.value) {
    startSpectrumAnimation()
  }
}

// 绘制频谱图
const drawSpectrum = () => {
  if (!spectrumCanvas.value) return

  const canvas = spectrumCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight

  // 绘制 Mel 频谱图
  const width = canvas.width
  const height = canvas.height
  const freqBands = 64
  const timeBands = 100

  ctx.clearRect(0, 0, width, height)

  // 生成模拟频谱数据
  for (let t = 0; t < timeBands; t++) {
    for (let f = 0; f < freqBands; f++) {
      const intensity = Math.random() * 255
      const hue = 240 - (intensity / 255) * 240 // 蓝到红
      const color = `hsl(${hue}, 100%, ${50 + intensity / 5}%)`

      ctx.fillStyle = color
      ctx.fillRect(
        (t / timeBands) * width,
        height - ((f + 1) / freqBands) * height,
        width / timeBands,
        height / freqBands,
      )
    }
  }

  // 添加坐标轴标签
  ctx.fillStyle = '#333'
  ctx.font = '12px Arial'
  ctx.fillText('0Hz', 5, height - 5)
  ctx.fillText('8kHz', 5, 15)
  ctx.fillText('时间', width - 30, height - 5)
}

// 绘制预测曲线
const drawPrediction = () => {
  if (!predictionCanvas.value) return

  const canvas = predictionCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight

  const width = canvas.width
  const height = canvas.height
  const padding = 40

  ctx.clearRect(0, 0, width, height)

  // 绘制背景网格
  ctx.strokeStyle = '#e0e0e0'
  ctx.lineWidth = 1
  for (let i = 0; i <= 10; i++) {
    const y = padding + (i / 10) * (height - 2 * padding)
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
  }

  // 生成3天的预测数据
  const dataPoints = 72 // 3天，每小时一个点
  const normalData = []
  const warningData = []
  const dangerData = []

  for (let i = 0; i < dataPoints; i++) {
    const x = padding + (i / (dataPoints - 1)) * (width - 2 * padding)
    normalData.push({ x, y: height - padding - 20 })
    warningData.push({ x, y: height - padding - 40 - Math.random() * 20 })
    dangerData.push({ x, y: height - padding - 80 - Math.random() * 20 })
  }

  // 绘制预测曲线
  const drawCurve = (data: Array<{x: number, y: number}>, color: string) => {
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(data[0].x, data[0].y)
    for (let i = 1; i < data.length; i++) {
      ctx.lineTo(data[i].x, data[i].y)
    }
    ctx.stroke()
  }

  drawCurve(normalData, '#52c41a')
  drawCurve(warningData, '#faad14')
  drawCurve(dangerData, '#ff4d4f')

  // 添加当前时间线
  const currentX = padding + (24 / 72) * (width - 2 * padding) // 当前时间在1/3位置
  ctx.strokeStyle = '#1890ff'
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])
  ctx.beginPath()
  ctx.moveTo(currentX, padding)
  ctx.lineTo(currentX, height - padding)
  ctx.stroke()
  ctx.setLineDash([])

  // 添加标签
  ctx.fillStyle = '#333'
  ctx.font = '12px Arial'
  ctx.fillText('现在', currentX - 15, padding - 10)
  ctx.fillText('+1天', currentX + (width - 2 * padding) / 3 - 15, padding - 10)
  ctx.fillText('+2天', currentX + (2 * (width - 2 * padding)) / 3 - 15, padding - 10)
}

// 频谱动画
let spectrumAnimationId: number | null = null
const startSpectrumAnimation = () => {
  const animate = () => {
    if (isRecording.value) {
      drawSpectrum()
      spectrumAnimationId = requestAnimationFrame(animate)
    }
  }
  animate()
}

// 生命周期
onMounted(() => {
  // 默认选择第一个设备
  if (filteredEquipment.value.length > 0) {
    selectedEquipment.value = filteredEquipment.value[0]
  }

  nextTick(() => {
    drawSpectrum()
    drawPrediction()
  })
})

onUnmounted(() => {
  if (spectrumAnimationId) {
    cancelAnimationFrame(spectrumAnimationId)
  }
})
</script>

<style scoped>
.monitoring-center {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

/* 二级菜单导航 */
.category-nav {
  display: flex;
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  color: #666666;
}

.nav-item:hover {
  color: #1890ff;
  background: #f0f8ff;
}

.nav-item.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
  background: #f0f8ff;
}

.nav-item i {
  font-size: 16px;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow: hidden;
}

/* 设备面板 */
.equipment-panel {
  width: 300px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.panel-header h3 {
  margin: 0 0 12px 0;
  color: #333333;
  font-size: 16px;
}

.status-summary {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.status-item {
  padding: 2px 6px;
  border-radius: 4px;
}

.status-item.normal {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.status-item.warning {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.status-item.error {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

/* 设备树 */
.equipment-tree {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.equipment-item {
  margin-bottom: 8px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.equipment-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.equipment-item.active {
  border-color: #1890ff;
  background: rgba(24, 144, 255, 0.05);
}

.equipment-header {
  display: flex;
  align-items: center;
  padding: 12px;
  gap: 8px;
}

.equipment-name {
  flex: 1;
  font-weight: 500;
  color: #333333;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.normal {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.status-badge.warning {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.status-badge.error {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

/* 传感器列表 */
.sensors-list {
  padding: 0 12px 12px;
  border-top: 1px solid #e8e8e8;
  margin-top: 8px;
  padding-top: 8px;
}

.sensor-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
  gap: 8px;
}

.sensor-item:hover {
  background: #f0f8ff;
}

.sensor-item.active {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.sensor-dot {
  font-size: 6px;
  color: #52c41a;
}

.sensor-value {
  margin-left: auto;
  font-weight: 500;
  color: #1890ff;
}

/* 监控面板 */
.monitoring-panel {
  flex: 1;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.monitoring-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.monitoring-row {
  display: flex;
  gap: 16px;
  min-height: 300px;
}

.monitoring-row > div {
  flex: 1;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
  font-weight: 500;
  color: #333333;
  background: #f0f8ff;
  border-radius: 8px 8px 0 0;
}

.panel-title i {
  color: #1890ff;
}

/* 视频面板 */
.video-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.video-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #000;
  border-radius: 6px;
  color: #fff;
  position: relative;
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

.video-controls {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  justify-content: center;
}

.control-btn {
  padding: 8px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.control-btn:hover {
  background: #40a9ff;
}

/* 仪表盘面板 */
.dashboard-panel {
  min-width: 400px;
}

.gauges-container {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.gauge-item {
  text-align: center;
}

.gauge-chart {
  width: 120px;
  height: 80px;
  margin: 0 auto 8px;
}

.gauge-svg {
  width: 100%;
  height: 100%;
}

.gauge-value {
  font-size: 14px;
  font-weight: bold;
  fill: #333333;
}

.gauge-unit {
  font-size: 10px;
  fill: #666666;
}

.gauge-info {
  font-size: 12px;
}

.gauge-name {
  font-weight: 500;
  color: #333333;
  margin-bottom: 4px;
}

.gauge-range {
  color: #666666;
}

/* 频谱面板 */
.spectrum-container {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.spectrum-canvas {
  flex: 1;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: #000;
}

.spectrum-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.frequency-info {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #666666;
}

/* 预测面板 */
.prediction-container {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.prediction-canvas {
  flex: 1;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: #ffffff;
}

.prediction-legend {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666666;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.normal {
  background: #52c41a;
}

.legend-color.warning {
  background: #faad14;
}

.legend-color.danger {
  background: #ff4d4f;
}

/* 数据表格面板 */
.data-table-panel {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.data-table {
  padding: 16px;
  overflow-x: auto;
}

.data-table table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e8e8e8;
}

.data-table th {
  background: #f0f8ff;
  font-weight: 500;
  color: #333333;
}

.data-table td {
  color: #666666;
}

.data-table td.value {
  font-weight: 500;
  color: #1890ff;
}

.status-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.status-tag.normal {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.status-tag.warning {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.status-tag.danger {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999999;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #666666;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* 状态颜色 */
.text-success {
  color: #52c41a !important;
}

.text-warning {
  color: #faad14 !important;
}

.text-danger {
  color: #ff4d4f !important;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }

  .equipment-panel {
    width: 100%;
    max-height: 300px;
  }

  .monitoring-row {
    flex-direction: column;
    min-height: auto;
  }

  .gauges-container {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}

@media (max-width: 768px) {
  .category-nav {
    overflow-x: auto;
    padding: 0 10px;
  }

  .nav-item {
    padding: 12px 16px;
    white-space: nowrap;
  }

  .main-content {
    padding: 8px;
  }

  .prediction-legend {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
}
</style>
