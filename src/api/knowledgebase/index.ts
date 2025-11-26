import { request } from "@/utils/service"
import type * as KB from "./types/knowledgebase"

// 后端路由前缀：根据后端文档，采用 "/api/v1/knowlege-base" 作为前缀
const BASE = "/api/v1/knowlege-base"

// 获取文件信息统计
export function getKbInformationApi() {
  return request<KB.GetFileInformationResponseData>({
    url: `${BASE}/information`,
    method: "get"
  })
}

// 获取文件内容类型列表
export function getKbContentTypesApi() {
  return request<KB.GetFileContentTypeListResponseData>({
    url: `${BASE}/content_type`,
    method: "get"
  })
}

// 创建文件内容类型（POST + Query 参数 name）
export function createKbContentTypeApi(name: string) {
  return request<KB.CreateFileContentTypeResponseData>({
    url: `${BASE}/content_type`,
    method: "post",
    params: { name }
  })
}

// 删除文件内容类型
export function deleteKbContentTypeApi(name: string) {
  return request<KB.DeleteFileContentTypeResponseData>({
    url: `${BASE}/content_type/${encodeURIComponent(name)}`,
    method: "delete"
  })
}

// 上传文件（multipart/form-data）——字段需与 FileLibraryInForm 对齐
export function uploadKbFileApi(
  form: KB.FileLibraryInForm,
  file: File | Blob,
  onUploadProgress?: (e: ProgressEvent) => void
) {
  const formData = new FormData()
  formData.append("filename", form.filename)
  formData.append("content_type_name", form.content_type_name)
  formData.append("author", form.author)
  formData.append("abstract", form.abstract)
  formData.append("file", file)
  return request<KB.UploadFileResponseData>({
    url: `${BASE}`,
    method: "post",
    data: formData,
    onUploadProgress,
    timeout: 1000 * 60 * 10
  })
}

// 获取文件列表（分页）
export function listKbFilesApi(params: KB.FileLibraryQueryForm) {
  return request<KB.ListFilesResponseData>({
    url: `${BASE}/list`,
    method: "get",
    params
  })
}

// 下载/预览文件（返回 Blob）
export function downloadKbFileApi(id: number, onDownloadProgress?: (e: ProgressEvent) => void) {
  return request<Blob>({
    url: `${BASE}/download/${id}`,
    method: "get",
    responseType: "blob",
    onDownloadProgress
  })
}

// 根据ID获取文件信息
export function getKbFileByIdApi(id: number) {
  return request<KB.GetFileByIdResponseData>({
    url: `${BASE}/${id}`,
    method: "get"
  })
}

// 更新文件记录
export function updateKbFileApi(id: number, form: KB.FileLibraryUpdateForm) {
  return request<KB.UpdateFileResponseData>({
    url: `${BASE}/${id}`,
    method: "put",
    data: form
  })
}

// 删除文件
export function deleteKbFileApi(id: number) {
  return request<KB.DeleteFileByIdResponseData>({
    url: `${BASE}/${id}`,
    method: "delete"
  })
}
