import { request } from "@/utils/service"
import  type * as AI from "./types/ai.ts"
import {getToken} from "@/utils/cache/cookies.ts";
import type {GetNewChatSessionIdResponseData, newChatSessionIdRequestData} from "./types/ai.ts";

/** 获取AI回复 */
export function getAiResponse(data: AI.RequestData) {
  return fetch(`${import.meta.env.VITE_BASE_API}/api/v1/chat/stream`,{
    method: "post",
    headers:{ "Content-Type": "application/json" ,
      'Authorization': "Bearer "+getToken(),
    },
    body:JSON.stringify(data),
  })
}

export function newChatSessionId(params:newChatSessionIdRequestData) {
  return request<AI.GetNewChatSessionIdResponseData>({
    url: `/api/v1/chat/new_session`,
    method: "post",
    data:params
  })
}

export function getChatSessionList() {
  return request<AI.GetChatSessionListResponse>({
    url: `/api/v1/chat/list_sessions`,
    method: "get",
  })
}

/** 获取会话消息 */
export function getChatSessionMessages(sessionId: string) {
  return request<AI.GetChatSessionMessagesResponse>({
    url: `/api/v1/chat/get_session_history`,
    method: "get",
    params: { session_id: sessionId }
  })
}

/** 删除会话 */
export function deleteChatSession(sessionId: string) {
  return request({
    url: `/api/v1/chat/delete_session`,
    method: "delete",
    params:  { session_id: sessionId }
  })
}
