/** 统一处理 Cookie */

import CacheKey from "@/constants/cacheKey"
import Cookies from "js-cookie"

export const getToken = () => {
  return Cookies.get(CacheKey.TOKEN)
}

export const setToken = (token: string) => {
  Cookies.set(CacheKey.TOKEN, token)
}

export const removeToken = () => {
  Cookies.remove(CacheKey.TOKEN)
}

// 添加第二个后端的Token操作函数
export const getToken2 = () => {
  return Cookies.get(CacheKey.TOKEN2)
}

export const setToken2 = (token: string) => {
  Cookies.set(CacheKey.TOKEN2, token)
}

export const removeToken2 = () => {
  Cookies.remove(CacheKey.TOKEN2)
}
