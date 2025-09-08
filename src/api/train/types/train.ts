export interface IWeightsData {
  WeightsName: string
  WeightsID: string
}

export interface IModelsData {
  ModelName: string
  ModelID: string
  user_id: number
}

export interface IDatasetsData {
  DatasetsName: string
  DatasetsID: string
  user_id: number
  dataset_id: string
  dataset_name: string
}

export interface IYamlsData {
  YamlsName: string
  YamlsID: string
}

export interface IallData {
  model: string
  dataset: string
  weight: string
}

export interface ILogData {
  Log: string
}

export interface ItrainRequestData {
  model_id: string
}

export interface ISwitchtrainRequestData {
  WeightID: any
  ModelID: string
  DatasetID: string
  YamlName: string
  WeightName: string
  Epoch: string
  user_id: string
  create_way: string
}

export interface ISwitchDatasetRequestData {
  DatasetID: string
}

export interface IpublishweightRequestData {
  WeightID: any
  selectcamera: any
}

export interface IselectcameraRequestData {
  WeightID: any
}

export interface IcameraRequestData {
  location_id: string
}

export interface IlistareaRequestData {
  locationID: string
  locationName: string
}

export interface IlistcameraRequestData {
  cameraID: string
  cameraName: string
}

export interface IDataTrainRequestData {
  dataset_id: string
}

export type GetEnableallResponseData = IApiResponseData<{ list: IallData[] }>

export type GetEnableModelResponseData = IApiResponseData<{ list: IModelsData[] }>

export type SwitchWeightsResponseData = IApiResponseData<{ list: ILogData[] }>

export type SwitchDatasetsResponseData = IApiResponseData<{ list: IYamlsData[] }>

export type ListareaResponseData = IApiResponseData<{ list: IlistareaRequestData[] }>

export type ListcameraResponseData = IApiResponseData<{ list: IlistcameraRequestData[] }>

export type deleteModelResponseData = IApiResponseData<string>

export type publishModelResponseData = IApiResponseData<string>

export type DataTrainResponseData = IApiResponseData<string>

// 进度查询类型（后端已返回通用结构，客户端可用 any 兜底）
