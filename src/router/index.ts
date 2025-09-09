import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: () => import('../layouts/MainLayout.vue'),
    meta: {
      hidden: true
    },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/Redirect/index.vue")
      }
    ]
  },
  {
    path: "/403",
    component: () => import("@/views/error-page/403.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/404",
    component: () => import("@/views/error-page/404.vue"),
    meta: {
      hidden: true
    },
    alias: "/:pathMatch(.*)*"
  },
  {
    path: "/login",
    component: () => import("@/views/Login/index.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/register",
    component: () => import("@/views/Register/index.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    redirect: '/dashboard/home',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard/index.vue'),
        meta: { title: '首页大屏', icon: 'Monitor' },
        children: [
          {
            path: 'home',
            name: 'Home',
            component: () => import('../views/Home/index.vue'),
            meta: { title: '首页', icon: 'Monitor', hideInMenu: true },
          },
          {
            path: 'tisheng',
            name: 'Tisheng',
            component: () => import('../views/Dashboard/tisheng/index.vue'),
            meta: {
              title: '提升机',
              hideInMenu: true,
            },
          },
          {
            path: 'yafeng',
            name: 'Yafeng',
            component: () => import('../views/Dashboard/yafeng/index.vue'),
            meta: {
              title: '压风机',
              hideInMenu: true,
            },
          },
          {
            path: 'tongfeng',
            name: 'Tongfeng',
            component: () => import('../views/Dashboard/tongfeng/index.vue'),
            meta: {
              title: '通风机',
              hideInMenu: true,
            },
          },
          {
            path: 'paishui',
            name: 'Paishui',
            component: () => import('../views/Dashboard/paishui/index.vue'),
            meta: {
              title: '排水机',
              hideInMenu: true,
            },
          },
          {
            path: 'yunshu',
            name: 'Yunshu',
            component: () => import('../views/Dashboard/yunshu/index.vue'),
            meta: {
              title: '运输机',
              hideInMenu: true,
            },
          },
        ],
      },
      // {
      //   path: '/monitor',
      //   name: 'Monitor',
      //   component: () => import('../views/Monitoring/index.vue'),
      //   meta: { title: '实时监控', icon: 'View' },
      // },
      {
        path: '/gis',
        name: 'GIS',
        component: () => import('../views/GIS/index.vue'),
        meta: { title: 'GIS一张图', icon: 'Picture' },
      },
      {
        path: '/qa',
        name: 'QA',
        component: () => import('../views/AIQA/index.vue'),
        meta: { title: '大模型问答', icon: 'ChatDotRound' }
      },
      {
        path: '/ai-diagnosis',
        name: 'AIDiagnosis',
        component: () => import('../views/AIDiagnosis/index.vue'),
        meta: { title: 'AI智能体', icon: 'Connection' },
        children: [
          {
            path: "data_manage",
            component: () => import("@/views/AIDiagnosis/data_manage/DataManage.vue"),
            name: "data_manage",
            meta: {
              title: "数据管理",
              svgIcon: "data",
              hideInMenu: true
            }
          },
          {
            path: "model_manage",
            component: () => import("@/views/AIDiagnosis/model_manage/index.vue"),
            name: "model_manage",
            meta: {
              title: "模型管理",
              svgIcon: "model2",
              hideInMenu: true
            }
          },
          {
            path: "model_detect",
            component: () => import("@/views/AIDiagnosis/model_detect/index.vue"),
            name: "model_detect",
            meta: {
              title: "模型校验",
              svgIcon: "test",
              hideInMenu: true
            }
          },
          {
            path: "train",
            name: "train",
            component: () => import("@/views/AIDiagnosis/model_manage/data_train.vue"),
            meta: {
              hideInMenu: true
            }
          }
        ]
      },
      {
        path: "/label",
        component: () => import("@/views/AIDiagnosis/label/index.vue"),
        meta: {
          hideInMenu: true
        }
      },
      {
        path: '/knowledge',
        name: 'Knowledge',
        component: () => import('../views/Knowledge/index.vue'),
        meta: { title: '知识库管理', icon: 'Files' }
      },
      {
        path: '/devices',
        name: 'Devices',
        component: () => import('../views/Devices/index.vue'),
        meta: { title: '设备管理', icon: 'Setting' }
      },
      {
        path: '/ins',
        name: 'Inspection',
        component: () => import('../views/Inspection/index.vue'),
        meta: { title: '虚拟巡检', icon: 'ChatDotRound' }
      },
      {
        path: '/system',
        name: 'System',
        component: () => import('../views/System/index.vue'),
        meta: { title: '系统管理', icon: 'Tools' },
        children: [
          {
            path: 'users',
            name: 'UserManagement',
            component: () => import('../views/System/Users.vue'),
            meta: {
              title: '用户管理',
              icon: 'user',
              hideInMenu: true,
            },
          },
          {
            path: 'roles',
            name: 'RoleManagement',
            component: () => import('../views/System/Roles.vue'),
            meta: {
              title: '角色管理',
              icon: 'role',
              hideInMenu: true,
            },
          },
          {
            path: 'permissions',
            name: 'PermissionManagement',
            component: () => import('../views/System/Permissions.vue'),
            meta: {
              title: '权限管理',
              icon: 'permission',
              hideInMenu: true,
            },
          },
        ],
      }
    ]
  }]
export const asyncRoutes: RouteRecordRaw[] = []

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes
})

/** 重置路由 */
export function resetRouter() {
  // 注意：所有动态路由路由必须带有 Name 属性，否则可能会不能完全重置干净
  try {
    router.getRoutes().forEach((route) => {
      const { name, meta } = route
      if (name && meta.roles?.length) {
        router.hasRoute(name) && router.removeRoute(name)
      }
    })
  } catch (error) {
    // 强制刷新浏览器也行，只是交互体验不是很好
    window.location.reload()
  }
}

export default router
