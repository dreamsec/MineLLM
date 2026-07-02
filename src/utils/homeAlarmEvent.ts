import type { EquipmentAlarmEvent, EquipmentAlarmLevel } from '@/api/equipment-alarm'

export interface HomeAlarmItem {
  id: string
  eventId: number
  code: string
  name: string
  time: string
  level: EquipmentAlarmLevel
  message: string
  event: EquipmentAlarmEvent
}

export function normalizeAlarmEventList(data: unknown): EquipmentAlarmEvent[] {
  if (Array.isArray(data)) {
    return data as EquipmentAlarmEvent[]
  }

  if (data && typeof data === 'object' && Array.isArray((data as { list?: unknown }).list)) {
    return (data as { list: EquipmentAlarmEvent[] }).list
  }

  return []
}

export function mapAlarmEventToHomeItem(event: EquipmentAlarmEvent, deviceName: string): HomeAlarmItem {
  const title = event.title || getDefaultTitle(event)
  const detail = event.message ? ` ${event.message}` : ''

  return {
    id: String(event.id),
    eventId: event.id,
    code: event.equipment_code,
    name: deviceName || event.equipment_code,
    time: formatAlarmTime(event.start_time),
    level: normalizeHomeAlarmLevel(event),
    message: `[${title}]${detail}`,
    event,
  }
}

function normalizeHomeAlarmLevel(event: EquipmentAlarmEvent): EquipmentAlarmLevel {
  if (event.level === 'warning' || event.alarm_source === 'threshold') {
    return 'warning'
  }

  return 'alarm'
}

function getDefaultTitle(event: EquipmentAlarmEvent) {
  return event.alarm_source === 'threshold' ? '阈值超限' : '设备报警'
}

function formatAlarmTime(timeText: string) {
  if (!timeText) return ''

  // 后端可能返回 "YYYY-MM-DD HH:mm:ss" 或 ISO 字符串，这里只取首页需要展示的时间部分。
  const normalized = timeText.replace('T', ' ')
  const timePart = normalized.split(' ')[1]
  return timePart ? timePart.slice(0, 8) : normalized.slice(0, 8)
}
