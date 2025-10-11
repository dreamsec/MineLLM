//请求参数
import type {IGetTableData} from "@/api/data/types/data.ts";

export interface RequestData {
  message:  message
  history?: [HistoryMessage]
}
interface message {
  session_id: string
  role: string
  model_type: string
  content: string
  is_first: boolean
  tool_calls?:  [additionalProp1]
  tool_call_id?: string
  parent_message_id?:  number
}

interface HistoryMessage extends message {
  id: string
}

interface additionalProp1 {
  index: number
  id:string
  function: {
    arguments: string
    name: string
  }
  type: string
}
//响应参数
export interface ResponseData {
  code: number
  data: string
  message: string
  data_type: string
  done: boolean
}

// 新建会话请求参数
export interface newChatSessionIdRequestData {
  model_name: string
}

// 新建会话返回参数
export interface newChatSessionIdResponseData {
  id:string
  session_id: string
  model_name: string
  title: string
  status:boolean
  created_at:string
  updated_at:string
}

export type GetNewChatSessionIdResponseData = IApiResponseData<newChatSessionIdResponseData>
