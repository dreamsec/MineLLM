export interface IWeightsData {
  weightsName: string
  weightsFunction: string
  weightsDatetime: string
  weightsID: string
  user_id: number
  dataset_name: string
  weightsDataset: string
}

export interface ISwitchRoleRequestData {
  switchWeightsID: string
  user_id: string
}

export interface ICurrentRequestData {
  switchWeightsID: string
}

export type GetEnableWeightsResponseData = IApiResponseData<{ list: IWeightsData[] }>

export type GetCurrentWeightsResponseData = IApiResponseData<IWeightsData>

export type SwitchWeightsResponseData = IApiResponseData<IWeightsData>
