import { request2 } from "@/utils/service"
import type * as Table from "./types/data"

/** 增 */
export function createModelDataApi(params: Table.ICreateModelRequestData) {
  return request2<Table.createModelResponseData>({
    url: `model/creat`,
    method: "post",
    params
  })
}

/** 增 */
export function updateModelDataApi(params: Table.IUpdateModelRequestData) {
  return request2<Table.updateModelResponseData>({
    url: `model/update`,
    method: "post",
    params
  })
}

/** 删 */
export function deleteModelDataApi(id: string) {
  return request2<Table.deleteModelResponseData>({
    url: `model/delete/${id}`,
    method: "delete"
  })
}

/** 查 */
export function getModelDataApi(params: Table.IGetModelRequestData) {
  return request2<Table.GetModelResponseData>({
    url: "model/list",
    method: "get",
    params
  })
}
