<template>
  <div id="app">
    <el-container class="layout-container">
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <h2 class="logo">煤矿提升机智能运维大模型</h2>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="username">管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人信息</el-dropdown-item>
                <el-dropdown-item>修改密码</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-container>
        <!-- 左侧菜单栏 -->
        <el-aside class="sidebar" :width="isCollapse ? '64px' : '170px'">
          <div class="sidebar-header">
            <el-button
              type="text"
              @click="toggleCollapse"
              class="collapse-btn"
            >
              <el-icon>
                <Fold v-if="!isCollapse" />
                <Expand v-else />
              </el-icon>
            </el-button>
          </div>

          <el-menu
            :default-active="activeMenu"
            class="sidebar-menu"
            :collapse="isCollapse"
            :collapse-transition="false"
            background-color="#ffffff"
            text-color="#333333"
            active-text-color="#409EFF"
            router
          >
            <template v-for="route in menuRoutes" :key="route.path">
              <!-- 有子菜单的情况 -->
              <el-sub-menu v-if="route.children && route.children.length > 0" :index="route.path">
                <template #title>
                  <el-icon>
                    <component :is="getIconComponent(String(route.meta?.icon || ''))" />
                  </el-icon>
                  <span>{{ route.meta?.title }}</span>
                </template>
                <el-menu-item
                  v-for="child in route.children?.filter((c: any) => c.meta?.title)"
                  :key="child.path"
                  :index="route.path + '/' + child.path"
                  @click="handleMenuClick({ path: route.path + '/' + child.path })"
                >
                  <template #title>{{ child.meta?.title }}</template>
                </el-menu-item>
              </el-sub-menu>

              <!-- 没有子菜单的情况 -->
              <el-menu-item
                v-else
                :index="route.path"
                @click="handleMenuClick(route)"
              >
                <el-icon>
                  <component :is="getIconComponent(String(route.meta?.icon || ''))" />
                </el-icon>
                <template #title>{{ route.meta?.title }}</template>
              </el-menu-item>
            </template>
          </el-menu>
        </el-aside>

        <!-- 主内容区 -->
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Fold, Expand } from '@element-plus/icons-vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 响应式状态
const isCollapse = ref(false)

// 菜单路由配置
const menuRoutes = computed(() => {
  return router.getRoutes().filter(route =>
    route.meta?.title &&
    !route.path.includes(':') &&
    !route.meta?.hideInMenu
  )
})

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 切换菜单折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 处理菜单点击
const handleMenuClick = (route: { path: string }) => {
  router.push(route.path)
}

// 获取图标组件
const getIconComponent = (iconName: string) => {
  const icons = ElementPlusIcons as Record<string, unknown>
  return icons[iconName] || ElementPlusIcons.Document
}

// 响应式处理
onMounted(() => {
  const handleResize = () => {
    if (window.innerWidth < 768) {
      isCollapse.value = true
    }
  }

  window.addEventListener('resize', handleResize)
  handleResize()
})
</script>


<style scoped>
.layout-container {
  height: 98vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
}

.header {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left .logo {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  background: linear-gradient(45deg, #fff, #e6f7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-right .user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.header-right .user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.username {
  margin-left: 8px;
  font-size: 14px;
  color: #ffffff;
}

.sidebar {
  background: #ffffff;
  transition: width 0.3s;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e5e7eb;
}

.collapse-btn {
  color: #333333;
  font-size: 18px;
}

.collapse-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.sidebar-menu {
  border: none;
  background-color: #ffffff;
}

.sidebar-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
  margin: 2px 1px;
  border-radius: 6px;
  transition: all 0.3s;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #f0f9ff !important;
  color: #1890ff !important;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #e6f7ff !important;
  color: #1890ff !important;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

/* 子菜单样式 */
.sidebar-menu .el-sub-menu {
  margin: 2px 1px;
  border-radius: 6px;
  overflow: hidden;
}

.sidebar-menu .el-sub-menu .el-sub-menu__title {
  height: 50px;
  line-height: 50px;
  border-radius: 6px;
  transition: all 0.3s;
}

.sidebar-menu .el-sub-menu .el-sub-menu__title:hover {
  background-color: #f0f9ff !important;
  color: #1890ff !important;
}

.sidebar-menu .el-sub-menu.is-active .el-sub-menu__title {
  background-color: #e6f7ff !important;
  color: #1890ff !important;
}

.sidebar-menu .el-sub-menu .el-menu-item {
  height: 45px;
  line-height: 45px;
  margin: 1px 8px;
  border-radius: 4px;
  background-color: #fafafa;
  font-size: 13px;
}

.sidebar-menu .el-sub-menu .el-menu-item:hover {
  background-color: #f0f9ff !important;
  color: #1890ff !important;
}

.sidebar-menu .el-sub-menu .el-menu-item.is-active {
  background-color: #e6f7ff !important;
  color: #1890ff !important;
  box-shadow: 0 1px 4px rgba(24, 144, 255, 0.2);
}

.main-content {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto; /* 保持主内容区域的滚动条 */
  height: calc(100vh - 60px); /* 设置主内容区域高度，减去header高度 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 1000;
    height: 100vh;
  }

  .main-content {
    margin-left: 0;
    padding: 15px;
  }

  .header .logo {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 0 15px;
  }

  .header .logo {
    font-size: 14px;
  }

  .main-content {
    padding: 10px;
  }
}
</style>
