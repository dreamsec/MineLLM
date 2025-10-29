<template>
  <div class="permissions-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">权限管理</h1>
        <p class="page-subtitle">管理系统权限、访问控制和权限分配</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showAddPermissionModal = true">
          <span class="btn-icon">➕</span>
          添加权限
        </button>
      </div>
    </div>

    <!-- 权限统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">🔐</div>
        <div class="stat-content">
          <div class="stat-number">{{ totalPermissions }}</div>
          <div class="stat-label">总权限数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📁</div>
        <div class="stat-content">
          <div class="stat-number">{{ totalCategories }}</div>
          <div class="stat-label">权限分类</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <div class="stat-number">{{ activePermissions }}</div>
          <div class="stat-label">启用权限</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-content">
          <div class="stat-number">{{ systemPermissions }}</div>
          <div class="stat-label">系统权限</div>
        </div>
      </div>
    </div>

    <!-- 权限管理主体 -->
    <div class="permissions-container">
      <!-- 左侧权限分类 -->
      <div class="categories-panel">
        <div class="panel-header">
          <h3>权限分类</h3>
          <button class="btn btn-secondary" @click="showAddCategoryModal = true">
            <span class="btn-icon">➕</span>
          </button>
        </div>
        <div class="categories-list">
          <div
            v-for="category in categories"
            :key="category.id"
            class="category-item"
            :class="{ active: selectedCategory?.id === category.id }"
            @click="selectCategory(category)"
          >
            <div class="category-icon">{{ category.icon }}</div>
            <div class="category-info">
              <div class="category-name">{{ category.name }}</div>
              <div class="category-count">{{ category.permissionCount }} 个权限</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧权限列表 -->
      <div class="permissions-panel">
        <div class="panel-header">
          <h3>{{ selectedCategory?.name || '所有权限' }}</h3>
          <div class="panel-actions">
            <button class="btn btn-secondary" @click="refreshPermissions">
              <span class="btn-icon">🔄</span>
              刷新
            </button>
            <button class="btn btn-secondary" @click="exportPermissions">
              <span class="btn-icon">📤</span>
              导出
            </button>
          </div>
        </div>

        <div class="permissions-list">
          <div
            v-for="permission in filteredPermissions"
            :key="permission.id"
            class="permission-item"
            :class="{ active: selectedPermission?.id === permission.id }"
            @click="selectPermission(permission)"
          >
            <div class="permission-header">
              <div class="permission-icon">{{ permission.icon }}</div>
              <div class="permission-info">
                <div class="permission-name">{{ permission.name }}</div>
                <div class="permission-code">{{ permission.code }}</div>
              </div>
              <div class="permission-status" :class="permission.status">
                {{ getStatusText(permission.status) }}
              </div>
            </div>

            <div class="permission-description">
              {{ permission.description }}
            </div>

            <div class="permission-meta">
              <div class="meta-item">
                <span class="meta-label">类型</span>
                <span class="meta-value">{{ permission.type }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">角色数</span>
                <span class="meta-value">{{ permission.roleCount }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">创建时间</span>
                <span class="meta-value">{{ formatDate(permission.createdAt) }}</span>
              </div>
            </div>

            <div class="permission-actions">
              <button class="action-btn edit" @click.stop="editPermission(permission)" title="编辑">
                ✏️
              </button>
              <button class="action-btn view" @click.stop="viewPermission(permission)" title="查看">
                👁️
              </button>
              <button
                class="action-btn delete"
                @click.stop="deletePermission(permission)"
                title="删除"
                v-if="permission.id !== 1"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 权限详情面板 -->
      <div v-if="selectedPermission" class="detail-panel">
        <div class="panel-header">
          <h3>权限详情</h3>
          <button class="panel-close" @click="selectedPermission = null">✕</button>
        </div>

        <div class="panel-content">
          <div class="detail-section">
            <h4>基本信息</h4>
            <div class="detail-item">
              <span class="detail-label">权限名称</span>
              <span class="detail-value">{{ selectedPermission.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">权限代码</span>
              <span class="detail-value">{{ selectedPermission.code }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">权限描述</span>
              <span class="detail-value">{{ selectedPermission.description }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">权限类型</span>
              <span class="detail-value">{{ selectedPermission.type }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">状态</span>
              <span class="detail-value status-badge" :class="selectedPermission.status">
                {{ getStatusText(selectedPermission.status) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">创建时间</span>
              <span class="detail-value">{{ formatDate(selectedPermission.createdAt) }}</span>
            </div>
          </div>

          <div class="detail-section">
            <h4>分配角色</h4>
            <div class="roles-list">
              <div
                v-for="role in selectedPermission.roles"
                :key="role.id"
                class="role-item"
              >
                <div class="role-icon">{{ role.icon }}</div>
                <div class="role-info">
                  <div class="role-name">{{ role.name }}</div>
                  <div class="role-description">{{ role.description }}</div>
                </div>
                <div class="role-status" :class="role.status">
                  {{ getStatusText(role.status) }}
                </div>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>使用统计</h4>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">{{ selectedPermission.roleCount }}</div>
                <div class="stat-label">分配角色</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ selectedPermission.userCount }}</div>
                <div class="stat-label">影响用户</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ selectedPermission.accessCount }}</div>
                <div class="stat-label">访问次数</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑权限模态框 -->
    <div v-if="showAddPermissionModal || showEditPermissionModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showEditPermissionModal ? '编辑权限' : '添加权限' }}</h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <form @submit.prevent="savePermission" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label>权限名称</label>
              <input v-model="permissionForm.name" type="text" required />
            </div>
            <div class="form-group">
              <label>权限代码</label>
              <input v-model="permissionForm.code" type="text" required />
            </div>
          </div>
          <div class="form-group">
            <label>权限描述</label>
            <textarea v-model="permissionForm.description" rows="3" required></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>权限类型</label>
              <select v-model="permissionForm.type" required>
                <option value="system">系统权限</option>
                <option value="module">模块权限</option>
                <option value="function">功能权限</option>
                <option value="data">数据权限</option>
              </select>
            </div>
            <div class="form-group">
              <label>权限分类</label>
              <select v-model="permissionForm.categoryId" required>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>权限图标</label>
            <select v-model="permissionForm.icon" required>
              <option value="🔐">🔐 安全</option>
              <option value="👥">👥 用户</option>
              <option value="⚙️">⚙️ 系统</option>
              <option value="📊">📊 数据</option>
              <option value="🔧">🔧 工具</option>
              <option value="📁">📁 文件</option>
              <option value="📝">📝 文档</option>
              <option value="🔍">🔍 搜索</option>
            </select>
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="permissionForm.status" required>
              <option value="active">启用</option>
              <option value="disabled">禁用</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary">
              {{ showEditPermissionModal ? '保存' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 添加分类模态框 -->
    <div v-if="showAddCategoryModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>添加权限分类</h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <form @submit.prevent="saveCategory" class="modal-form">
          <div class="form-group">
            <label>分类名称</label>
            <input v-model="categoryForm.name" type="text" required />
          </div>
          <div class="form-group">
            <label>分类描述</label>
            <textarea v-model="categoryForm.description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>分类图标</label>
            <select v-model="categoryForm.icon" required>
              <option value="🔐">🔐 安全</option>
              <option value="👥">👥 用户</option>
              <option value="⚙️">⚙️ 系统</option>
              <option value="📊">📊 数据</option>
              <option value="🔧">🔧 工具</option>
              <option value="📁">📁 文件</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary">添加</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSystemStore } from '@/store/modules/systemStore'

//状态库
const systemStore = useSystemStore()

// 响应式数据
const showAddPermissionModal = ref(false)
const showEditPermissionModal = ref(false)
const showAddCategoryModal = ref(false)
const editingPermission = ref<any>(null)
const selectedPermission = ref<any>(null)
const selectedCategory = ref<any>(null)

// 权限表单
const permissionForm = ref({
  name: '',
  code: '',
  description: '',
  type: 'system',
  categoryId: 1,
  icon: '🔐',
  status: 'active'
})

// 分类表单
const categoryForm = ref({
  name: '',
  description: '',
  icon: '🔐'
})

// 权限分类
const categories = ref([
  {
    id: 1,
    name: '系统管理',
    description: '系统核心功能权限',
    icon: '⚙️',
    permissionCount: 4
  },
  {
    id: 2,
    name: '用户管理',
    description: '用户相关权限',
    icon: '👥',
    permissionCount: 3
  },
  {
    id: 3,
    name: '设备监控',
    description: '设备监控相关权限',
    icon: '📊',
    permissionCount: 5
  },
  {
    id: 4,
    name: '故障诊断',
    description: '故障诊断相关权限',
    icon: '🔧',
    permissionCount: 4
  },
  {
    id: 5,
    name: '数据管理',
    description: '数据相关权限',
    icon: '📁',
    permissionCount: 3
  }
])

// 权限数据
const permissions = ref([
  {
    id: 1,
    name: '用户管理',
    code: 'user:manage',
    description: '管理用户账户、权限分配',
    type: 'system',
    categoryId: 2,
    icon: '👥',
    status: 'active',
    roleCount: 2,
    userCount: 8,
    accessCount: 156,
    createdAt: new Date('2024-01-01T00:00:00'),
    roles: [
      { id: 1, name: '系统管理员', description: '拥有系统所有权限', icon: '👑', status: 'active' }
    ]
  },
  {
    id: 2,
    name: '角色管理',
    code: 'role:manage',
    description: '管理角色和权限分配',
    type: 'system',
    categoryId: 1,
    icon: '🔐',
    status: 'active',
    roleCount: 1,
    userCount: 2,
    accessCount: 45,
    createdAt: new Date('2024-01-01T00:00:00'),
    roles: [
      { id: 1, name: '系统管理员', description: '拥有系统所有权限', icon: '👑', status: 'active' }
    ]
  },
  {
    id: 3,
    name: '设备监控',
    code: 'device:monitor',
    description: '查看设备运行状态和监控数据',
    type: 'module',
    categoryId: 3,
    icon: '📊',
    status: 'active',
    roleCount: 3,
    userCount: 12,
    accessCount: 289,
    createdAt: new Date('2024-01-05T00:00:00'),
    roles: [
      { id: 1, name: '系统管理员', description: '拥有系统所有权限', icon: '👑', status: 'active' },
      { id: 2, name: '操作员', description: '负责日常设备监控', icon: '⚙️', status: 'active' },
      { id: 3, name: '观察员', description: '只能查看系统状态', icon: '👁️', status: 'active' }
    ]
  },
  {
    id: 4,
    name: '故障诊断',
    code: 'fault:diagnose',
    description: '进行设备故障诊断和分析',
    type: 'function',
    categoryId: 4,
    icon: '🔧',
    status: 'active',
    roleCount: 2,
    userCount: 6,
    accessCount: 78,
    createdAt: new Date('2024-01-10T00:00:00'),
    roles: [
      { id: 1, name: '系统管理员', description: '拥有系统所有权限', icon: '👑', status: 'active' },
      { id: 2, name: '操作员', description: '负责日常设备监控', icon: '⚙️', status: 'active' }
    ]
  },
  {
    id: 5,
    name: '数据导出',
    code: 'data:export',
    description: '导出系统数据和报表',
    type: 'function',
    categoryId: 5,
    icon: '📤',
    status: 'active',
    roleCount: 2,
    userCount: 4,
    accessCount: 23,
    createdAt: new Date('2024-01-15T00:00:00'),
    roles: [
      { id: 1, name: '系统管理员', description: '拥有系统所有权限', icon: '👑', status: 'active' },
      { id: 2, name: '操作员', description: '负责日常设备监控', icon: '⚙️', status: 'active' }
    ]
  }
])

// 计算属性
const totalPermissions = computed(() => systemStore.permissionTotal)
const totalCategories = computed(() => categories.value.length)
const activePermissions = computed(() => permissions.value.filter(p => p.status === 'active').length)
const systemPermissions = computed(() => permissions.value.filter(p => p.type === 'system').length)

const filteredPermissions = computed(() => {
  if (selectedCategory.value) {
    return permissions.value.filter(p => p.categoryId === selectedCategory.value.id)
  }
  return permissions.value
})

// 方法
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '启用',
    disabled: '禁用'
  }
  return statusMap[status] || status
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

const selectCategory = (category: any) => {
  selectedCategory.value = category
}

const selectPermission = (permission: any) => {
  selectedPermission.value = permission
}

const editPermission = (permission: any) => {
  editingPermission.value = permission
  permissionForm.value = { ...permission }
  showEditPermissionModal.value = true
}

const viewPermission = (permission: any) => {
  console.log('查看权限详情:', permission)
}

const deletePermission = (permission: any) => {
  if (confirm(`确定要删除权限 "${permission.name}" 吗？`)) {
    permissions.value = permissions.value.filter(p => p.id !== permission.id)
    if (selectedPermission.value?.id === permission.id) {
      selectedPermission.value = null
    }
  }
}

const refreshPermissions = () => {
  console.log('刷新权限数据')
}

const exportPermissions = () => {
  console.log('导出权限数据')
}

const savePermission = () => {
  if (showEditPermissionModal.value && editingPermission.value) {
    // 编辑权限
    const index = permissions.value.findIndex(p => p.id === editingPermission.value.id)
    if (index !== -1) {
      permissions.value[index] = { ...permissions.value[index], ...permissionForm.value }
    }
  } else {
    // 添加权限
    const newPermission = {
      id: Date.now(),
      ...permissionForm.value,
      roleCount: 0,
      userCount: 0,
      accessCount: 0,
      createdAt: new Date(),
      roles: []
    }
    permissions.value.push(newPermission)
  }

  closeModal()
}

const saveCategory = () => {
  const newCategory = {
    id: Date.now(),
    ...categoryForm.value,
    permissionCount: 0
  }
  categories.value.push(newCategory)
  closeModal()
}

const closeModal = () => {
  showAddPermissionModal.value = false
  showEditPermissionModal.value = false
  showAddCategoryModal.value = false
  editingPermission.value = null
  permissionForm.value = {
    name: '',
    code: '',
    description: '',
    type: 'system',
    categoryId: 1,
    icon: '🔐',
    status: 'active'
  }
  categoryForm.value = {
    name: '',
    description: '',
    icon: '🔐'
  }
}

onMounted(() => {
  systemStore.fetchPermissionList()
})
</script>

<style scoped>
.permissions-management {
  height: 100%;
  overflow-y: auto;
  background: #f5f5f5;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px 20px 10px 20px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: bold;
  color: #333333;
}

.header-content p {
  margin: 0;
  color: #999999;
  font-size: 14px;
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #1890ff, var(--primary-hover));
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #666666;
  border: 1px solid #e8e8e8;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: #1890ff;
}

.btn-icon {
  font-size: 16px;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: #1890ff;
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.stat-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1890ff, var(--primary-hover));
  border-radius: 12px;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #333333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #999999;
}

/* 权限管理主体 */
.permissions-container {
  display: grid;
  grid-template-columns: 300px 1fr 400px;
  gap: 24px;
  height: calc(100vh - 300px);
}

/* 分类面板 */
.categories-panel {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  height: 100%;
  overflow-y: auto;
}

.categories-panel .panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.categories-panel .panel-header h3 {
  margin: 0;
  color: #333333;
  font-size: 16px;
  font-weight: 600;
}

.categories-list {
  padding: 16px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 8px;
}

.category-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.category-item.active {
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid #1890ff;
}

.category-icon {
  font-size: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.category-info {
  flex: 1;
}

.category-name {
  color: #333333;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
}

.category-count {
  color: #999999;
  font-size: 12px;
}

/* 权限面板 */
.permissions-panel {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  height: 100%;
  overflow-y: auto;
}

.permissions-panel .panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.permissions-panel .panel-header h3 {
  margin: 0;
  color: #333333;
  font-size: 16px;
  font-weight: 600;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.permissions-list {
  padding: 16px;
}

.permission-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.permission-item:hover {
  border-color: #1890ff;
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.permission-item.active {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.1);
}

.permission-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.permission-icon {
  font-size: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.permission-info {
  flex: 1;
}

.permission-name {
  color: #333333;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
}

.permission-code {
  color: #999999;
  font-size: 12px;
  font-family: monospace;
}

.permission-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.permission-status.active {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.permission-status.disabled {
  background: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
}

.permission-description {
  color: #666666;
  font-size: 12px;
  line-height: 1.4;
  margin-bottom: 12px;
}

.permission-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-label {
  color: #999999;
  font-size: 10px;
}

.meta-value {
  color: #333333;
  font-size: 11px;
  font-weight: 500;
}

.permission-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: #666666;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.action-btn.edit:hover {
  background: rgba(24, 144, 255, 0.2);
  color: #1890ff;
}

.action-btn.view:hover {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.action-btn.delete:hover {
  background: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
}

/* 详情面板 */
.detail-panel {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  height: 100%;
  overflow-y: auto;
}

.detail-panel .panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.detail-panel .panel-header h3 {
  margin: 0;
  color: #333333;
  font-size: 16px;
  font-weight: 600;
}

.panel-close {
  background: none;
  border: none;
  color: #999999;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.panel-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #333333;
}

.panel-content {
  padding: 20px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666666;
  font-weight: 600;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.detail-label {
  color: #999999;
  font-size: 12px;
}

.detail-value {
  color: #333333;
  font-size: 12px;
  font-weight: 500;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.status-badge.active {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.status-badge.disabled {
  background: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
}

.roles-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.role-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.role-icon {
  font-size: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}

.role-info {
  flex: 1;
}

.role-name {
  color: #333333;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 2px;
}

.role-description {
  color: #999999;
  font-size: 10px;
}

.role-status {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.role-status.active {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stats-grid .stat-item {
  text-align: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.stats-grid .stat-number {
  font-size: 20px;
  font-weight: bold;
  color: #333333;
  margin-bottom: 4px;
}

.stats-grid .stat-label {
  font-size: 10px;
  color: #999999;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h3 {
  margin: 0;
  color: #333333;
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  color: #999999;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #333333;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #666666;
  font-size: 14px;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: #333333;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .permissions-container {
    grid-template-columns: 250px 1fr 350px;
  }
}

@media (max-width: 1024px) {
  .permissions-container {
    grid-template-columns: 1fr;
  }

  .detail-panel {
    height: auto;
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }
}
</style>
