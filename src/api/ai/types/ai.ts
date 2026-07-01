//请求参数
import type {IGetTableData} from "@/api/data/types/data.ts";
import type { ChatType } from "@/utils/chatType";

export interface RequestData {
  session_id: string
  content: string
  chat_type?: ChatType
  message?:  message
  history?: [HistoryMessage]
}
interface message {
  session_id: string
  role?: string
  model_type?: string
  content: string
  is_first?: boolean
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
  // SSE 中 normal 事件是字符串，tool 事件是对象，结束事件可能为空。
  data: string | Record<string, unknown> | null
  message: string
  data_type: string
  done: boolean
}

// 新建会话请求参数
export interface newChatSessionIdRequestData {
  model_name: string
  title: string
  chat_type?: ChatType
}

// 新建会话返回参数
export interface newChatSessionIdResponseData {
  id:string
  session_id: string
  model_name: string
  chat_type?: ChatType
  title: string
  status:boolean
  created_at:string
  updated_at:string
}

//历史会话响应参数
export interface GetChatSessionListResponseData {
  id: number
  session_id: string
  title: string
  model_name: string
  chat_type?: ChatType
  status: number
  created_at: string
  updated_at: string
  summary?: string        // 对话摘要（核心主题一句话概述）
  keywords?: string[]     // 关键词标签列表
  message_count?: number  // 消息条数
}
export type GetChatSessionListResponse = IApiResponseData<GetChatSessionListResponseData[]>

export type GetNewChatSessionIdResponseData = IApiResponseData<newChatSessionIdResponseData>

// 会话消息响应参数
export interface ChatMessageData {
  id?: number | string;
  session_id: string;
  role: string;
  content: string | null;
  tool_calls?: Array<{
    index?: number;
    id: string;
    type?: string;
    function: {
      name: string;
      arguments?: string;
    };
  }> | null;
  tool_call_id?: string | null;
  // 历史工具消息会把图表等结构化数据放在这里，前端据此恢复工具渲染。
  tool_data?: string | Record<string, unknown> | null;
  created_at?: string;
}

export type GetChatSessionMessagesResponse = IApiResponseData<ChatMessageData[]>

// 上传临时文档响应
export interface UploadDocResponseData {
  filename: string
  chunks: number
  session_id: string
}

// 使用统计响应参数
export interface UsageSummaryData {
  total_visits: number
  today_visits: number
  total_questions: number
  today_questions: number
  avg_response_time: number
  satisfaction: number
}

export type GetUsageSummaryResponse = IApiResponseData<UsageSummaryData>
