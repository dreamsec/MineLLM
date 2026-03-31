<template>
  <div class="fault-diagnosis-container">
    <div class="page-header">
      <div class="title-group">
        <div class="title-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#36F0FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div>
          <h2>故障诊断 <span class="title-dot">·</span> 历史趋势</h2>
          <p>按设备变量检索历史数据，生成趋势曲线</p>
        </div>
      </div>
      <div class="device-strip">
        <div v-for="item in deviceOverview" :key="item.label" class="device-chip">
          <span class="chip-dot"></span>
          <span class="chip-label">{{ item.label }}</span>
          <span class="chip-value">{{ item.value }}</span>
        </div>
      </div>
    </div>

    <el-card class="filter-card">
      <div class="filter-card-header">
        <span class="filter-card-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 4h18M7 12h10M11 20h2" stroke="#36F0FF" stroke-width="2" stroke-linecap="round"/></svg>
          查询条件
        </span>
        <div class="selection-pills">
          <span class="summary-pill active">{{ selectedMachineTypeLabel }}</span>
          <span class="pill-sep">›</span>
          <span class="summary-pill active">{{ selectedMachineIdLabel }}</span>
          <span class="pill-sep">›</span>
          <span class="summary-pill active">{{ selectedParameterLabel }}</span>
        </div>
      </div>
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="机器类型">
          <el-select class="filter-select" v-model="filterForm.machineType" placeholder="请选择机器类型" @change="handleMachineTypeChange">
            <el-option label="提升机" value="hoist" />
            <el-option label="压风机" value="compressor" />
            <el-option label="通风机" value="ventilator" />
            <el-option label="排水泵" value="pump" />
            <el-option label="运输机" value="conveyor" />
          </el-select>
        </el-form-item>
        <el-form-item label="机器编号">
          <el-select class="filter-select" v-model="filterForm.machineId" placeholder="请选择机器编号" @change="handleMachineIdChange">
            <el-option v-for="item in machineIdOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="展示参数">
          <el-select class="filter-select" v-model="filterForm.parameter" placeholder="请选择展示参数" @change="handleParameterChange">
            <el-option v-for="item in parameterOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            class="filter-date"
            v-model="filterForm.timeRange"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            range-separator="至"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="query-btn" @click="fetchData">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="margin-right:6px"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            查询
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="chart-card" v-loading="loading">
      <div class="chart-card-header">
        <div class="chart-card-title">
          <span class="chart-title-bar"></span>
          趋势图表
        </div>
        <div class="chart-card-badges">
          <span class="chart-badge">{{ selectedMachineIdLabel }}</span>
          <span class="chart-badge highlight">{{ selectedParameterLabel }}</span>
        </div>
      </div>
      <div ref="chartRef" class="chart-container"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { getEquipmentHistoryVariableApi } from '@/api/device'

defineOptions({
  name: 'FaultDiagnosis'
})

// 表单数据
const filterForm = reactive({
  machineType: '',
  machineId: '',
  parameter: '',
  timeRange: [] as string[]
})

// 选项数据
const machineIdOptions = ref<{ label: string, value: string }[]>([])
const parameterOptions = ref<{ label: string, value: string }[]>([])

// 图表相关
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null
const loading = ref(false)

const deviceOverview = [
  { label: '提升机', value: 'TS001' },
  { label: '压风机', value: 'YF001 - YF007' },
  { label: '排水泵', value: 'PS001 - PS003' },
  { label: '通风机', value: 'TF001, TF002' },
  { label: '运输机', value: 'YS001' }
]

