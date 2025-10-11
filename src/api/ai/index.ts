import { request } from "@/utils/service"
import  type * as AI from "./types/ai.ts"
import {getToken} from "@/utils/cache/cookies.ts";
import type {GetNewChatSessionIdResponseData, newChatSessionIdRequestData} from "./types/ai.ts";

/** 获取AI回复 */
export function getAiResponse(data: AI.RequestData) {
  return fetch(`${import.meta.env.VITE_BASE_API}/chat/stream`,{
    method: "post",
    headers:{ "Content-Type": "application/json" ,
      'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc1ODE5MDMyMn0.WDtXOzy8zGKNuCdhNsYTmw8silMcLXnspHlCwJDbYTU",
    },
    body:JSON.stringify(data),
  })
}

export function newChatSessionId(params:newChatSessionIdRequestData) {
  return request<AI.GetNewChatSessionIdResponseData>({
    url: `chat/new`,
    method: "post",
    data:params
  })
}
