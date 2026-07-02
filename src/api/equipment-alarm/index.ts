import { request } from '@/utils/service'
import type * as EquipmentAlarm from './types/equipmentAlarm'

/** 获取首页当前需要展示的活跃报警 */
export function getActiveEquipmentAlarmsApi() {
  return request<EquipmentAlarm.GetActiveEquipmentAlarmsResponse>({
    url: '/api/v1/equipment-alarm/active',
    method: 'get',
    // 首页轮询接口静默请求，避免每分钟弹出成功提示。
    silent: true,
  })
}

/** 查询报警历史明细，后续历史页/统计页可直接复用 */
export function getEquipmentAlarmListApi(params: EquipmentAlarm.GetEquipmentAlarmListParams) {
  return request<EquipmentAlarm.GetEquipmentAlarmListResponse>({
    url: '/api/v1/equipment-alarm/list',
    method: 'get',
    params,
    silent: true,
  })
}

/** 查询指定日期的报警统计 */
export function getEquipmentAlarmStatisticsApi(date: string) {
  return request<EquipmentAlarm.GetEquipmentAlarmStatisticsResponse>({
    url: '/api/v1/equipment-alarm/statistics',
    method: 'get',
    params: { date },
    silent: true,
  })
}

/** 导出报警日报 Word，包含总览、统计和明细表 */
export function exportEquipmentAlarmDailyReportApi(
  params: EquipmentAlarm.ExportEquipmentAlarmDailyReportParams,
) {
  return request<Blob>({
    url: '/api/v1/equipment-alarm/daily/export',
    method: 'get',
    params,
    responseType: 'blob',
    silent: true,
  })
}

/** 确认报警：表示用户已知晓，但不代表设备已恢复 */
export function acknowledgeEquipmentAlarmApi(id: number | string) {
  return request<EquipmentAlarm.UpdateEquipmentAlarmAckResponse>({
    url: `/api/v1/equipment-alarm/${id}/ack`,
    method: 'patch',
    silent: true,
  })
}

/** 忽略报警：用于首页删除卡片，历史统计仍然保留该报警 */
export function dismissEquipmentAlarmApi(id: number | string) {
  return request<EquipmentAlarm.UpdateEquipmentAlarmAckResponse>({
    url: `/api/v1/equipment-alarm/${id}/dismiss`,
    method: 'post',
    silent: true,
  })
}

export type {
  EquipmentAlarmEvent,
  EquipmentAlarmLevel,
  EquipmentAlarmSource,
  EquipmentAlarmStatus,
  EquipmentAlarmAckStatus,
  EquipmentAlarmAckType,
  ExportEquipmentAlarmDailyReportParams,
} from './types/equipmentAlarm'
