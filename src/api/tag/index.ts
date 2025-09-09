import { request } from "@/utils/service"
import type * as Tag from "./types/tag"
// import { addTagResponseData, ICreateApplicationRequestData, ICreateLocationRequestData } from "./types/tag"

/** 增 */
export function addTagApi(data: Tag.ICreateTagRequestData) {
  return request<Tag.addTagResponseData>({
    url: `tag/add`,
    method: "post",
    data
  })
}
export function addApplicationApi(data: Tag.ICreateApplicationRequestData) {
  return request<Tag.addTagResponseData>({
    url: `camera-manage/creat_application`,
    method: "post",
    data
  })
}
export function addLocationApi(data: Tag.ICreateLocationRequestData) {
  return request<Tag.addTagResponseData>({
    url: `camera-manage/creat_location`,
    method: "post",
    data
  })
}

/** 删 */
export function deleteTagApi(tag_id: number) {
  return request<Tag.deleteTagResponseData>({
    url: `tag/delete/${tag_id}`,
    method: "delete"
  })
}
export function deleteLocationApi(id: number) {
  return request<Tag.deleteTagResponseData>({
    url: `camera-manage/delete_location/${id}`,
    method: "delete"
  })
}
export function deleteApplicationApi(id: number) {
  return request<Tag.deleteTagResponseData>({
    url: `camera-manage/delete_application/${id}`,
    method: "delete"
  })
}
/** 改 */
export function updateTagApi(tag_id: number, data: Tag.ICreateTagRequestData) {
  return request<Tag.updateTagResponseData>({
    url: `tag/update/${tag_id}`,
    method: "post",
    data
  })
}

/** 查 */
export function listTagApi() {
  return request<Tag.getTagResponseData>({
    url: `tag/list`,
    method: "get"
  })
}

// 导出yaml
export function exportTagApi(dataset_id: number) {
  return request({
    url: `tag/export/${dataset_id}`,
    method: "get"
  })
}

// 搜索tag
export function searchTagApi(data: string) {
  return request<Tag.getTagResponseData>({
    url: `tag/search`,
    method: "get",
    params: {
      tag_name: data
    }
  })
}

export function listLocationsApi() {
  return request<Tag.getTagResponseData>({
    url: `camera-manage/get_locations_applications`,
    method: "get"
  })
}
