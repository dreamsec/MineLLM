<template>
  <div class="fault-diagnosis-container">
    <div class="page-header">
      <div class="title-group">
        <h2>故障诊断 · 历史趋势</h2>
        <p>按设备变量检索历史数据，生成趋势曲线</p>
      </div>
      <div class="device-strip">
        <div v-for="item in deviceOverview" :key="item.label" class="device-chip">
          <span class="chip-label">{{ item.label }}</span>
          <span class="chip-value">{{ item.value }}</span>
        </div>
      </div>
    </div>
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="机器类型">
          <el-select v-model="filterForm.machineType" placeholder="请选择机器类型" @change="handleMachineTypeChange">
            <el-option label="提升机" value="hoist" />
            <el-option label="压风机" value="compressor" />
            <el-option label="通风机" value="ventilator" />
            <el-option label="排水泵" value="pump" />
            <el-option label="运输机" value="conveyor" />
          </el-select>
        </el-form-item>
        <el-form-item label="机器编号">
          <el-select v-model="filterForm.machineId" placeholder="请选择机器编号" @change="handleMachineIdChange">
            <el-option v-for="item in machineIdOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="展示参数">
          <el-select v-model="filterForm.parameter" placeholder="请选择展示参数" @change="handleParameterChange">
            <el-option v-for="item in parameterOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.timeRange"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            range-separator="至"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="chart-card" v-loading="loading">
      <div ref="chartRef" class="chart-container"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
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

const buildOptions = (keys: string[]) => keys.map(key => ({ label: key, value: key }))

