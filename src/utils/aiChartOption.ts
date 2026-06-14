type ChartRecord = Record<string, unknown>
type ChartSeries = Record<string, unknown> & {
  name?: string
  data?: unknown[]
}

interface NormalizeChartResult {
  option: Record<string, unknown>
  fieldLabels: Record<string, string>
  seriesFieldKeys: string[]
}

const TIME_FIELD_KEYS = new Set([
  'collected_at',
  'created_at',
  'updated_at',
  'timestamp',
  'time',
])

// 这里复用各机器页面里已经展示给用户看的中文字段名，避免图例出现“温度_1”这类不可读名称。
const FIELD_LABELS: Record<string, string> = {
  collected_at: '采集时间',
  created_at: '创建时间',
  updated_at: '更新时间',
  timestamp: '时间戳',
  time: '时间',
  equipment_code: '设备编码',
  equipment_name: '设备名称',
  equipment_type: '设备类型',
  equipment_status: '设备状态',
  status_indicator: '状态指示',
  record_count: '返回条数',
  total_count: '总条数',
  count: '数量',
  min: '最小值',
  max: '最大值',
  avg: '平均值',

  main_skip_speed: '主箕斗提升速度',
  main_skip_pos: '主箕斗提升位置',
  vice_skip_speed: '副箕斗提升速度',
  vice_skip_pos: '副箕斗提升位置',
  stator_current: '定子电流',
  excitation_current: '励磁电流',
  incoming_voltage: '进线电压',
  brake_oil_pressure: '制动油压',

  motor_temp_1: '电机温度1',
  motor_temp_2: '电机温度2',
  motor_temp_3: '电机温度3',
  motor_temp_4: '电机温度4',
  motor_temp_5: '电机温度5',
  motor_temp_6: '电机温度6',
  bearing_temp_1: '轴承温度1',
  bearing_temp_2: '轴承温度2',
  bearing_temp_3: '轴承温度3',
  bearing_temp_4: '轴承温度4',

  unit_exhaust_temp: '机组排气温度',
  host_exhaust_temp: '主机排气温度',
  air_tank_temp: '风包温度',
  coolant_temp: '冷却剂温度',
  running_temp: '运行温度',
  exhaust_pressure: '排气压力',
  separation_pressure: '分离压力',
  separation_diff_pressure: '分离压差',
  intake_vacuum: '进气真空',
  voltage: '电压',
  current: '电流',
  host_vibration: '主机振动',
  motor_vibration: '电机振动',

  air_speed: '风速',
  air_volume: '风量',
  total_pressure: '全压',
  neg_pressure: '负压',
  inverter_freq: '变频频率',
  inverter_current: '变频电流',
  motor1_voltage: '1#电机电压',
  motor1_current: '1#电机电流',
  motor1_active_power: '1#电机有功',
  motor1_vert_vibration: '1#电机垂直振动',
  motor1_horiz_vibration: '1#电机水平振动',
  motor1_north_axis_temp: '1#电机北轴温度',
  motor2_voltage: '2#电机电压',
  motor2_current: '2#电机电流',
  motor2_active_power: '2#电机有功',
  motor2_vert_vibration: '2#电机垂直振动',
  motor2_horiz_vibration: '2#电机水平振动',
  motor2_north_axis_temp: '2#电机北轴温度',

  pos_pressure: '正压',
  total_run_time: '累计运行',
  motor_temp_u: '电机U温',
  motor_temp_v: '电机V温',
  motor_temp_w: '电机W温',
  motor_front_axis_temp: '电机前轴温',
  motor_rear_axis_temp: '电机后轴温',
  pump_front_axis_temp: '水泵前轴温',
  pump_rear_axis_temp: '水泵后轴温',

  belt_speed: '皮带速度',
  belt_tension: '皮带张力',
  coal_bunker_level: '煤仓空高',
  motor_1_temp: '1#电机温度',
  motor_2_temp: '2#电机温度',
  drum_1_temp: '1#滚筒温度',
  drum_2_temp: '2#滚筒温度',
}

const GENERIC_SERIES_REGEXP = /^(温度|电流|电压|压力|速度|振动|位置|功率|数据)[_\s-]*\d+$/u

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

const clonePlain = <T>(value: T): T => {
  return JSON.parse(JSON.stringify(value)) as T
}

