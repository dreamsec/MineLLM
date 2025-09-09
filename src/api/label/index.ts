import { request } from "@/utils/service"
import type * as Label from "./types/label"

// 添加label
export const addLabelApi = (data: Label.ICreateLabelRequestData) => {
  return request({
    url: "/label/add",
    method: "post",
    data
  })
}

// 获取给定图片的所有label
export const listLabelApi = (image_id: number) => {
  return request({
    url: `/label/list/${image_id}`,
    method: "get"
  })
}

// 修改label
export const updateLabelApi = (label_id: number, data: Label.IUpdateLabelRequestData) => {
  return request({
    url: `/label/update/${label_id}`,
    method: "post",
    data
  })
}

// 删除label
export const deleteLabelApi = (label_id: number) => {
  return request({
    url: `/label/delete/${label_id}`,
    method: "delete"
  })
}

// 导出label到文件
export const exportLabelApi = (image_id: number) => {
  return request({
    url: `/label/export/${image_id}`,
    method: "get"
  })
}