const parameterKeyDict: Record<string, string[]> = {
  hoist: [
    'motor_temp_1', 'motor_temp_2', 'motor_temp_3', 'motor_temp_4', 'motor_temp_5', 'motor_temp_6',
    'motor_temp_7', 'motor_temp_8', 'motor_temp_9', 'motor_temp_10', 'motor_temp_11', 'motor_temp_12',
    'motor_temp_max',
    'sheave_temp_1', 'sheave_temp_2', 'sheave_temp_3', 'sheave_temp_4', 'sheave_temp_5', 'sheave_temp_6',
    'sheave_temp_7', 'sheave_temp_8', 'sheave_temp_max',
    'main_shaft_temp_1', 'main_shaft_temp_2', 'main_shaft_temp_3', 'main_shaft_temp_4', 'main_shaft_temp_max',
    'plc_speed_1', 'plc_speed_2', 'actual_speed', 'guide_wheel_speed', 'speed_setpoint',
    'handle_set_speed_check', 'speed_diff',
    'speed_status_1', 'speed_status_2', 'speed_status_3', 'speed_status_4', 'deceleration',
    'main_skip_depth', 'vice_skip_depth', 'travel_diff',
    'main_skip_overwind', 'main_skip_stop_point', 'main_skip_deceleration_point', 'main_skip_monitor_2m',
    'main_skip_calibration_point',
    'vice_skip_overwind', 'vice_skip_stop_point', 'vice_skip_deceleration_point', 'vice_skip_monitor_2m',
    'vice_skip_calibration_point',
    'auto_run', 'semi_auto_run', 'manual_run', 'simple_run', 'repair_mode',
    'lift_person', 'lift_material', 'heavy_load_down', 'handle_zero_position',
    'inverter_enable', 'inverter_running', 'main_fan_run', 'external_water_cooling_run',
    'main_transformer_merge', 'excitation_merge',
    'emergency_stop', 'fault_stop', 'fault_alarm', 'primary_hoist_fault', 'start_condition_insufficient',
    'motor_current', 'excitation_current', 'brake_oil_pressure', 'brake_oil_temp', 'load_weight',
    'wellhead_temp', 'signal_0', 'signal_2', 'signal_3', 'signal_4', 'signal_5'
  ],
  compressor: [
    'unit_exhaust_temp', 'host_exhaust_temp', 'air_tank_temp', 'coolant_temp', 'running_temp',
    'exhaust_pressure', 'separation_pressure', 'separation_diff_pressure', 'intake_vacuum',
    'current', 'voltage', 'host_vibration', 'motor_vibration',
    'current_run_time', 'host_run_time', 'host_load_time',
    'standby_status', 'running_feedback', 'fault_exist', 'comm_status',
    'auto_manual_mode', 'remote_mode', 'local_mode', 'load_unload_mode', 'auto_toggle_status',
    'start_btn', 'stop_btn', 'load_btn', 'unload_btn', 'auto_btn', 'manual_btn', 'auto_toggle_btn',
    'drain_valve_open', 'drain_valve_close', 'drain_valve_manual_open_btn', 'drain_valve_manual_close_btn',
    'drain_valve_manual_stop_btn', 'drain_valve_mode_btn_status', 'drain_valve_interval_setting',
    'drain_valve_duration_setting',
    'air_tank_temp_alarm_setting', 'air_tank_temp_trip_setting', 'air_tank_temp_protect_active',
    'air_tank_temp_protect_btn',
    'host_temp_alarm_setting', 'host_temp_trip_setting', 'host_temp_protect_active', 'host_temp_protect_btn',
    'exhaust_temp_alarm_setting', 'exhaust_temp_trip_setting', 'exhaust_temp_protect_active',
    'exhaust_temp_protect_btn',
    'vibration_alarm_setting', 'vibration_trip_setting', 'vibration_protect_active', 'vibration_protect_btn'
  ],
  ventilator: [
    'motor1_phase_a_temp', 'motor1_phase_b_temp', 'motor1_phase_c_temp', 'motor1_north_axis_temp',
    'motor1_south_axis_temp', 'motor1_vert_vibration', 'motor1_horiz_vibration', 'motor1_current',
    'motor1_voltage', 'motor1_active_power',
    'motor2_phase_a_temp', 'motor2_phase_b_temp', 'motor2_phase_c_temp', 'motor2_north_axis_temp',
    'motor2_south_axis_temp', 'motor2_vert_vibration', 'motor2_horiz_vibration', 'motor2_current',
    'motor2_voltage', 'motor2_active_power',
    'inverter_current', 'inverter_freq',
    'air_volume', 'air_speed', 'neg_pressure', 'total_pressure',
    'side_door_opening', 'side_door_open_limit', 'side_door_close_limit', 'side_door_opening_process',
    'side_door_closing_process',
    'air_door_opening', 'air_door_open_limit', 'air_door_close_limit', 'air_door_open_fault',
    'air_door_close_fault',
    'horiz_door_opening_process', 'horiz_door_closing_process',
    'fan_damper_open_fault', 'fan_damper_close_fault', 'fan_damper_alarm',
    'run_feedback', 'inverter_run_feedback', 'motor1_run_feedback', 'motor2_run_feedback',
    'auto_mode', 'manual_mode', 'standby_mode', 'exhaust_wind_mode', 'reverse_wind_mode',
    'cmd_start', 'cmd_stop', 'cmd_switch', 'cmd_reset', 'cmd_mute', 'system_estop',
    'general_alarm', 'main_motor_alarm', 'other_plc_fault', 'oil_pump1_fault', 'oil_pump2_fault',
    'lube_pressure_low', 'lube_general_alarm',
    'stator_temp_alarm', 'bearing_temp_alarm', 'main_motor_bearing_alarm', 'main_motor_bearing_warning',
    'motor_u1_rise_warn', 'motor_v1_rise_warn', 'motor_w1_rise_warn', 'motor_front_axis_rise_warn',
    'motor_rear_axis_rise_warn', 'front_axis_rise_warn_1', 'front_axis_rise_warn_2',
    'bearing_rise_warn_1', 'bearing_rise_warn_2',
    'bearing_vibration_alarm', 'bearing_vibration_warning', 'front_axis_vert_vib_rise_warn',
    'front_axis_horiz_vib_rise_warn', 'rear_axis_vert_vib_rise_warn', 'rear_axis_horiz_vib_rise_warn',
    'front_motor_remote_alarm', 'rear_motor_remote_alarm',
    'total_run_hours', 'run_time_days', 'run_time_hours', 'run_time_minutes', 'run_time_seconds',
    'stall_time_minutes', 'stall_time_seconds',
    'vfd_run_current', 'vfd_run_feedback', 'vfd_run_freq', 'alarm', 'standby', 'exhaust_mode',
    'side_door_closed', 'side_door_opened'
  ],
  pump: [
    'current', 'pos_pressure', 'neg_pressure', 'total_run_hours', 'total_run_minutes',
    'motor_temp_u', 'motor_temp_v', 'motor_temp_w', 'motor_front_axis_temp', 'motor_rear_axis_temp',
    'pump_front_axis_temp', 'pump_rear_axis_temp',
    'run_status', 'run_feedback', 'auto_starting', 'auto_stopping', 'remote_selected', 'local_allow',
    'standby_status', 'maintenance_status', 'forbid_start',
    'total_fault', 'start_fault', 'stop_fault', 'soft_start_fault', 'current_abnormal',
    'pos_pressure_timeout', 'neg_pressure_timeout', 'motor_vert_vib_alert', 'motor_horiz_vib_alert',
    'pump_vert_vib_alert', 'pump_horiz_vib_alert',
    'cmd_start', 'cmd_stop', 'cmd_reset_time',
    'voltage', 'current_fault', 'motor_phase_a_temp', 'motor_phase_b_temp', 'motor_phase_c_temp',
    'motor_vibration_1', 'motor_vibration_2', 'motor_overheat_fault',
    'pump_fault', 'pump_emergency_fault', 'pump_vibration_1', 'pump_vibration_2', 'pump_overheat_fault',
    'pump_run_feedback', 'pos_pressure_fault', 'neg_pressure_fault',
    'main_valve_close_feedback', 'main_valve_overload_fault', 'main_valve_closed',
    'main_valve_open_feedback', 'main_valve_opening', 'main_valve_closed_fault', 'main_valve_open',
    'main_valve_open_fault', 'jet_ball_valve_status',
    'semi_auto_status', 'runtime_reset_button', 'device_stop_status', 'remote_status',
    'runtime_minutes', 'runtime_hours', 'runtime', 'local_status', 'vibration_fault',
    'positive_pressure', 'negative_pressure', 'pump_front_temp', 'motor_front_temp', 'pump_rear_temp',
    'motor_rear_temp', 'total_run_time'
  ],
  conveyor: [
    'is_running', 'has_power', 'belt_speed', 'belt_tension', 'is_remote_control', 'is_local_control',
    'is_maintenance_mode',
    'motor_current_1', 'motor_temp_1', 'motor_overheat_1', 'motor_running_1',
    'motor_current_2', 'motor_temp_2', 'motor_overheat_2', 'motor_running_2',
    'motor_current_3', 'motor_temp_3', 'motor_overheat_3', 'motor_running_3',
    'drum_temp', 'drum_overheat', 'brake_status', 'brake_fault',
    'smoke_alarm', 'tear_alarm', 'deviation_alarm', 'coal_piling_alarm', 'skid_alarm', 'emergency_stop',
    'feeder_running', 'feeder_coal_level'
  ]
}

