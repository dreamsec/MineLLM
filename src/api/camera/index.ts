import { request } from "@/utils/service"
// 导入摄像头相关的类型定义
import type * as Camera from "./types/camera"

/**
 * 获取摄像头列表
 * @param params 查询参数，包括页码、每页数量、名称、IP、状态等
 * @returns 摄像头列表响应数据，包含总数和摄像头数组
 */
export function getCamerasApi(params: Camera.GetCamerasRequestParams) {
  return request<Camera.CameraApiResponse>({
    url: "/api/v1/camera/list", // 请根据实际接口地址修改
    method: "get",
    params // 将传入的参数作为查询参数发送
  })
}

/**
 * 获取所有摄像头（不进行分页）
 * @returns 摄像头列表数据
 */
export function getAllCamerasApi() {
  // 设置page为1，page_size为一个较大的数来获取所有摄像头
  const params = {
    page: 1,
    page_size: 1000 // 假设最大摄像头数量不超过1000
  }

  return getCamerasApi(params)
}

export function addCameraApi(params: Camera.AddCameraRequestParams) {
  return request<Camera.AddCameraResponseData>({
    url: "/api/v1/camera", // 请根据实际接口地址修改
    method: "post",
    data: params // 将参数从params改为data，作为请求体发送
  })
}

export function updateCameraApi(params: Camera.UpdateCameraRequestParams) {
  // 从参数中提取id
  const { id, ...updateData } = params;
  return request<Camera.UpdateCameraResponseData>({
    url: `/api/v1/camera/${id}`,
    method: "put",
    data: updateData
  })
}

// 删除摄像头
export function deleteCameraApi(params: Camera.DeleteCameraRequestParams) {
  // 从参数中提取id
  const { id } = params;
  return request<Camera.DeleteCameraResponseData>({
    url: `/api/v1/camera/${id}`,
    method: "delete"
  })
}
