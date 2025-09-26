import { request, request2 } from "@/utils/service"
import type * as Login from "./types/login"

// /** 获取登录验证码 */
// export function getLoginCodeApi() {
//   return request<Login.LoginCodeResponseData>({
//     url: "auth/login/captcha",
//     // url: "login/code",
//     method: "get"
//   })
// }

/** 登录并返回 Token */
export function loginApi(data: Login.ILoginRequestData) {
  return request<Login.LoginResponseData>({
    url: "/api/v1/auth/login",
    // url: "users/login",
    method: "post",
    data
  })
}

// 创建第二个后端的登录API函数
export function loginApi2(data: Login.ILoginRequestData) {
  return request2<Login.LoginResponseData>({
    url: "/auth/user/login", // 根据实际情况修改第二个后端的登录接口
    method: "post",
    data
  })
}

/** 获取用户详情 */
export function getUserInfoApi() {
  return request<Login.UserInfoResponseData>({
    url: "/api/v1/auth/me",
    // url: "users/info",
    method: "get"
  })
}
