export const EQUIPMENT_THRESHOLD_TYPES = ['提升机', '压风机', '通风机', '排水机', '运输机'] as const
export const THRESHOLD_CONFIG_SCOPES = ['device', 'type'] as const

export type EquipmentThresholdType = (typeof EQUIPMENT_THRESHOLD_TYPES)[number]
export type ThresholdConfigScope = (typeof THRESHOLD_CONFIG_SCOPES)[number]

export interface ThresholdFieldDefinition {
  key: string
  label: string
  unit: string
  upperKey: string
  lowerKey: string
}

export interface ThresholdRangeValue {
  lower: number | string | null | undefined
  upper: number | string | null | undefined
}

export type ThresholdFormData = Record<string, ThresholdRangeValue>
export type ThresholdPayload = Record<string, number>
export type ThresholdApiData = Record<string, unknown> & {
  id?: number
  equipment_code?: string
  update_time?: string
  updated_at?: string
}
export interface InitializedThresholdState {
  thresholdData: null
  thresholdForm: ThresholdFormData
  savedAtText: ''
}

export const EQUIPMENT_CODE_MAP: Record<EquipmentThresholdType, string[]> = {
  提升机: ['TS001'],
  压风机: ['YF001', 'YF002', 'YF003', 'YF004', 'YF005', 'YF006', 'YF007'],
  通风机: ['TF001', 'TF002'],
  排水机: ['PS001', 'PS002', 'PS003'],
  运输机: ['YS001'],
}

const FIELD_GROUPS: Record<EquipmentThresholdType, Array<Omit<ThresholdFieldDefinition, 'upperKey' | 'lowerKey'>>> = {
  提升机: [
    { key: 'motor_temp', label: '电机温度', unit: '℃' },
    { key: 'bearing_temp', label: '轴承温度', unit: '℃' },
    { key: 'main_skip_speed', label: '主箕斗速度', unit: 'm/s' },
    { key: 'vice_skip_speed', label: '副箕斗速度', unit: 'm/s' },
    { key: 'main_skip_pos', label: '主箕斗位置', unit: 'm' },
    { key: 'vice_skip_pos', label: '副箕斗位置', unit: 'm' },
    { key: 'stator_current', label: '定子电流', unit: 'A' },
    { key: 'excitation_current', label: '励磁电流', unit: 'A' },
    { key: 'incoming_voltage', label: '进线电压', unit: 'V' },
    { key: 'brake_oil_pressure', label: '制动油压', unit: 'MPa' },
  ],
  压风机: [
    { key: 'unit_exhaust_temp', label: '机组排气温度', unit: '℃' },
    { key: 'host_exhaust_temp', label: '主机排气温度', unit: '℃' },
    { key: 'air_tank_temp', label: '风包温度', unit: '℃' },
    { key: 'coolant_temp', label: '冷却液温度', unit: '℃' },
    { key: 'running_temp', label: '运行温度', unit: '℃' },
    { key: 'exhaust_pressure', label: '排气压力', unit: 'MPa' },
    { key: 'separation_pressure', label: '分离压力', unit: 'MPa' },
    { key: 'separation_diff_pressure', label: '分离压差', unit: 'MPa' },
    { key: 'intake_vacuum', label: '进气真空度', unit: 'kPa' },
    { key: 'current', label: '电流', unit: 'A' },
    { key: 'voltage', label: '电压', unit: 'V' },
    { key: 'host_vibration', label: '主机振动', unit: 'mm/s' },
    { key: 'motor_vibration', label: '电机振动', unit: 'mm/s' },
  ],
  通风机: [
    { key: 'motor_phase_temp', label: '电机相温度', unit: '℃' },
    { key: 'motor_axis_temp', label: '电机轴承温度', unit: '℃' },
    { key: 'motor_vert_vibration', label: '电机垂直振动', unit: 'mm/s' },
    { key: 'motor_horiz_vibration', label: '电机水平振动', unit: 'mm/s' },
    { key: 'motor_current', label: '电机电流', unit: 'A' },
    { key: 'motor_voltage', label: '电机电压', unit: 'V' },
    { key: 'motor_active_power', label: '电机有功功率', unit: 'kW' },
    { key: 'inverter_current', label: '变频器电流', unit: 'A' },
    { key: 'inverter_freq', label: '变频器频率', unit: 'Hz' },
    { key: 'air_volume', label: '风量', unit: 'm³/min' },
    { key: 'air_speed', label: '风速', unit: 'm/s' },
    { key: 'neg_pressure', label: '负压', unit: 'Pa' },
    { key: 'total_pressure', label: '全压', unit: 'Pa' },
  ],
  排水机: [
    { key: 'current', label: '电流', unit: 'A' },
    { key: 'pos_pressure', label: '正压', unit: 'kPa' },
    { key: 'neg_pressure', label: '负压', unit: 'kPa' },
    { key: 'motor_temp', label: '电机温度', unit: '℃' },
    { key: 'motor_axis_temp', label: '电机轴承温度', unit: '℃' },
    { key: 'pump_axis_temp', label: '水泵轴承温度', unit: '℃' },
  ],
  运输机: [
    { key: 'belt_speed', label: '皮带速度', unit: 'm/s' },
    { key: 'belt_tension', label: '皮带张力', unit: 'kN' },
    { key: 'coal_bunker_level', label: '煤仓料位', unit: 'm' },
    { key: 'motor_temp', label: '电机温度', unit: '℃' },
    { key: 'drum_temp', label: '滚筒温度', unit: '℃' },
  ],
}

