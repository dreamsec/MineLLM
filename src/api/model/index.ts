import { request } from "@/utils/service"
import type * as Table from "./types/data"

/** 增 */
export function createModelDataApi(params: Table.ICreateModelRequestData) {
  return request<Table.createModelResponseData>({
    url: `model/creat`,
    method: "post",
    params
  })
}

/** 增 */
export function updateModelDataApi(params: Table.IUpdateModelRequestData) {
  return request<Table.updateModelResponseData>({
    url: `model/update`,
    method: "post",
    params
  })
}

/** 删 */
export function deleteModelDataApi(id: string) {
  return request<Table.deleteModelResponseData>({
    url: `model/delete/${id}`,
    method: "delete"
  })
}

/** 查 */
export function getModelDataApi(params: Table.IGetModelRequestData) {
  return request<Table.GetModelResponseData>({
    url: "model/list",
    method: "get",
    params
  })
}