const parameterDict: Record<string, { label: string, value: string }[]> = {
  hoist: [
    { value: 'actual_speed', label: '实际速度' },
    { value: 'speed_setpoint', label: '速度给定' },
    { value: 'guide_wheel_speed', label: '导向轮速度' },
    { value: 'speed_diff', label: '速度差' },
    { value: 'travel_diff', label: '行程差' },
    { value: 'main_skip_depth', label: '主箕斗深度' },
    { value: 'vice_skip_depth', label: '副箕斗深度' },
    { value: 'load_weight', label: '载重' },
    { value: 'motor_current', label: '电机电流' },
    { value: 'excitation_current', label: '励磁电流' },
    { value: 'brake_oil_pressure', label: '闸控油压' },
    { value: 'brake_oil_temp', label: '闸控油温' },
    { value: 'wellhead_temp', label: '井口温度' },
    { value: 'motor_temp_max', label: '电机最高温度' },
    { value: 'sheave_temp_max', label: '天轮最高温度' },
    { value: 'main_shaft_temp_max', label: '主轴最高温度' },
    { value: 'plc_speed_1', label: 'PLC速度1' },
    { value: 'plc_speed_2', label: 'PLC速度2' },
    { value: 'handle_set_speed_check', label: '手柄给定判速' },
    { value: 'speed_status_1', label: '速度状态1' },
    { value: 'speed_status_2', label: '速度状态2' },
    { value: 'speed_status_3', label: '速度状态3' },
    { value: 'speed_status_4', label: '速度状态4' },
    { value: 'deceleration', label: '减速' },
    { value: 'main_skip_overwind', label: '主箕斗过卷' },
    { value: 'main_skip_stop_point', label: '主箕斗停点' },
    { value: 'main_skip_deceleration_point', label: '主箕斗减速点' },
    { value: 'main_skip_monitor_2m', label: '主箕斗2M监视点' },
    { value: 'main_skip_calibration_point', label: '主箕斗校正点' },
    { value: 'vice_skip_overwind', label: '副箕斗过卷' },
    { value: 'vice_skip_stop_point', label: '副箕斗停点' },
    { value: 'vice_skip_deceleration_point', label: '副箕斗减速点' },
    { value: 'vice_skip_monitor_2m', label: '副箕斗2M监视点' },
    { value: 'vice_skip_calibration_point', label: '副箕斗校正点' },
    { value: 'auto_run', label: '全自动运行' },
    { value: 'semi_auto_run', label: '半自动运行' },
    { value: 'manual_run', label: '手动运行' },
    { value: 'simple_run', label: '简易运行' },
    { value: 'repair_mode', label: '检修' },
    { value: 'lift_person', label: '提人' },
    { value: 'lift_material', label: '提物' },
    { value: 'heavy_load_down', label: '重载下放' },
    { value: 'handle_zero_position', label: '手柄零位' },
    { value: 'inverter_enable', label: '变频允许' },
    { value: 'inverter_running', label: '变频运行' },
    { value: 'main_fan_run', label: '主风机运行' },
    { value: 'external_water_cooling_run', label: '外水冷运行' },
    { value: 'main_transformer_merge', label: '主变合' },
    { value: 'excitation_merge', label: '励磁变合' },
    { value: 'emergency_stop', label: '紧急停车' },
    { value: 'fault_stop', label: '事故停车' },
    { value: 'fault_alarm', label: '事故报警' },
    { value: 'primary_hoist_fault', label: '一次提升故障' },
    { value: 'start_condition_insufficient', label: '开车条件不足' },
    { value: 'signal_0', label: '信号0' },
    { value: 'signal_2', label: '信号2' },
    { value: 'signal_3', label: '信号3' },
    { value: 'signal_4', label: '信号4' },
    { value: 'signal_5', label: '信号5' },
    ...Array.from({length: 12}, (_, i) => ({ value: `motor_temp_${i+1}`, label: `电机温度${i+1}` })),
    ...Array.from({length: 8}, (_, i) => ({ value: `sheave_temp_${i+1}`, label: `天轮温度${i+1}` })),
    ...Array.from({length: 4}, (_, i) => ({ value: `main_shaft_temp_${i+1}`, label: `主轴温度${i+1}` }))
  ],
  compressor: [
    { value: 'unit_exhaust_temp', label: '机组排气温度' },
    { value: 'host_exhaust_temp', label: '主机排气温度' },
    { value: 'air_tank_temp', label: '风包温度' },
    { value: 'coolant_temp', label: '冷却剂温度' },
    { value: 'running_temp', label: '运行温度' },
    { value: 'exhaust_pressure', label: '排气压力' },
    { value: 'separation_pressure', label: '分离压力' },
    { value: 'separation_diff_pressure', label: '分离压差' },
    { value: 'intake_vacuum', label: '进气真空' },
    { value: 'voltage', label: '电压' },
    { value: 'current', label: '电流' },
    { value: 'host_vibration', label: '主机振动' },
    { value: 'motor_vibration', label: '电机振动' },
    { value: 'current_run_time', label: '当次运行时间' },
    { value: 'host_run_time', label: '主机运行时间' },
    { value: 'host_load_time', label: '主机加载时间' },
    { value: 'standby_status', label: '待机状态' },
    { value: 'running_feedback', label: '运行反馈' },
    { value: 'fault_exist', label: '故障存在' },
    { value: 'comm_status', label: '通信状态' },
    { value: 'auto_manual_mode', label: '手自动模式' },
    { value: 'remote_mode', label: '远控模式' },
    { value: 'local_mode', label: '就地模式' },
    { value: 'load_unload_mode', label: '加卸载模式' },
    { value: 'auto_toggle_status', label: '自动投退状态' },
    { value: 'start_btn', label: '启动按钮' },
    { value: 'stop_btn', label: '停止按钮' },
    { value: 'load_btn', label: '加载按钮' },
    { value: 'unload_btn', label: '卸载按钮' },
    { value: 'auto_btn', label: '自动按钮' },
    { value: 'manual_btn', label: '手动按钮' },
    { value: 'auto_toggle_btn', label: '自动投退按钮' },
    { value: 'drain_valve_open', label: '排污阀开状态' },
    { value: 'drain_valve_close', label: '排污阀关状态' },
    { value: 'drain_valve_manual_open_btn', label: '排污阀手动开按钮' },
    { value: 'drain_valve_manual_close_btn', label: '排污阀手动关按钮' },
    { value: 'drain_valve_manual_stop_btn', label: '排污阀手动停按钮' },
    { value: 'drain_valve_mode_btn_status', label: '排污阀手自动按钮状态' },
    { value: 'drain_valve_interval_setting', label: '排污阀时间间隔设定' },
    { value: 'drain_valve_duration_setting', label: '排污阀时长设定' },
    { value: 'air_tank_temp_alarm_setting', label: '风包温度报警值设定' },
    { value: 'air_tank_temp_trip_setting', label: '风包温度跳闸值设定' },
    { value: 'air_tank_temp_protect_active', label: '风包温度保护投退状态' },
    { value: 'air_tank_temp_protect_btn', label: '风包温度保护投退按钮' },
    { value: 'host_temp_alarm_setting', label: '主机温度报警值设定' },
    { value: 'host_temp_trip_setting', label: '主机温度跳闸值设定' },
    { value: 'host_temp_protect_active', label: '主机温度保护投退状态' },
    { value: 'host_temp_protect_btn', label: '主机温度保护投退按钮' },
    { value: 'exhaust_temp_alarm_setting', label: '排气温度报警值设定' },
    { value: 'exhaust_temp_trip_setting', label: '排气温度跳闸值设定' },
    { value: 'exhaust_temp_protect_active', label: '排气温度保护投退状态' },
    { value: 'exhaust_temp_protect_btn', label: '排气温度保护投退按钮' },
    { value: 'vibration_alarm_setting', label: '振动报警值设定' },
    { value: 'vibration_trip_setting', label: '振动跳闸值设定' },
    { value: 'vibration_protect_active', label: '振动保护投退状态' },
    { value: 'vibration_protect_btn', label: '振动保护投退按钮' }
  ],
  ventilator: [
    { value: 'air_speed', label: '风速' },
    { value: 'air_volume', label: '风量' },
    { value: 'total_pressure', label: '全压' },
    { value: 'neg_pressure', label: '负压' },
    { value: 'inverter_freq', label: '变频频率' },
    { value: 'inverter_current', label: '变频电流' },
    { value: 'motor1_voltage', label: '1#电机电压' },
    { value: 'motor1_current', label: '1#电机电流' },
    { value: 'motor1_active_power', label: '1#电机有功' },
    { value: 'motor1_vert_vibration', label: '1#电机垂直振动' },
    { value: 'motor1_horiz_vibration', label: '1#电机水平振动' },
    { value: 'motor1_north_axis_temp', label: '1#电机北轴温度' },
    { value: 'motor2_voltage', label: '2#电机电压' },
    { value: 'motor2_current', label: '2#电机电流' },
    { value: 'motor2_active_power', label: '2#电机有功' },
    { value: 'motor2_vert_vibration', label: '2#电机垂直振动' },
    { value: 'motor2_horiz_vibration', label: '2#电机水平振动' },
    { value: 'motor2_north_axis_temp', label: '2#电机北轴温度' },
    { value: 'run_feedback', label: '运行反馈' },
    { value: 'inverter_run_feedback', label: '变频运行' },
    { value: 'auto_mode', label: '自动' },
    { value: 'manual_mode', label: '手动' },
    { value: 'standby_mode', label: '待机' },
    { value: 'exhaust_wind_mode', label: '抽风' },
    { value: 'general_alarm', label: '报警' },
    { value: 'main_motor_alarm', label: '主电机报警' },
    { value: 'lube_general_alarm', label: '润滑站报警' },
    { value: 'stator_temp_alarm', label: '定子温度报警' },
    { value: 'bearing_temp_alarm', label: '主轴承温度报警' },
    { value: 'bearing_vibration_alarm', label: '主轴承振动报警' }
  ],
  pump: [
    { value: 'current', label: '电流' },
    { value: 'pos_pressure', label: '正压' },
    { value: 'neg_pressure', label: '负压' },
    { value: 'total_run_time', label: '累计运行' },
    { value: 'motor_temp_u', label: '电机U温' },
    { value: 'motor_temp_v', label: '电机V温' },
    { value: 'motor_temp_w', label: '电机W温' },
    { value: 'motor_front_axis_temp', label: '电机前轴温' },
    { value: 'motor_rear_axis_temp', label: '电机后轴温' },
    { value: 'pump_front_axis_temp', label: '水泵前轴温' },
    { value: 'pump_rear_axis_temp', label: '水泵后轴温' },
    { value: 'run_status', label: '运行状态' },
    { value: 'run_feedback', label: '运行反馈' },
    { value: 'standby_status', label: '备用' },
    { value: 'maintenance_status', label: '检修' },
    { value: 'forbid_start', label: '禁起' },
    { value: 'total_fault', label: '总故障' }
  ],
  conveyor: [
    { value: 'belt_speed', label: '皮带速度' },
    { value: 'belt_tension', label: '皮带张力' },
    { value: 'feeder_coal_level', label: '给煤机煤位' },
    { value: 'motor_current_1', label: '1#电机电流' },
    { value: 'motor_temp_1', label: '1#电机温度' },
    { value: 'motor_current_2', label: '2#电机电流' },
    { value: 'motor_temp_2', label: '2#电机温度' },
    { value: 'motor_current_3', label: '3#电机电流' },
    { value: 'motor_temp_3', label: '3#电机温度' },
    { value: 'drum_temp', label: '滚筒温度' }
  ]
}

