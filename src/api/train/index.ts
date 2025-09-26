import { request2 } from "@/utils/service"
import type * as Train from "./types/train"

/** 获取当前调用权重 */
export function getCurrentDatasetsApi(data: Train.ISwitchDatasetRequestData) {
  return request2<Train.SwitchDatasetsResponseData>({
    url: "train/yamls/list",
    method: "post",
    data
  })
}

/** 获取所有可调用权重 */
export function getAllEnableallApi(data: Train.ItrainRequestData) {
  return request2<Train.GetEnableallResponseData>({
    url: "train/all/list",
    method: "post",
    data
  })
}

/** 获取所有可调用权重 */
export function getAllEnableModelApi() {
  return request2<Train.GetEnableModelResponseData>({
    url: "train/model/list",
    method: "post"
  })
}

/** 切换权重 */
export function switchWeightsApi(data: Train.ISwitchtrainRequestData) {
  return request2<Train.SwitchWeightsResponseData>({
    url: "train/start_train",
    method: "post",
    data
  })
}

/** 删 */
export function deleteWeightDataApi(id: string) {
  return request2<Train.deleteModelResponseData>({
    url: `train/delete/${id}`,
    method: "delete"
  })
}

/** 删 */
export function publishWeightDataApi(data: Train.IpublishweightRequestData) {
  return request2<Train.publishModelResponseData>({
    url: `train/publish`,
    method: "post",
    data
  })
}

/** 启动发布任务（返回 task_id） */
export function startPublishTaskApi(data: Train.IpublishweightRequestData & { precision?: string }) {
  return request2<any>({
    url: `train/publish/start`,
    method: "post",
    data
  })
}

/** 查询发布任务进度 */
export function getPublishProgressApi(task_id: string) {
  return request2<any>({
    url: `train/publish/progress`,
    method: "post",
    data: { task_id }
  })
}

/** 删 */
export function listlocationDataApi(data: Train.IselectcameraRequestData) {
  return request2<Train.ListareaResponseData>({
    url: `train/area/list`,
    method: "post",
    data
  })
}

/** 删 */
export function listcameraDataApi(data: Train.IcameraRequestData) {
  return request2<Train.ListcameraResponseData>({
    url: `train/area/switch`,
    method: "post",
    data
  })
}
/** 删 */
export function DataTrainDataApi(data: Train.IDataTrainRequestData) {
  return request2<Train.DataTrainResponseData>({
    url: `train/data_train`,
    method: "post",
    data
  })
}
