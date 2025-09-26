import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"
import { usePermissionStore } from "./permission"
import { useTagsViewStore } from "./tags-view"
import router, { resetRouter } from "@/router"
import { loginApi, loginApi2, getUserInfoApi } from "@/api/login"  // 添加第二个后端的登录API
import { type ILoginRequestData } from "@/api/login/types/login"
import { registerApi } from "@/api/register"
import { type IRegisterRequestData } from "@/api/register/types/register"
import { type RouteRecordRaw } from "vue-router"
import asyncRouteSettings from "@/config/async-route"
// import { ISwitchRoleRequestData } from "@/api/switch-role/types/switch_role"
import { switchRoleApi } from "@/api/switch-role"
import { getToken, removeToken, setToken, getToken2, removeToken2, setToken2 } from "@/utils/cache/cookies"  // 修改导入



export const useUserStore = defineStore("user", () => {
  const token = ref<string>(getToken() || "")
  const token2 = ref<string>(getToken2() || "")  // 添加第二个Token
  const roles = ref<string[]>([])
  const username = ref<string>("")

  const permissionStore = usePermissionStore()
  const tagsViewStore = useTagsViewStore()

  /** 设置角色数组 */
  const setRoles = (value: string[]) => {
    roles.value = value
  }
  /** 登录 */
  const login = (loginData: ILoginRequestData) => {
    return new Promise((resolve, reject) => {
      // 同时调用两个后端的登录API
      Promise.all([
        loginApi(loginData),
        loginApi2(loginData)
      ])
        .then(([res1, res2]) => {
          // 保存两个后端的Token
          setToken(res1.data.access_token)
          setToken2(res2.data.access_token)
          token.value = res1.data.access_token
          token2.value = res2.data.access_token
          resolve(true)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }
  /** 注册 */
  const register = (registerData: IRegisterRequestData) => {
    return new Promise((resolve, reject) => {
      registerApi({
        email: registerData.email,
        username: registerData.username,
        password: registerData.password,
        confirm_password: registerData.confirm_password,
        captcha: registerData.captcha
      })
        .then(() => {
          router.push({ path: "/login" })
        })
        .catch((error) => {
          reject(error)
        })
    })
  }
  /** 获取用户详情 */
  const getInfo = () => {
    return new Promise((resolve, reject) => {
      getUserInfoApi()
        .then((res) => {
          const data = res.data
          username.value = data.username
          // 验证返回的 roles 是否是一个非空数组
          if (data.roles && data.roles.length > 0) {
            roles.value = data.roles
          } else {
            // 塞入一个没有任何作用的默认角色，不然路由守卫逻辑会无限循环
            roles.value = asyncRouteSettings.defaultRoles
          }
          resolve(res)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }
  /** 切换权限 */
  const changeRoles = async (SwitchRoleData: any) => {
    switchRoleApi({
      role: SwitchRoleData.role
    }).then((res) => {
      token.value = res.data.token
      roles.value = res.data.roles
      setToken(res.data.token)
      getInfo()
      permissionStore.setRoutes(roles.value)
      resetRouter()
      permissionStore.dynamicRoutes.forEach((item: RouteRecordRaw) => {
        router.addRoute(item)
      })
      _resetTagsView()
    })
  }
  // /** 切换角色 */
  // const changeRoles = async (role: string) => {
  //   const newToken = "token-" + role
  //   token.value = newToken
  //   setToken(newToken)
  //   await getInfo()
  //   permissionStore.setRoutes(roles.value)
  //   resetRouter()
  //   permissionStore.dynamicRoutes.forEach((item: RouteRecordRaw) => {
  //     router.addRoute(item)
  //   })
  //   _resetTagsView()
  // }
  /** 登出 */
  const logout = () => {
    removeToken()
    removeToken2()  // 同时移除两个Token
    token.value = ""
    token2.value = ""
    roles.value = []
    resetRouter()
    _resetTagsView()
  }
  /** 重置 Token */
  const resetToken = () => {
    removeToken()
    removeToken2()  // 同时重置两个Token
    token.value = ""
    token2.value = ""
    roles.value = []
  }
  /** 重置 visited views 和 cached views */
  const _resetTagsView = () => {
    tagsViewStore.delAllVisitedViews()
    tagsViewStore.delAllCachedViews()
  }

  return { token, token2, roles, username, setRoles, login, register, getInfo, changeRoles, logout, resetToken }
})

/** 在 setup 外使用 */
export function useUserStoreHook() {
  return useUserStore(store)
}
