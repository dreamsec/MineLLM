export type EquipmentAlarmSource = 'field' | 'threshold'
export type EquipmentAlarmLevel = 'alarm' | 'warning'
export type EquipmentAlarmStatus = 'active' | 'recovered'
export type EquipmentAlarmAckStatus = 'unacknowledged' | 'acknowledged'
export type EquipmentAlarmAckType = 'ack' | 'dismiss'
export type EquipmentAlarmDirection = 'upper' | 'lower' | ''

export interface EquipmentAlarmEvent {
  id: number
  equipment_code: string
  equipment_type: string
  alarm_source: EquipmentAlarmSource
  level: EquipmentAlarmLevel
  alarm_code: string
  title: string
  message: string
  source_key: string
  direction?: EquipmentAlarmDirection | null
  value?: number | null
  threshold?: number | null
  status: EquipmentAlarmStatus
  ack_status: EquipmentAlarmAckStatus
  start_time: string
  end_time?: string | null
  duration_seconds?: number | null
  ack_type?: EquipmentAlarmAckType | null
  ack_user_id?: number | null
  ack_time?: string | null
  create_time?: string
  update_time?: string
}

export interface EquipmentAlarmListData {
  total?: number
  list: EquipmentAlarmEvent[]
}

export type EquipmentAlarmActiveData = EquipmentAlarmEvent[] | EquipmentAlarmListData

export type GetActiveEquipmentAlarmsResponse = IApiResponseData<EquipmentAlarmActiveData>

export interface GetEquipmentAlarmListParams {
  date?: string
  start_time?: string
  end_time?: string
  equipment_code?: string
  equipment_type?: string
  alarm_source?: EquipmentAlarmSource | ''
  level?: EquipmentAlarmLevel | ''
  status?: EquipmentAlarmStatus | ''
  ack_status?: EquipmentAlarmAckStatus | ''
  ack_type?: EquipmentAlarmAckType | ''
  page?: number
  size?: number
}

export type GetEquipmentAlarmListResponse = IApiResponseData<EquipmentAlarmListData>

export interface ExportEquipmentAlarmDailyReportParams {
  date: string
  equipment_code?: string
  equipment_type?: string
  alarm_source?: EquipmentAlarmSource
  level?: EquipmentAlarmLevel
  status?: EquipmentAlarmStatus
  ack_status?: EquipmentAlarmAckStatus
}

export interface EquipmentAlarmStatistics {
  date: string
  total_count: number
  field_alarm_count: number
  threshold_alarm_count: number
  active_count: number
  recovered_count: number
  acknowledged_count?: number
  ongoing_count?: number
  by_equipment_type: Array<Record<string, unknown>>
  by_equipment_code: Array<Record<string, unknown>>
  by_hour: Array<Record<string, unknown>>
}

export type GetEquipmentAlarmStatisticsResponse = IApiResponseData<EquipmentAlarmStatistics>

export type UpdateEquipmentAlarmAckResponse = IApiResponseData<EquipmentAlarmEvent>