const mockDataDict: Record<string, { ids: string[], params: { label: string, value: string }[] }> = {
  hoist: {
    ids: ['TS001'],
    params: parameterDict.hoist
  },
  compressor: {
    ids: ['YF001', 'YF002', 'YF003', 'YF004', 'YF005', 'YF006', 'YF007'],
    params: parameterDict.compressor
  },
  ventilator: {
    ids: ['TF001', 'TF002'],
    params: parameterDict.ventilator
  },
  pump: {
    ids: ['PS001', 'PS002', 'PS003'],
    params: parameterDict.pump
  },
  conveyor: {
    ids: ['YS001'],
    params: parameterDict.conveyor
  }
}

const machineTypeLabelMap: Record<string, string> = {
  hoist: '提升机',
  compressor: '压风机',
  ventilator: '通风机',
  pump: '排水泵',
  conveyor: '运输机'
}

const selectedMachineTypeLabel = computed(() => machineTypeLabelMap[filterForm.machineType] || '未选择')
const selectedMachineIdLabel = computed(() => filterForm.machineId || '未选择')
const selectedParameterLabel = computed(() => {
  const option = parameterOptions.value.find(item => item.value === filterForm.parameter)
  return option?.label || '未选择'
})

// 处理机器类型改变
const handleMachineTypeChange = (val: string) => {
  filterForm.machineId = ''
  filterForm.parameter = ''
  if (val && mockDataDict[val]) {
    machineIdOptions.value = mockDataDict[val].ids.map(id => ({ label: id, value: id }))
    parameterOptions.value = mockDataDict[val].params
  } else {
    machineIdOptions.value = []
    parameterOptions.value = []
  }
}

