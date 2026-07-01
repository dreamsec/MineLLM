import {
  getThresholdFieldsByType,
  type EquipmentThresholdType,
  type ThresholdApiData,
  type ThresholdFieldDefinition,
} from '../constants/equipmentThreshold.ts'

export interface ThresholdAlarmInput {
  equipmentCode: string
  realtimeData: Record<string, unknown> | null | undefined
  thresholdData: ThresholdApiData | null | undefined
}

export interface ThresholdAlarmBreach {
  equipmentCode: string
  equipmentType: EquipmentThresholdType
  fieldKey: string
  sourceKey: string
  label: string
  unit: string
  value: number
  threshold: number
  direction: 'lower' | 'upper'
  message: string
}

interface RealtimeMetricValue {
  key: string
  value: number
}

const EQUIPMENT_TYPE_BY_PREFIX: Array<[string, EquipmentThresholdType]> = [
  ['TS', '提升机'],
  ['YF', '压风机'],
  ['TF', '通风机'],
  ['PS', '排水机'],
  ['YS', '运输机'],
]

const REALTIME_FIELD_ALIASES: Record<EquipmentThresholdType, Record<string, string[]>> = {
  提升机: {
    motor_temp: ['motor_temp_1', 'motor_temp_2', 'motor_temp_3', 'motor_temp_4', 'motor_temp_5', 'motor_temp_6'],
    bearing_temp: ['bearing_temp_1', 'bearing_temp_2', 'bearing_temp_3', 'bearing_temp_4'],
  },
  压风机: {},
  通风机: {
    motor_phase_temp: [
      'motor1_phase_a_temp',
      'motor1_phase_b_temp',
      'motor1_phase_c_temp',
      'motor2_phase_a_temp',
      'motor2_phase_b_temp',
      'motor2_phase_c_temp',
    ],
    motor_axis_temp: [
      'motor1_north_axis_temp',
      'motor1_south_axis_temp',
      'motor2_north_axis_temp',
      'motor2_south_axis_temp',
    ],
    motor_vert_vibration: ['motor1_vert_vibration', 'motor2_vert_vibration'],
    motor_horiz_vibration: ['motor1_horiz_vibration', 'motor2_horiz_vibration'],
    motor_current: ['motor1_current', 'motor2_current'],
    motor_voltage: ['motor1_voltage', 'motor2_voltage'],
    motor_active_power: ['motor1_active_power', 'motor2_active_power'],
  },
  排水机: {
    motor_temp: ['motor_temp_u', 'motor_temp_v', 'motor_temp_w', 'motor_phase_a_temp', 'motor_phase_b_temp', 'motor_phase_c_temp'],
    motor_axis_temp: ['motor_front_axis_temp', 'motor_rear_axis_temp'],
    pump_axis_temp: ['pump_front_axis_temp', 'pump_rear_axis_temp'],
    pos_pressure: ['pos_pressure', 'positive_pressure'],
    neg_pressure: ['neg_pressure', 'negative_pressure'],
  },
  运输机: {
    motor_temp: ['motor_1_temp', 'motor_2_temp'],
    drum_temp: ['drum_1_temp', 'drum_2_temp'],
  },
}

export const getEquipmentThresholdTypeByCode = (equipmentCode: string): EquipmentThresholdType | null => {
  const normalizedCode = equipmentCode.trim().toUpperCase()
  const matched = EQUIPMENT_TYPE_BY_PREFIX.find(([prefix]) => normalizedCode.startsWith(prefix))
  return matched?.[1] || null
}

export const analyzeThresholdBreaches = ({
  equipmentCode,
  realtimeData,
  thresholdData,
}: ThresholdAlarmInput): ThresholdAlarmBreach[] => {
  const equipmentType = getEquipmentThresholdTypeByCode(equipmentCode)
  if (!equipmentType || !realtimeData || !thresholdData) return []

  const breaches: ThresholdAlarmBreach[] = []

  for (const field of getThresholdFieldsByType(equipmentType)) {
    const metricValues = resolveRealtimeMetricValues(equipmentType, field, realtimeData)
    if (metricValues.length === 0) continue

    const lower = toFiniteNumber(thresholdData[field.lowerKey])
    const upper = toFiniteNumber(thresholdData[field.upperKey])

    if (lower !== null) {
      const minValue = getMinMetricValue(metricValues)
      if (minValue && minValue.value < lower) {
        breaches.push(createBreach(equipmentCode, equipmentType, field, minValue, lower, 'lower'))
      }
    }

    if (upper !== null) {
      const maxValue = getMaxMetricValue(metricValues)
      if (maxValue && maxValue.value > upper) {
        breaches.push(createBreach(equipmentCode, equipmentType, field, maxValue, upper, 'upper'))
      }
    }
  }

  return breaches
}

const resolveRealtimeMetricValues = (
  equipmentType: EquipmentThresholdType,
  field: ThresholdFieldDefinition,
  realtimeData: Record<string, unknown>,
) => {
  const aliasKeys = REALTIME_FIELD_ALIASES[equipmentType][field.key] || []
  const candidateKeys = Array.from(new Set([field.key, ...aliasKeys]))

  // 聚合字段会映射到多个实时字段，例如三相温度取实际超限的那一相。
  return candidateKeys
    .map((key) => ({ key, value: toFiniteNumber(realtimeData[key]) }))
    .filter((item): item is RealtimeMetricValue => item.value !== null)
}

const createBreach = (
  equipmentCode: string,
  equipmentType: EquipmentThresholdType,
  field: ThresholdFieldDefinition,
  metric: RealtimeMetricValue,
  threshold: number,
  direction: ThresholdAlarmBreach['direction'],
): ThresholdAlarmBreach => {
  const relationText = direction === 'upper' ? '超过上限' : '低于下限'
  const unit = field.unit || ''

  return {
    equipmentCode,
    equipmentType,
    fieldKey: field.key,
    sourceKey: metric.key,
    label: field.label,
    unit,
    value: metric.value,
    threshold,
    direction,
    message: `${field.label} ${formatNumber(metric.value)}${unit} ${relationText} ${formatNumber(threshold)}${unit}`,
  }
}

const toFiniteNumber = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim() !== '') {
    const numericValue = Number(value)
    return Number.isFinite(numericValue) ? numericValue : null
  }
  return null
}

const getMinMetricValue = (values: RealtimeMetricValue[]) => {
  return values.reduce<RealtimeMetricValue | null>((current, item) => {
    if (!current || item.value < current.value) return item
    return current
  }, null)
}

const getMaxMetricValue = (values: RealtimeMetricValue[]) => {
  return values.reduce<RealtimeMetricValue | null>((current, item) => {
    if (!current || item.value > current.value) return item
    return current
  }, null)
}

const formatNumber = (value: number) => {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}
