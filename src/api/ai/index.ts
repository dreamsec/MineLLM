import { request } from "@/utils/service"
import  type * as AI from "./types/ai.ts"
import {getToken} from "@/utils/cache/cookies.ts";
import type { newChatSessionIdRequestData } from "./types/ai.ts";
import type { AxiosProgressEvent } from "axios";

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

/** 获取使用统计 */
export function getUsageSummary() {
  return request<AI.GetUsageSummaryResponse>({
    url: `/api/v1/chat/usage_summary`,
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
  return request<IApiResponseData<null>>({
    url: `/api/v1/chat/delete_session`,
    method: "delete",
    params:  { session_id: sessionId }
  })
}

/** 上传临时文档到当前会话（multipart/form-data） */
export function uploadTempDocApi(
  sessionId: string,
  file: File,
  onUploadProgress?: (e: AxiosProgressEvent) => void
) {
  const formData = new FormData()
  formData.append("session_id", sessionId)
  formData.append("file", file)
  return request<IApiResponseData<AI.UploadDocResponseData>>({
    url: `/api/v1/chat/upload_doc`,
    method: "post",
    data: formData,
    onUploadProgress,
    timeout: 1000 * 60 * 10 // 10 分钟超时，适配大文件上传
  })
}

/** 移除会话中的临时文档 */
export function removeTempDocApi(sessionId: string, filename: string) {
  return request<IApiResponseData<null>>({
    url: `/api/v1/chat/remove_doc`,
    method: "delete",
    params: { session_id: sessionId, filename }
  })
}

/** 大模型主界面语音输入：上传录音并转写为文字 */
export function transcribeAudioApi(file: Blob, options?: { language?: string; hotwords?: string }) {
  const formData = new FormData()
  formData.append("file", file, getVoiceAudioFileName(file))
  formData.append("language", options?.language || "zh")
  if (options?.hotwords) {
    formData.append("hotwords", options.hotwords)
  }

  return request<AI.TranscribeAudioResponse>({
    url: `/api/v1/chat/transcribe`,
    method: "post",
    data: formData,
    timeout: 1000 * 60 * 2
  })
}

function getVoiceAudioFileName(file: Blob) {
  if (file.type.includes("mp4")) return "voice-input.m4a"
  if (file.type.includes("wav")) return "voice-input.wav"
  if (file.type.includes("ogg")) return "voice-input.ogg"
  return "voice-input.webm"
}
