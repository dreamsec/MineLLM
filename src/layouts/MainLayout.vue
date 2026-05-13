<template>
  <div id="app">
    <el-container class="layout-container">
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <h2 class="logo">煤矿设备运维多模态大模型平台</h2>
        </div>
        <div class="header-right">
          <el-button type="warning" size="small" @click="showReportDialog = true">
            日报生成
          </el-button>
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="username">管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
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
          <router-view v-slot="{ Component }">
            <keep-alive :include="['TishengIndex', 'PaishuiIndex', 'TongfengIndex', 'YafengIndex', 'YunshuIndex']" :max="2">
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </el-main>
      </el-container>
    </el-container>

    <!-- 日报生成弹窗 -->
    <el-dialog
      v-model="showReportDialog"
      title="日报生成"
      width="450px"
      :close-on-click-modal="false"
    >
      <el-form label-width="80px">
        <el-form-item label="设备类型">
          <el-select v-model="selectedType" style="width: 100%">
            <el-option label="所有设备" value="" />
            <el-option
              v-for="t in EQUIPMENT_TYPES"
              :key="t"
              :label="t"
              :value="t"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="selectedType" label="设备编号">
          <el-select v-model="selectedCode" style="width: 100%">
            <el-option label="所有设备" value="" />
            <el-option
              v-for="c in currentTypeCodes"
              :key="c"
              :label="c"
              :value="c"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="报告日期">
          <el-date-picker
            v-model="reportDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReportDialog = false">取消</el-button>
        <el-button type="primary" :loading="downloading" @click="handleReportDownload">
          下载日报
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Fold, Expand } from '@element-plus/icons-vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStoreHook } from '@/store/modules/user'
import { exportDailyReportApi, exportAllDailyReportsApi, exportByTypeDailyReportsApi } from '@/api/device'


const router = useRouter()
const route = useRoute()

// 响应式状态
const isCollapse = ref(false)

// 日报生成弹窗
const EQUIPMENT_TYPES = ['提升机', '压风机', '通风机', '排水机', '运输机']
const EQUIPMENT_TYPE_MAP: Record<string, string[]> = {
  '提升机': ['TS001'],
  '压风机': ['YF001', 'YF002', 'YF003', 'YF004', 'YF005', 'YF006', 'YF007'],
  '通风机': ['TF001', 'TF002'],
  '排水机': ['PS001', 'PS002', 'PS003'],
  '运输机': ['YS001'],
}
const showReportDialog = ref(false)
const selectedType = ref('')
const selectedCode = ref('')
const reportDate = ref(new Date().toISOString().slice(0, 10))
const downloading = ref(false)

const currentTypeCodes = computed(() => {
  if (!selectedType.value) return []
  return EQUIPMENT_TYPE_MAP[selectedType.value] || []
})

function getReportFileName() {
  const date = reportDate.value
  if (!selectedType.value) {
    return `${date}_全部设备日报汇总.docx`
  }
  if (!selectedCode.value) {
    return `${date}_${selectedType.value}日报汇总.docx`
  }
  return `${selectedCode.value}_${date}_日报.docx`
}

async function handleReportDownload() {
  downloading.value = true
  try {
    let res: Blob
    if (!selectedType.value) {
      res = await exportAllDailyReportsApi(reportDate.value)
    } else if (!selectedCode.value) {
      res = await exportByTypeDailyReportsApi(selectedType.value, reportDate.value)
    } else {
      res = await exportDailyReportApi(selectedCode.value, reportDate.value)
    }
    const blob = res instanceof Blob ? res : new Blob([res])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = getReportFileName()
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('日报下载成功')
    showReportDialog.value = false
  } catch {
    ElMessage.error('日报下载失败，请稍后重试')
  } finally {
    downloading.value = false
  }
}

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

// 处理退出登录
const handleLogout = async () => {
  try {
    // 调用用户Store的logout方法执行退出登录
    useUserStoreHook().logout()
    // 退出登录后跳转到登录页面
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}
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

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
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
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100vh - 60px);
  padding-bottom: 30px;
}

/* 左侧菜单栏滚动条样式 */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
  transition: background 0.3s ease;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
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