const toSeriesArray = (series: unknown): ChartSeries[] => {
  if (Array.isArray(series)) return series.filter(isRecord) as ChartSeries[]
  return isRecord(series) ? [series as ChartSeries] : []
}

const toNumber = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null
  const matched = value.match(/-?\d+(?:\.\d+)?/)
  if (!matched) return null
  const numeric = Number(matched[0])
  return Number.isFinite(numeric) ? numeric : null
}

const isNumericField = (key: string, records: ChartRecord[]) => {
  if (TIME_FIELD_KEYS.has(key)) return false
  return records.some((record) => toNumber(record[key]) !== null)
}

export const getMetricFieldLabel = (key: string) => {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key]

  const motorTemp = key.match(/^motor_temp_(\d+)$/)
  if (motorTemp) return `电机温度${motorTemp[1]}`

  const bearingTemp = key.match(/^bearing_temp_(\d+)$/)
  if (bearingTemp) return `轴承温度${bearingTemp[1]}`

  return key
}

export const formatMetricText = (text: string) => {
  // 后端摘要里可能直接拼出 stator_current 这类字段名，这里统一替换成页面上的中文名称。
  return text.replace(/\b[a-z][a-z0-9_]*\b/g, (key) => getMetricFieldLabel(key))
}

const getSeriesTopic = (series: ChartSeries[]) => {
  const firstName = String(series.find((item) => item.name)?.name || '')
  if (firstName.includes('温度')) return '温'
  if (firstName.includes('电流')) return '电流'
  if (firstName.includes('电压')) return '电压'
  if (firstName.includes('压力')) return '压'
  if (firstName.includes('速度')) return '速度'
  if (firstName.includes('振动')) return '振动'
  if (firstName.includes('位置')) return '位置'
  if (firstName.includes('功率')) return '功率'
  return ''
}

const inferSeriesFieldKeys = (records: ChartRecord[], series: ChartSeries[]) => {
  const firstRecord = records[0]
  if (!firstRecord || !series.length) return []

  const numericKeys = Object.keys(firstRecord).filter((key) => isNumericField(key, records))
  const topic = getSeriesTopic(series)
  const topicKeys = topic
    ? numericKeys.filter((key) => getMetricFieldLabel(key).includes(topic))
    : []

  const candidates = topicKeys.length >= series.length ? topicKeys : numericKeys
  return candidates.slice(0, series.length)
}

const shouldRenameSeries = (name: unknown, fieldKey: string) => {
  const text = String(name || '')
  return !text || text === fieldKey || GENERIC_SERIES_REGEXP.test(text)
}

const updateLegendName = (legend: unknown, nameMap: Map<string, string>) => {
  const rename = (name: unknown) => {
    const text = String(name || '')
    return nameMap.get(text) || text
  }

  if (isRecord(legend) && Array.isArray(legend.data)) {
    legend.data = legend.data.map(rename)
  }

  if (Array.isArray(legend)) {
    legend.forEach((item) => {
      if (isRecord(item) && Array.isArray(item.data)) {
        item.data = item.data.map(rename)
      }
    })
  }
}

export const normalizeChartToolData = (chartData: unknown): NormalizeChartResult => {
  if (!isRecord(chartData) || !isRecord(chartData.echarts_option)) {
    return { option: {}, fieldLabels: {}, seriesFieldKeys: [] }
  }

  const option = clonePlain(chartData.echarts_option)
  const series = toSeriesArray(option.series)
  const records = Array.isArray(chartData.records)
    ? chartData.records.filter(isRecord)
    : []
  const seriesFieldKeys = inferSeriesFieldKeys(records, series)
  const nameMap = new Map<string, string>()
  const fieldLabels: Record<string, string> = {}

  series.forEach((item, index) => {
    const fieldKey = seriesFieldKeys[index]
    if (!fieldKey) return

    const label = getMetricFieldLabel(fieldKey)
    fieldLabels[fieldKey] = label

    // 后端图表已经给出数据值，前端这里只负责把通用名称翻译成设备字段中文。
    if (shouldRenameSeries(item.name, fieldKey)) {
      const oldName = String(item.name || fieldKey)
      item.name = label
      nameMap.set(oldName, label)
    }
  })

  updateLegendName(option.legend, nameMap)

  return { option, fieldLabels, seriesFieldKeys }
}
