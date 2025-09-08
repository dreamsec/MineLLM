export interface ICreateTableRequestData {
  id: string
  dataset_name: string
  upload_datetime: string
  dataset_size: number
  dataset_tagged: number
  user_id: string
}

export interface IUpdateTableRequestData {
  id: string
  dataset_name: string
  upload_datetime: string
  dataset_size: number
  dataset_tagged: number
  user_id: string
}

export interface IGetTableRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
  /** 查询参数：用户名 */
  dataset_name?: string
  /** 查询参数：邮箱 */
  upload_datetime?: string
  role: string
}

export interface IGetAllTableRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
  dataset_type?: string
}

export interface IGetTableData {
  dataset_type: string
  id: string
  dataset_name: string
  upload_datetime: string
  dataset_size: number
  dataset_tagged: number
  user_id: string
  user_name: string
  tag: string
  is_trained: boolean
}

export interface ITableData {
  dataset_type: string;
  user_name: string;
  data: IGetTableData[];
}

export interface IDatasetType {
  dataset_type: string;
}

export interface IModifyDatasetType {
  type: string;
  name: string;
}


export interface IdatasetpathRequestData {
  dataset_name: string
  dataset_datetime: string
  dataset_id: string
  user_id: string
}

export interface IGETdatasetpathRequestData {
  dataset_path: string
  dataset_filename: string
}

export type GetTableResponseData = IApiResponseData<{
  list: IGetTableData[]
  total: number
}>


export type createTableResponseData = IApiResponseData<string>
export type deleteTableResponseData = IApiResponseData<string>
export type upDateTableResponseData = IApiResponseData<string>
export type GETdatasetpathResponseData = IApiResponseData<{ list: IGETdatasetpathRequestData }>
export type createDataTypeResponseData = IApiResponseData<string>
