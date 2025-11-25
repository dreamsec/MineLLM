// 知识库（文件库）类型与接口定义
// 依据后端 fasterapi 路由 router/knowlege_base.py 中的模型与路由，
// 在前端定义与其一一对应的请求参数与响应类型，统一使用 IApiResponseData。

export interface FileContentTypeModel {
  id?: number
  name: string
}

export interface FileInformationModel {
  FileCnt: number
  today_cnt: number
  read_cnt: number
}

export interface FileLibraryResponseModel {
  id: number
  filename: string
  filepath: string
  size: number
  mime_type: string
  abstract?: string | null
  cnt: number
  author: string
  create_time: string
  update_time: string
  content_type_id: number
}

// 上传文件（表单）——与后端 FileLibraryInForm 对齐
export interface FileLibraryInForm {
  filename: string
  content_type_name: string
  author: string
  abstract: string
}

// 更新文件（表单）——与后端 FileLibraryUpdateForm 对齐
export interface FileLibraryUpdateForm {
  filename?: string
  content_type_id?: number
  filepath?: string
  abstract?: string
}

// 列表查询参数——与后端 FileLibraryQueryForm 对齐
export interface FileLibraryQueryForm {
  content_type_name?: string
  page?: number
  page_size?: number
}

// 列表分页响应
export type ListFilesResponseData = IApiResponseData<{
  total: number
  list: FileLibraryResponseModel[]
}>

export type GetFileInformationResponseData = IApiResponseData<FileInformationModel>
export type GetFileContentTypeListResponseData = IApiResponseData<FileContentTypeModel[]>
export type CreateFileContentTypeResponseData = IApiResponseData<string>
export type DeleteFileContentTypeResponseData = IApiResponseData<boolean>
export type UploadFileResponseData = IApiResponseData<FileLibraryResponseModel>
export type GetFileByIdResponseData = IApiResponseData<FileLibraryResponseModel>
export type UpdateFileResponseData = IApiResponseData<FileLibraryResponseModel>
export type DeleteFileByIdResponseData = IApiResponseData<boolean>