export const THRESHOLD_FIELDS_BY_TYPE: Record<EquipmentThresholdType, ThresholdFieldDefinition[]> =
  Object.fromEntries(
    EQUIPMENT_THRESHOLD_TYPES.map((equipmentType) => [
      equipmentType,
      FIELD_GROUPS[equipmentType].map((field) => ({
        ...field,
        // 后端统一使用 参数名_upper / 参数名_lower，前端只维护参数名即可。
        upperKey: `${field.key}_upper`,
        lowerKey: `${field.key}_lower`,
      })),
    ]),
  ) as Record<EquipmentThresholdType, ThresholdFieldDefinition[]>

export function getThresholdFieldsByType(equipmentType: EquipmentThresholdType) {
  return THRESHOLD_FIELDS_BY_TYPE[equipmentType]
}

export function getDefaultEquipmentCode(equipmentType: EquipmentThresholdType) {
  return EQUIPMENT_CODE_MAP[equipmentType][0] || ''
}

export function getThresholdTargetCodes(
  scope: ThresholdConfigScope,
  equipmentType: EquipmentThresholdType,
  equipmentCode: string,
  equipmentCodeMap: Record<EquipmentThresholdType, string[]>,
) {
  if (scope === 'device') {
    return equipmentCode ? [equipmentCode] : []
  }

  // 统一配置按设备类型批量写入，去重是为了防止设备列表接口返回重复编号。
  return Array.from(new Set(equipmentCodeMap[equipmentType] || [])).filter(Boolean)
}

export function createThresholdForm(equipmentType: EquipmentThresholdType): ThresholdFormData {
  return Object.fromEntries(
    getThresholdFieldsByType(equipmentType).map((field) => [
      field.key,
      {
        lower: null,
        upper: null,
      },
    ]),
  )
}

export function createInitializedThresholdState(
  equipmentType: EquipmentThresholdType,
): InitializedThresholdState {
  return {
    thresholdData: null,
    thresholdForm: createThresholdForm(equipmentType),
    savedAtText: '',
  }
}

export function hydrateThresholdForm(
  equipmentType: EquipmentThresholdType,
  data: ThresholdApiData | null | undefined,
): ThresholdFormData {
  const form = createThresholdForm(equipmentType)

  if (!data) return form

  for (const field of getThresholdFieldsByType(equipmentType)) {
    form[field.key] = {
      lower: normalizeFormValue(data[field.lowerKey]),
      upper: normalizeFormValue(data[field.upperKey]),
    }
  }

  return form
}

export function buildThresholdPayload(
  equipmentType: EquipmentThresholdType,
  formData: ThresholdFormData,
): ThresholdPayload {
  const payload: ThresholdPayload = {}

  for (const field of getThresholdFieldsByType(equipmentType)) {
    const fieldValue = formData[field.key]
    if (!fieldValue) continue

    appendNumber(payload, field.lowerKey, fieldValue.lower)
    appendNumber(payload, field.upperKey, fieldValue.upper)
  }

  return payload
}

function normalizeFormValue(value: unknown) {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') {
    const numericValue = Number(value)
    return Number.isFinite(numericValue) ? numericValue : null
  }
  return null
}

function appendNumber(payload: ThresholdPayload, key: string, value: unknown) {
  if (value === null || value === undefined || value === '') return

  const numericValue = typeof value === 'number' ? value : Number(value)
  if (Number.isFinite(numericValue)) {
    // 这里保留 0，因为 0 是有效下限；只过滤空值和非法数字。
    payload[key] = numericValue
  }
}