// 处理机器编号改变
const handleMachineIdChange = () => {
  // 可以在这里自动触发查询
}

// 处理参数改变
const handleParameterChange = () => {
  // 可以在这里自动触发查询
}

// 初始化图表
const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    window.addEventListener('resize', handleResize)
  }
}

// 处理窗口大小改变
const handleResize = () => {
  chartInstance?.resize()
}

const normalizeValue = (value: number | string | boolean) => {
  if (typeof value === 'boolean') return value ? 1 : 0
  if (typeof value === 'number') return value
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

// 获取并更新图表数据
const fetchData = async () => {
  if (!filterForm.machineType || !filterForm.machineId || !filterForm.parameter) {
    ElMessage.warning('请选择完整的查询条件')
    return
  }
  if (!filterForm.timeRange || filterForm.timeRange.length !== 2) {
    ElMessage.warning('请选择时间范围')
    return
  }

  if (!chartInstance) return
  const [start_time, end_time] = filterForm.timeRange
  const paramLabel = parameterOptions.value.find(p => p.value === filterForm.parameter)?.label || '数据'

  try {
    loading.value = true
    const response = await getEquipmentHistoryVariableApi({
      equipment_code: filterForm.machineId,
      query_variable: filterForm.parameter,
      start_time,
      end_time
    })
    const history = response?.data?.history ?? []
    const times = history.map(item => item.collected_at)
    const data = history.map(item => normalizeValue(item.value))

    const option = {
      title: {
        text: `${filterForm.machineId} - ${paramLabel} 历史趋势`,
        left: 'center',
        textStyle: {
          color: '#E6F7FF',
          fontFamily: 'Orbitron, Rajdhani, sans-serif',
          fontWeight: 600
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}<br/>{a}: {c}'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: times,
        axisLabel: {
          color: '#9CCBFF',
          rotate: 30
        },
        axisLine: {
          lineStyle: { color: 'rgba(120,180,255,0.5)' }
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        name: paramLabel,
        scale: true,
        nameTextStyle: { color: '#9CCBFF' },
        axisLabel: { color: '#9CCBFF' },
        splitLine: {
          lineStyle: { color: 'rgba(120,180,255,0.15)' }
        }
      },
      series: [
        {
          name: paramLabel,
          type: 'line',
          smooth: true,
          data: data,
          itemStyle: {
            color: '#36F0FF'
          },
          lineStyle: {
            width: 2
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(54,240,255,0.45)' },
              { offset: 1, color: 'rgba(54,240,255,0.05)' }
            ])
          }
        }
      ]
    }

    chartInstance.setOption(option)
  } catch {
    ElMessage.error('获取历史数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initChart()
  // 默认选中第一个
  filterForm.machineType = 'hoist'
  handleMachineTypeChange('hoist')
  filterForm.machineId = 'TS001'
  filterForm.parameter = 'motor_current'
  const now = new Date()
  const endTime = now
  const startTime = new Date(now.getTime() - 60 * 60 * 1000)
  const pad = (val: number) => String(val).padStart(2, '0')
  const formatDateTime = (date: Date) => (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
  filterForm.timeRange = [formatDateTime(startTime), formatDateTime(endTime)]
  // 延迟加载数据，确保图表已初始化
  setTimeout(() => {
    fetchData()
  }, 100)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<style scoped lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Rajdhani:wght@400;600&display=swap");

.fault-diagnosis-container {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  box-sizing: border-box;
  font-family: 'Rajdhani', sans-serif;
  color: #E6F7FF;
  background: radial-gradient(1200px 500px at 10% -10%, rgba(54, 240, 255, 0.22), transparent 60%),
    radial-gradient(900px 600px at 90% 10%, rgba(93, 120, 255, 0.22), transparent 65%),
    linear-gradient(135deg, #050b16 0%, #0b1b2b 60%, #0e1020 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(95, 200, 255, 0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(95, 200, 255, 0.06) 1px, transparent 1px);
    background-size: 40px 40px;
    opacity: 0.5;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    width: 600px;
    height: 600px;
    right: -220px;
    bottom: -280px;
    background: radial-gradient(circle, rgba(54, 240, 255, 0.28), transparent 60%);
    filter: blur(12px);
    pointer-events: none;
  }

  // ── 页头 ──────────────────────────────────────────
  .page-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 24px;
    border: 1px solid rgba(85, 160, 255, 0.2);
    border-top: 2px solid rgba(54, 240, 255, 0.5);
    border-radius: 14px;
    background: linear-gradient(120deg, rgba(12, 26, 44, 0.9), rgba(8, 20, 35, 0.75));
    box-shadow: inset 0 0 40px rgba(16, 32, 55, 0.5), 0 8px 28px rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(54, 240, 255, 0.6), transparent);
    }
  }

  .title-group {
    display: flex;
    align-items: center;
    gap: 14px;

    .title-icon {
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background: rgba(54, 240, 255, 0.1);
      border: 1px solid rgba(54, 240, 255, 0.3);
      box-shadow: 0 0 16px rgba(54, 240, 255, 0.15);
      flex-shrink: 0;
    }

    h2 {
      margin: 0 0 4px;
      font-size: 20px;
      letter-spacing: 2px;
      font-family: 'Orbitron', sans-serif;
      background: linear-gradient(90deg, #E6F7FF, #36F0FF);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;

      .title-dot {
        color: rgba(54, 240, 255, 0.6);
        -webkit-text-fill-color: rgba(54, 240, 255, 0.6);
        margin: 0 4px;
      }
    }

    p {
      margin: 0;
      font-size: 13px;
      color: rgba(156, 203, 255, 0.7);
      letter-spacing: 0.5px;
    }
  }

  .device-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
  }

  .device-chip {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 5px 12px 5px 8px;
    border-radius: 999px;
    border: 1px solid rgba(54, 240, 255, 0.25);
    background: rgba(10, 24, 42, 0.85);
    font-size: 12.5px;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:hover {
      border-color: rgba(54, 240, 255, 0.5);
      box-shadow: 0 0 10px rgba(54, 240, 255, 0.12);
    }

    .chip-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #36F0FF;
      box-shadow: 0 0 6px #36F0FF;
      animation: blink 2.5s ease-in-out infinite;
    }
  }

  .chip-label {
    color: rgba(156, 203, 255, 0.75);
  }

  .chip-value {
    color: #36F0FF;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  // ── 筛选卡片 ──────────────────────────────────────
  .filter-card {
    backdrop-filter: blur(14px);
    background: rgba(8, 20, 35, 0.72);
    border: 1px solid rgba(85, 160, 255, 0.2);
    border-radius: 14px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);

    :deep(.el-card__body) {
      padding: 16px 20px;
    }

    .filter-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 14px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(84, 160, 255, 0.15);
    }

    .filter-card-title {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 13px;
      font-weight: 600;
      color: #9CCBFF;
      letter-spacing: 1px;
    }

    .selection-pills {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .pill-sep {
      color: rgba(156, 203, 255, 0.35);
      font-size: 14px;
    }

    .summary-pill {
      padding: 3px 10px;
      border: 1px solid rgba(54, 240, 255, 0.25);
      border-radius: 999px;
      background: rgba(8, 30, 52, 0.8);
      color: rgba(230, 247, 255, 0.7);
      font-size: 12px;

      &.active {
        border-color: rgba(54, 240, 255, 0.45);
        color: #36F0FF;
        background: rgba(54, 240, 255, 0.08);
      }
    }

    .filter-form {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: 0;

      .el-form-item {
        margin-bottom: 0;
        margin-right: 16px;
      }

      :deep(.filter-select) {
        width: 175px;
      }

      :deep(.filter-date) {
        width: 400px;
      }
    }

    .query-btn {
      display: flex;
      align-items: center;
      padding: 8px 20px;
      height: 36px;
    }
  }

  // ── 图表卡片 ──────────────────────────────────────
  .chart-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(16px);
    background: rgba(6, 16, 30, 0.85);
    border: 1px solid rgba(74, 190, 255, 0.2);
    border-radius: 14px;
    box-shadow: inset 0 0 50px rgba(19, 43, 70, 0.6), 0 16px 40px rgba(0, 0, 0, 0.4);
    overflow: hidden;

    :deep(.el-card__body) {
      flex: 1;
      padding: 0;
      display: flex;
      flex-direction: column;
    }

    .chart-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      border-bottom: 1px solid rgba(74, 190, 255, 0.12);
      background: rgba(10, 24, 42, 0.5);
    }

    .chart-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      font-weight: 600;
      color: #9CCBFF;
      letter-spacing: 1px;

      .chart-title-bar {
        width: 3px;
        height: 16px;
        border-radius: 2px;
        background: linear-gradient(180deg, #36F0FF, #4A5CFF);
        box-shadow: 0 0 8px rgba(54, 240, 255, 0.6);
      }
    }

    .chart-card-badges {
      display: flex;
      gap: 8px;
    }

    .chart-badge {
      padding: 3px 10px;
      border-radius: 6px;
      border: 1px solid rgba(84, 160, 255, 0.25);
      background: rgba(12, 26, 44, 0.8);
      font-size: 12px;
      color: rgba(156, 203, 255, 0.8);

      &.highlight {
        border-color: rgba(54, 240, 255, 0.4);
        color: #36F0FF;
        background: rgba(54, 240, 255, 0.08);
      }
    }

    .chart-container {
      flex: 1;
      width: 100%;
      min-height: 380px;
      position: relative;
      animation: pulseGlow 6s ease-in-out infinite;
    }
  }

  // ── Element Plus 覆盖 ─────────────────────────────
  :deep(.el-form-item__label) {
    color: #9CCBFF;
    font-weight: 600;
  }

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper),
  :deep(.el-date-editor.el-input__wrapper) {
    background-color: rgba(12, 26, 44, 0.9) !important;
    box-shadow: 0 0 0 1px rgba(84, 160, 255, 0.3) inset, inset 0 0 12px rgba(54, 240, 255, 0.06) !important;
    transition: box-shadow 0.2s;

    &:hover {
      box-shadow: 0 0 0 1px rgba(54, 240, 255, 0.5) inset, inset 0 0 12px rgba(54, 240, 255, 0.1) !important;
    }
  }

  :deep(.el-input__inner),
  :deep(.el-select__placeholder),
  :deep(.el-select__selected-item),
  :deep(.el-range-input) {
    color: #E6F7FF !important;
    font-family: 'Rajdhani', sans-serif;
    background: transparent !important;
    -webkit-text-fill-color: #E6F7FF !important;
  }

  :deep(.el-select__selected-item span) {
    color: #E6F7FF !important;
    -webkit-text-fill-color: #E6F7FF !important;
  }

  :deep(.el-button--primary) {
    background: linear-gradient(120deg, #36F0FF, #4A5CFF);
    border: none;
    color: #050b16;
    font-weight: 700;
    letter-spacing: 1px;
    box-shadow: 0 6px 18px rgba(54, 240, 255, 0.3);
    transition: box-shadow 0.2s, filter 0.2s;

    &:hover {
      filter: brightness(1.1);
      box-shadow: 0 8px 24px rgba(54, 240, 255, 0.45);
    }
  }
}

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 rgba(54, 240, 255, 0); }
  50%       { box-shadow: 0 0 30px rgba(54, 240, 255, 0.15); }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}
</style>
