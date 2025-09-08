import { request } from "@/utils/service"
import type * as Table from "./types/data"
// import {createDataTypeResponseData, IDatasetType, IGetAllTableRequestData, IModifyDatasetType} from "./types/data";

export function deleteDataTypeApi(dataset_type:string) {
  return request<Table.deleteTableResponseData>({
    url: `data/delete_dataset_type/${dataset_type}`,
    method: "delete"
  })
}


/** 删 */
export function deleteTableDataApi(id: string) {
  return request<Table.deleteTableResponseData>({
    url: `data/delete/${id}`,
    method: "delete"
  })
}

/** 查 */
export function getTableDataApi(params: Table.IGetTableRequestData) {
  return request<Table.GetTableResponseData>({
    url: "data/list",
    // url: "table",
    method: "get",
    params
  })
}

export function getTableDatanameApi() {
  return request<Table.GetTableResponseData>({
    url: "data/list_data_name",
    // url: "table",
    method: "get"
  })
}

/** 查 */
export function getTableDatapathApi(params: Table.IdatasetpathRequestData) {
  return request<Table.GETdatasetpathResponseData>({
    url: "data/list_dataset_path",
    // url: "table",
    method: "post",
    params
  })
}

export function getTableApi(params: Table.IGetAllTableRequestData) {
  return request<Table.GetTableResponseData>({
    url: "data/list_all",
    method: "get",
    params
  })
}

export function createDatasetTypeApi(params: Table.IDatasetType) {
  return request<Table.createDataTypeResponseData>({
    url: `data/creat_dataset_type`,
    method: "get",
    params
  })
}

export function modifyDatasetApi(params: Table.IModifyDatasetType) {
  return request<Table.createDataTypeResponseData>({
    url: `data/modify`,
    method: "get",
    params
  })
}
