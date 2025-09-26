import { request2 } from "@/utils/service"
import type * as Detect from "./types/detect"
// import {ICurrentRequestData} from "./types/detect";

/** 获取当前调用权重 */
export function getCurrentWeightsApi(data: Detect.ICurrentRequestData) {
  return request2<Detect.GetCurrentWeightsResponseData>({
    url: "detect/weights/current",
    method: "post",
    data
  })
}

/** 获取所有可调用权重 */
export function getAllEnableWeightsApi() {
  return request2<Detect.GetEnableWeightsResponseData>({
    url: "detect/weights/list",
    method: "get"
  })
}

/** 切换权重 */
export function switchWeightsApi(data: Detect.ISwitchRoleRequestData) {
  return request2<Detect.SwitchWeightsResponseData>({
    url: "detect/weights/switch",
    method: "post",
    data
  })
}
