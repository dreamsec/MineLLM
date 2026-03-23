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

  // �������û�� Token���Զ�ʹ�� admin/123456 ���к�̨��¼
  if (!getToken()) {
    try {
      await userStore.login({ username: "admin", password: "123456" })
      // ��¼�ɹ���ǿ����ת��Ƥ����ҳ��
      if (to.path === '/login' || to.path === '/' ) {
        next({ path: "/dashboard/yunshu", replace: true })
      } else {
        next({ ...to, replace: true })
      }
      return
    } catch (err: any) {
      ElMessage.error(err.message || "�Զ���¼ʧ��")
      NProgress.done()
    }
  }

  // �ߵ�����˵���Ѿ��� Token ��
  if (to.path === "/login" || to.path === "/" ) {
    next({ path: "/dashboard/yunshu" })
    NProgress.done()
  } else {
    // ����Ƿ��н�ɫ
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

        if (to.path === '/' ) {
          next({ path: '/dashboard/yunshu', replace: true })
        } else {
          next({ ...to, replace: true })
        }
      } catch (err: any) {
        userStore.resetToken && userStore.resetToken()
        ElMessage.error(err.message || "·���������̷�������")
        next("/login")
        NProgress.done()
      }
    } else {
      if (to.path === '/' ) {
        next({ path: '/dashboard/yunshu' })
      } else {
        next()
      }
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
