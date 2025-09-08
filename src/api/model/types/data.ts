export interface ICreateModelRequestData {
  model_name: string
  model_type: string
  model_tips: string
}

export interface IUpdateModelRequestData {
  model_name: string
  model_type: string
  model_tips: string
  model_id: string
  user_id: string
}

export interface IGetModelRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
  /** 查询参数：用户名 */
  model_name?: string
  /** 查询参数：邮箱 */
  model_datetime?: string
}

export interface IGetModelData {
  id: string
  model_name: string
  model_type: string
  model_datetime: string
  model_path: string
  is_trained: number
  user_id: number
  user_name: string
  data_name: string
  children: any
  dataset_tagged: string
  dataset_size: string
}

export type GetModelResponseData = IApiResponseData<{
  list: IGetModelData[]
  total: number
}>
export type updateModelResponseData = IApiResponseData<string>
export type createModelResponseData = IApiResponseData<string>
export type deleteModelResponseData = IApiResponseData<string>
