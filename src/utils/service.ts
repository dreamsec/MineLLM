import axios, {type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { ElMessage, ElNotification } from "element-plus"
import { get } from "lodash-es"
import { getToken, getToken2, removeToken, removeToken2 } from "./cache/cookies"

/** 创建请求实例 */
type AppAxiosRequestConfig = AxiosRequestConfig & {
  silent?: boolean
}

function isSilentRequest(config?: AxiosRequestConfig) {
  return Boolean((config as AppAxiosRequestConfig | undefined)?.silent)
}

function createService(baseURL?: string) {
  // 创建一个 Axios 实例
  const service = axios.create({
    baseURL // 使用传入的 baseURL
  })
  // 请求拦截
  service.interceptors.request.use(
    (config) => config,
    // 发送失败
    (error) => Promise.reject(error)
  )
  // 响应拦截（可根据具体业务作出相应的调整）
  service.interceptors.response.use(
    (response) => {
      const apiData = response.data as any
      const code = apiData?.code
      const silent = isSilentRequest(response.config)
      // 兼容无 code 的 RESTful 响应：直接返回 data（例如部分更新接口仅以 HTTP 200 表示成功）
      if (code === undefined) {
        return response.data
      } else {
        switch (code) {
          case 0:
            return apiData
          case 1:
            return apiData
          case 200:
            if (!silent) ElMessage.success(apiData.message || "Success")
            return apiData
          case 201:
            if (!silent) ElMessage.error(apiData.message || "Error")
            return apiData
          case 202:
            if (!silent) ElMessage.warning(apiData.message || "Warning")
            return apiData
          case 203:
            if (!silent) ElMessage.info(apiData.message || "Info")
            return apiData
          case 204:
            if (!silent) ElNotification.success(apiData.message || "Success")
            return apiData
          case 205:
            if (!silent) ElNotification.error(apiData.message || "Error")
            return apiData
          case 206:
            if (!silent) ElNotification.warning(apiData.message || "Warning")
            return apiData
          case 207:
            if (!silent) ElNotification.info(apiData.message || "Info")
            return apiData
          default:
            // 不是正确的 Code
            if (!silent) ElMessage.error(apiData.message || "Error")
            return Promise.reject(new Error("Error"))
        }
      }
    },
    (error) => {
      const silent = isSilentRequest(error.config)
      // Status 是 HTTP 状态码
      const status = get(error, "response.status")
      switch (status) {
        case 400:
          error.message = "请求错误"
          break
        case 401:
          // 登录接口返回 401 说明密码错误，直接返回错误即可
          if (error.config?.url?.includes('login')) {
            error.message = error.response?.data?.message || error.response?.data?.detail || "用户名或密码错误"
            break
          }
          // 非登录接口的 401 才是 Token 过期
          removeToken()
          removeToken2()
          location.reload()
          break
        case 403:
          error.message = "拒绝访问"
          break
        case 404:
          error.message = "请求地址出错"
          break
        case 408:
          error.message = "请求超时"
          break
        case 500:
          error.message = "服务器内部错误"
          break
        case 501:
          error.message = "服务未实现"
          break
        case 502:
          error.message = "网关错误"
          break
        case 503:
          error.message = "服务不可用"
          break
        case 504:
          error.message = "网关超时"
          break
        case 505:
          error.message = "HTTP 版本不受支持"
          break
        default:
          break
      }
      if (!silent) ElMessage.error(error.message)
      return Promise.reject(error)
    }
  )
  return service
}

/** 创建请求方法 */
function createRequestFunction(service: AxiosInstance, useSecondToken: boolean = false) {
  return function <T>(config: AppAxiosRequestConfig): Promise<T> {
    const method = String(config.method || 'get').toLowerCase()
    const isFormData = typeof FormData !== "undefined" && (config.data instanceof FormData)
    const headers: Record<string, any> = {
      Authorization: config.url?.includes('login') ? undefined : "Bearer " + (useSecondToken ? getToken2() : getToken()),
    }
    // 仅在需要时设置 Content-Type：POST/PUT/PATCH 且非 FormData
    if ((method === 'post' || method === 'put' || method === 'patch') && !isFormData) {
      headers["Content-Type"] = get(config, "headers.Content-Type", "application/json")
    }
    const configDefault = {
      headers,
      timeout: get(config, "timeout", 1000000),
      data: {}
    }
    return service(Object.assign(configDefault, config))
  }
}

/** 用于第一个后端网络请求的实例 */
export const service = createService(import.meta.env.VITE_BASE_API)
/** 用于第一个后端网络请求的方法 */
export const request = createRequestFunction(service)

/** 用于第二个后端网络请求的实例 */
export const service2 = createService(import.meta.env.VITE_SECOND_API)
/** 用于第二个后端网络请求的方法 */
export const request2 = createRequestFunction(service2, true)  // 指定使用第二个Token
