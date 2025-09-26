// 导入项目中封装的请求工具函数
import { request } from "@/utils/service"
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



