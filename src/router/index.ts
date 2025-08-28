import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../layouts/MainLayout.vue'),
      redirect: '/dashboard/tisheng',
      children: [
         {
            path: '/dashboard',
            name: 'Dashboard',
            component: () => import('../views/Dashboard/index.vue'),
            meta: { title: '首页大屏', icon: 'Monitor' },
            redirect: '/dashboard/tisheng',
            children: [
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
          {
            path: '/monitor',
            name: 'Monitor',
            component: () => import('../views/Monitoring/index.vue'),
            meta: { title: '实时监控', icon: 'View' },
          },
          {
            path: '/ai-diagnosis',
            name: 'AIDiagnosis',
            component: () => import('../views/AIDiagnosis/index.vue'),
            meta: { title: 'AI故障诊断中心', icon: 'Warning' }
          },
          {
            path: '/qa',
            name: 'QA',
            component: () => import('../views/AIQA/index.vue'),
            meta: { title: '智能问答', icon: 'ChatDotRound' }
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
    },

  ]
})

export default router
