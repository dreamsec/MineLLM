import { request } from "@/utils/service"
import type * as User from "./types/user"

// 获取用户列表
export function getUsersApi(params: User.GetUsersRequestParams) {
  return request<User.GetUsersResponseData>({
    url: "/api/v1/auth/user/list",
    method: "GET",
    params
  })
}

// 创建用户
export function createUserApi(data: User.CreateUserRequestData) {
  return request<IApiResponseData<{ id: number ,username:string}>>({
    url: "/api/v1/auth/user",
    method: "POST",
    data
  })
}

// 更新用户
export function updateUserApi(userId: number, data: User.UpdateUserRequestData) {
  return request<IApiResponseData<string>>({
    url: `/api/v1/auth/user/${userId}`,
    method: "PUT",
    data
  })
}

// 删除用户
export function deleteUserApi(userId: number) {
  return request<IApiResponseData<string>>({
    url: `/api/v1/auth/user/${userId}`,
    method: "DELETE"
  })
}
