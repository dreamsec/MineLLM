import router from "@/router"
import { useUserStoreHook } from "@/store/modules/user"
import { usePermissionStoreHook } from "@/store/modules/permission"
import { ElMessage } from "element-plus"
import { whiteList } from "@/config/white-list"
import { getToken } from "@/utils/cache/cookies"
import asyncRouteSettings from "@/config/async-route"
import NProgress from "nprogress"
import "nprogress/nprogress.css"

NProgress.configure({ showSpinner: false })

router.beforeEach(async (to, _from, next) => {
  NProgress.start()
  const userStore = useUserStoreHook()
  const permissionStore = usePermissionStoreHook()

  // 没有 Token：白名单放行，否则跳转登录页
  if (!getToken()) {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
    NProgress.done()
    return
  }

  // 已经登录，不允许访问登录页
  if (to.path === "/login" || to.path === "/") {
    next({ path: "/dashboard/yunshu" })
    NProgress.done()
    return
  }

  // 判断是否有角色
  if (userStore.roles.length === 0) {
    try {
      if (asyncRouteSettings.open) {
        await userStore.getInfo()
        const roles = userStore.roles
        permissionStore.setRoutes(roles)
      } else {
        userStore.setRoles(asyncRouteSettings.defaultRoles)
        permissionStore.setRoutes(asyncRouteSettings.defaultRoles)
      }

      permissionStore.dynamicRoutes.forEach((route) => {
        router.addRoute(route)
      })

      if (to.path === "/") {
        next({ path: "/dashboard/yunshu", replace: true })
      } else {
        next({ ...to, replace: true })
      }
    } catch (err: any) {
      userStore.resetToken && userStore.resetToken()
      ElMessage.error(err.message || "路由守卫过程发生错误")
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  } else {
    if (to.path === "/") {
      next({ path: "/dashboard/yunshu" })
    } else {
      next()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
