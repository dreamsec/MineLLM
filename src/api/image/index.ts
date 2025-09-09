import { request } from "@/utils/service"

/** 查 */
export function listImageApi(dataset_id: number, page: number, page_size: number, is_train: number, is_label: number) {
  return request({
    url: `image/list/${dataset_id}`,
    method: "get",
    params: {
      page: page,
      per_page: page_size,
      is_train: is_train,
      is_label: is_label
    }
  })
}

// 更新图片状态
export function updateImageApi(image_id: number, is_labeled: number) {
  return request({
    url: `image/update/${image_id}/${is_labeled}`,
    method: "post"
  })
}

// 数量统计
export function countImageApi(dataset_id: number) {
  return request({
    url: `image/count/${dataset_id}`,
    method: "get"
  })
}

// 删除图片
export function deleteImageApi(image_id: number) {
  return request({
    url: `image/delete/${image_id}`,
    method: "delete"
  })
}
