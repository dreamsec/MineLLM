// 导入项目中封装的请求工具函数
import { request } from "@/utils/service"
import { buildReportExportRequest, type EquipmentReportPeriodType } from "@/utils/reportExport"
// 导入设备相关的类型定义
import type * as Device from "./types/device"


/**
 * 获取设备列表（带分页和筛选）
 * @param params 查询参数，包括页码、每页数量、设备类型、设备状态等
 * @returns 设备列表响应数据，包含总数和设备数组
 */
export function getDevicesApi(params: Device.GetDevicesRequestParams) {
  return request<Device.GetDevicesResponseData>({
    // 根据用户提供的后端接口，这里应该是实际的设备列表接口地址
    url: "/api/v1/equipment/list", // 请替换为实际的接口URL
    method: "get",
    params // 将传入的参数作为查询参数发送
  })
}

export function addDeviceApi(data: Device.AddDeviceRequestParams) {
  return request<Device.AddDeviceResponseData>({
    // 请替换为实际的新增设备接口URL
    url: "/api/v1/equipment",
    method: "post",
    data // 将传入的参数作为请求体发送
  })
}

export function updateDeviceApi(equipmentCode: string, data: Device.UpdateDeviceRequestParams) {
  return request<Device.UpdateDeviceResponseData>({
    url: `/api/v1/equipment/${equipmentCode}`,
    method: "put",
    data
  })
}

export function deleteDeviceApi(equipmentCode: string) {
  return request<Device.DeleteDeviceResponseData>({
    url: `/api/v1/equipment/${equipmentCode}`,
    method: "delete"
  })
}

//获取实时信息
export function getRealtimeDataApi(equipmentCode: string) {
  return request<Device.GetEquipmentRealtimeDataResponse>({
    url: `/api/v1/equipment/${equipmentCode}/realtime`,
    method: "get"
  })
}

/**
 * 按变量查询设备历史实时数据
 * @param params 查询参数 (包含设别编号、查询变量、开始时间和结束时间)
 */
export function getEquipmentHistoryVariableApi(params: Device.GetEquipmentHistoryVariableParams) {
  return request<Device.GetEquipmentHistoryVariableResponse>({
    url: "/api/v1/equipment/realtime/history/variable",
    method: "get",
    params
  })
}

/** 导出指定设备日报为Word文档 */
export function exportDailyReportApi(equipmentCode: string, reportDate: string) {
  return request<Blob>({
    url: "/api/v1/equipment-report/daily/export",
    method: "get",
    params: { equipment_code: equipmentCode, report_date: reportDate },
    responseType: "blob"
  })
}

/** 导出指定日期所有设备日报汇总 */
export function exportAllDailyReportsApi(reportDate: string) {
  return request<Blob>({
    url: "/api/v1/equipment-report/daily/export-all",
    method: "post",
    params: { report_date: reportDate },
    responseType: "blob"
  })
}

/** 导出指定日期、指定设备类型的日报汇总 */
export function exportByTypeDailyReportsApi(equipmentType: string, reportDate: string) {
  return request<Blob>({
    url: "/api/v1/equipment-report/daily/export-by-type",
    method: "post",
    params: { equipment_type: equipmentType, report_date: reportDate },
    responseType: "blob"
  })
}

/** 按日报/周报/月报统一导出报表，内部会处理不同周期的日期参数名 */
export function exportReportApi(
  periodType: EquipmentReportPeriodType,
  equipmentType: string,
  equipmentCode: string,
  reportDate: string,
) {
  const config = buildReportExportRequest(periodType, equipmentType, equipmentCode, reportDate)
  return request<Blob>({
    ...config,
    responseType: "blob"
  })
}

/** 获取单台设备阈值配置 */
export function getEquipmentThresholdApi(equipmentCode: string) {
  return request<Device.GetEquipmentThresholdResponseData>({
    url: `/api/v1/equipment-threshold/${equipmentCode}`,
    method: "get"
  })
}

/** 创建或更新单台设备阈值配置 */
export function upsertEquipmentThresholdApi(
  equipmentCode: string,
  data: Device.UpsertEquipmentThresholdRequestParams
) {
  return request<Device.UpsertEquipmentThresholdResponseData>({
    url: `/api/v1/equipment-threshold/${equipmentCode}`,
    method: "post",
    data
  })
}

/** 分页查询设备阈值列表，后续可用于批量维护页 */
export function getEquipmentThresholdListApi(params: Device.GetEquipmentThresholdListRequestParams) {
  return request<Device.GetEquipmentThresholdListResponseData>({
    url: "/api/v1/equipment-threshold/list",
    method: "get",
    params
  })
}

/** 删除单台设备阈值配置 */
export function deleteEquipmentThresholdApi(equipmentCode: string) {
  return request<Device.DeleteEquipmentThresholdResponseData>({
    url: `/api/v1/equipment-threshold/${equipmentCode}`,
    method: "delete"
  })
}
