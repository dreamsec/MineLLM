export interface ICreateTagRequestData {
  tag_name: string
  tag_color: string
}
export interface ICreateLocationRequestData {
  location:string
}
export interface ICreateApplicationRequestData {
  application: string
}

export type GetTableResponseData = IApiResponseData<{
  list: ICreateTagRequestData[]
  total: number
}>

export type addTagResponseData = IApiResponseData<string>
export type deleteTagResponseData = IApiResponseData<string>
export type getTagResponseData = IApiResponseData<string>
export type updateTagResponseData = IApiResponseData<string>