const mockDataDict: Record<string, { ids: string[], params: { label: string, value: string }[] }> = {
  hoist: {
    ids: ['TS001'],
    params: buildOptions(parameterKeyDict.hoist)
  },
  compressor: {
    ids: ['YF001', 'YF002', 'YF003', 'YF004', 'YF005', 'YF006', 'YF007'],
    params: buildOptions(parameterKeyDict.compressor)
  },
  ventilator: {
    ids: ['TF001', 'TF002'],
    params: buildOptions(parameterKeyDict.ventilator)
  },
  pump: {
    ids: ['PS001', 'PS002', 'PS003'],
    params: buildOptions(parameterKeyDict.pump)
  },
  conveyor: {
    ids: ['YS001'],
    params: buildOptions(parameterKeyDict.conveyor)
  }
}

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
  } catch (error) {
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
  gap: 18px;
  height: 100%;
  box-sizing: border-box;
  font-family: 'Rajdhani', sans-serif;
  color: #E6F7FF;
  background: radial-gradient(1200px 500px at 10% -10%, rgba(54, 240, 255, 0.25), transparent 60%),
    radial-gradient(900px 600px at 90% 10%, rgba(93, 120, 255, 0.25), transparent 65%),
    linear-gradient(135deg, #050b16 0%, #0b1b2b 60%, #0e1020 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(95, 200, 255, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(95, 200, 255, 0.08) 1px, transparent 1px);
    background-size: 40px 40px;
    opacity: 0.4;
    pointer-events: none;
  }

  .page-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 20px;
    border: 1px solid rgba(85, 160, 255, 0.22);
    border-radius: 14px;
    background: linear-gradient(120deg, rgba(12, 26, 44, 0.85), rgba(8, 20, 35, 0.7));
    box-shadow: inset 0 0 40px rgba(16, 32, 55, 0.6), 0 8px 28px rgba(0, 0, 0, 0.35);
  }

  .title-group {
    display: flex;
    flex-direction: column;
    gap: 6px;

    h2 {
      margin: 0;
      font-size: 22px;
      letter-spacing: 2px;
      font-family: 'Orbitron', sans-serif;
    }

    p {
      margin: 0;
      color: rgba(156, 203, 255, 0.8);
    }
  }

  .device-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: flex-end;
  }

  .device-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 999px;
    border: 1px solid rgba(54, 240, 255, 0.35);
    background: rgba(10, 24, 42, 0.8);
    font-size: 13px;
  }

  .chip-label {
    color: rgba(156, 203, 255, 0.8);
  }

  .chip-value {
    color: #36F0FF;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  &::after {
    content: '';
    position: absolute;
    width: 520px;
    height: 520px;
    right: -200px;
    bottom: -240px;
    background: radial-gradient(circle, rgba(54, 240, 255, 0.35), transparent 60%);
    filter: blur(10px);
    pointer-events: none;
  }

  .filter-card {
    backdrop-filter: blur(14px);
    background: rgba(8, 20, 35, 0.7);
    border: 1px solid rgba(85, 160, 255, 0.25);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);

    :deep(.el-card__body) {
      padding: 18px 20px;
    }

    .filter-form {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;

      .el-form-item {
        margin-bottom: 0;
        margin-right: 18px;
      }
    }
  }

  .chart-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(16px);
    background: rgba(6, 16, 30, 0.82);
    border: 1px solid rgba(74, 190, 255, 0.25);
    box-shadow: inset 0 0 40px rgba(19, 43, 70, 0.7), 0 18px 40px rgba(0, 0, 0, 0.4);

    :deep(.el-card__body) {
      flex: 1;
      padding: 20px;
      display: flex;
      flex-direction: column;
    }

    .chart-container {
      flex: 1;
      width: 100%;
      min-height: 400px;
      border-radius: 12px;
      position: relative;
      animation: pulseGlow 6s ease-in-out infinite;
    }
  }

  :deep(.el-form-item__label) {
    color: #9CCBFF;
    font-weight: 600;
  }

  :deep(.el-input__wrapper),
  :deep(.el-select .el-input__wrapper),
  :deep(.el-date-editor.el-input__wrapper) {
    background: rgba(12, 26, 44, 0.9);
    border: 1px solid rgba(84, 160, 255, 0.35);
    box-shadow: inset 0 0 12px rgba(54, 240, 255, 0.08);
  }

  :deep(.el-input__inner) {
    color: #E6F7FF;
    font-family: 'Rajdhani', sans-serif;
  }

  :deep(.el-button--primary) {
    background: linear-gradient(120deg, #36F0FF, #4A5CFF);
    border: none;
    color: #050b16;
    font-weight: 700;
    letter-spacing: 1px;
    box-shadow: 0 10px 20px rgba(54, 240, 255, 0.35);
  }

  :deep(.el-button--primary:hover) {
    filter: brightness(1.08);
  }
}

@keyframes pulseGlow {
  0%,
  100% {
    box-shadow: 0 0 0 rgba(54, 240, 255, 0);
  }
  50% {
    box-shadow: 0 0 28px rgba(54, 240, 255, 0.2);
  }
}
</style>
