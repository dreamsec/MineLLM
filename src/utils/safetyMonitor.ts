export const DEFAULT_SAFETY_MONITOR_STATION_CODE = '24080000000043'

export const RECOMMENDED_SAFETY_SENSOR_TYPES = [
  '激光甲烷',
  '粉尘',
  '环境温度',
] as const

export type SafetySensorTone = 'methane' | 'dust' | 'temperature' | 'default'

type SafetySensorWithType = {
  sensor_type?: string | null
}

type SafetySensorTableItem = SafetySensorWithType & {
  sensor_code?: string | null
  sensor_name?: string | null
}

export interface SafetySensorFilters {
  type?: string
  keyword?: string
}

/** 清理传感器类型参数，保持原顺序并移除空值和重复项。 */
export function normalizeSensorTypes(types: readonly string[]) {
  const normalizedTypes = types
    .map(type => type.trim())
    .filter(Boolean)

  return [...new Set(normalizedTypes)]
}

/** 生成后端要求的英文逗号分隔类型参数。 */
export function buildSensorTypesParam(types?: readonly string[]) {
  if (!types) return undefined
  const normalizedTypes = normalizeSensorTypes(types)
  return normalizedTypes.length > 0 ? normalizedTypes.join(',') : undefined
}

/** 按传感器类型分组，缺少类型的数据统一归入“未知类型”。 */
export function groupSafetySensorsByType<T extends SafetySensorWithType>(
  sensors: readonly T[],
) {
  return sensors.reduce<Record<string, T[]>>((groups, sensor) => {
    const sensorType = sensor.sensor_type?.trim() || '未知类型'
    ;(groups[sensorType] ||= []).push(sensor)
    return groups
  }, {})
}

/** 表格筛选在前端本地完成，名称、编码和类型都支持关键词匹配。 */
export function filterSafetySensors<T extends SafetySensorTableItem>(
  sensors: readonly T[],
  filters: SafetySensorFilters,
) {
  const selectedType = filters.type?.trim() || ''
  const keyword = filters.keyword?.trim().toLocaleLowerCase() || ''

  return sensors.filter((sensor) => {
    if (selectedType && sensor.sensor_type !== selectedType) return false
    if (!keyword) return true

    return [
      sensor.sensor_name,
      sensor.sensor_code,
      sensor.sensor_type,
    ].some(value => value?.toLocaleLowerCase().includes(keyword))
  })
}

/** 数值 0 是有效数据，只有 null 和 undefined 才显示占位符。 */
export function formatSafetySensorValue(value: number | null | undefined) {
  return value === null || value === undefined ? '--' : String(value)
}

/** 将接口时间统一为便于大屏扫描的 YYYY-MM-DD HH:mm:ss 格式。 */
export function formatSafetyMonitorTime(value: string | null | undefined) {
  if (!value) return '暂无实时记录'

  const simpleDateTime = value.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2})/)
  if (simpleDateTime) {
    return `${simpleDateTime[1]} ${simpleDateTime[2]}`
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const pad = (part: number) => String(part).padStart(2, '0')
  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  ].join(' ')
}

/** 页面只按类型选择视觉色调，不解释后端状态码。 */
export function getSafetySensorTone(sensorType: string | null | undefined): SafetySensorTone {
  if (sensorType === '激光甲烷') return 'methane'
  if (sensorType === '粉尘') return 'dust'
  if (sensorType === '环境温度') return 'temperature'
  return 'default'
}
