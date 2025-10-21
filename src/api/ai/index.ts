import { request } from "@/utils/service"
import  type * as AI from "./types/ai.ts"
import {getToken} from "@/utils/cache/cookies.ts";
import type {GetNewChatSessionIdResponseData, newChatSessionIdRequestData} from "./types/ai.ts";

/** 获取AI回复 */
export function getAiResponse(data: AI.RequestData) {
  return fetch(`${import.meta.env.VITE_BASE_API}/api/v1/chat/stream`,{
    method: "post",
    headers:{ "Content-Type": "application/json" ,
      'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc2MTM5NDc5Nn0.428TAO5aYkfQa9bhuSAsQRMqyueI12N6pFyKENj_6jM",
    },
    body:JSON.stringify(data),
  })
}

export function newChatSessionId(params:newChatSessionIdRequestData) {
  return request<AI.GetNewChatSessionIdResponseData>({
    url: `/api/v1/chat/new`,
    method: "post",
    data:params
  })
}
