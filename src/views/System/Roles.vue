<template>
  <div class="roles-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">角色管理</h1>
        <p class="page-subtitle">管理系统角色、权限分配和访问控制</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showAddRoleModal = true">
          <span class="btn-icon">➕</span>
          添加角色
        </button>
      </div>
    </div>

    <!-- 角色统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <div class="stat-number">{{ totalRoles }}</div>
          <div class="stat-label">总角色数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👤</div>
        <div class="stat-content">
          <div class="stat-number">{{ totalUsers }}</div>
          <div class="stat-label">总用户数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🔐</div>
        <div class="stat-content">
          <div class="stat-number">{{ totalPermissions }}</div>
          <div class="stat-label">权限数量</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-number">{{ activeRoles }}</div>
          <div class="stat-label">活跃角色</div>
        </div>
      </div>
    </div>

    <!-- 角色列表 -->
    <div class="roles-container">
      <div class="roles-grid">
        <div
          v-for="role in roles"
          :key="role.id"
          class="role-card"
          :class="{ active: selectedRole?.id === role.id }"
          @click="selectRole(role)"
        >
          <div class="role-header">
            <div class="role-icon">{{ role.icon }}</div>
            <div class="role-info">
              <h3 class="role-name">{{ role.name }}</h3>
              <p class="role-description">{{ role.description }}</p>
            </div>
            <div class="role-status" :class="role.status === 1 ? 'active' : 'disabled'">
              {{ getStatusText(role.status) }}
            </div>
          </div>

          <div class="role-stats">
            <div class="stat-item">
              <span class="stat-label">用户数</span>
              <span class="stat-value">{{ role.users.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">权限数</span>
              <span class="stat-value">{{ role.permissions.length }}</span>
            </div>
          </div>

          <div class="role-permissions">
            <h4>主要权限</h4>
            <div class="permissions-list">
              <span
                v-for="permission in role.permissions.slice(0, 3)"
                :key="permission"
                class="permission-tag"
              >
                {{ permission }}
              </span>
              <span v-if="role.permissions.length > 3" class="more-permissions">
                +{{ role.permissions.length - 3 }} 更多
              </span>
            </div>
          </div>

          <div class="role-actions">
            <button class="action-btn edit" @click.stop="editRole(role)" title="编辑">
              ✏️
            </button>
            <button class="action-btn view" @click.stop="viewRole(role)" title="查看">
              👁️
            </button>
            <button
              class="action-btn delete"
              @click.stop="deleteRole(role)"
              title="删除"
              v-if="role.id !== 1"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- 角色详情面板 -->
      <div v-if="selectedRole" class="role-detail-panel">
        <div class="panel-header">
          <h3>角色详情</h3>
          <button class="panel-close" @click="selectedRole = null">✕</button>
        </div>

        <div class="panel-content">
          <div class="detail-section">
            <h4>基本信息</h4>
            <div class="detail-item">
              <span class="detail-label">角色名称</span>
              <span class="detail-value">{{ selectedRole.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">角色描述</span>
              <span class="detail-value">{{ selectedRole.description }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">创建时间</span>
              <span class="detail-value">{{ formatDate(selectedRole.createTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">状态</span>
              <span class="detail-value status-badge" :class="selectedRole.status === 1 ? 'active' : 'disabled'">
                {{ getStatusText(selectedRole.status) }}
              </span>
            </div>
          </div>

          <div class="detail-section">
            <h4>权限列表</h4>
            <div class="permissions-grid">
              <div
                v-for="permission in selectedRole.permissions"
                :key="permission"
                class="permission-item"
              >
                <span class="permission-name">{{ permission }}</span>
                <span class="permission-type">系统权限</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>用户列表</h4>
            <div class="users-list">
              <div
                v-for="user in selectedRole.users"
                :key="user.id"
                class="user-item"
              >
                <div class="user-avatar">
                  <img :src="user.avatar" :alt="user.name" />
                </div>
                <div class="user-info">
                  <div class="user-name">{{ user.username }}</div>
                  <div class="user-email">{{ user.email }}</div>
                </div>
                <div class="user-status" :class="user.status">
                  {{ getStatusText(user.status) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑角色模态框 -->
    <div v-if="showAddRoleModal || showEditRoleModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showEditRoleModal ? '编辑角色' : '添加角色' }}</h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>

        <form @submit.prevent="saveRole" class="modal-form">
          <div class="form-group">
            <label>角色名称</label>
            <input v-model="roleForm.name" type="text" required />
          </div>
          <div class="form-group">
            <label>角色描述</label>
            <textarea v-model="roleForm.description" rows="3" required></textarea>
          </div>
          <div class="form-group">
            <label>角色图标</label>
            <select v-model="roleForm.icon" required>
              <option value="管理员">👑 管理员</option>
              <option value="操作员">⚙️ 操作员</option>
              <option value="观察员">👁️ 观察员</option>
              <option value="技术员">🔧 技术员</option>
              <option value="分析师">📊 分析师</option>
            </select>
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="roleForm.status" required>
              <option :value="1">启用</option>
              <option :value="0">禁用</option>
            </select>
          </div>
          <div class="form-group">
            <label>权限分配</label>
            <div class="permissions-selector">
              <div
                v-for="permission in availablePermissions"
                :key="permission.id"
                class="permission-option"
              >
                <label class="checkbox-wrapper">
                  <input
                    type="checkbox"
                    :value="permission.id"
                    v-model="roleForm.permissions"
                  />
                  <span class="checkmark"></span>
                  {{ permission.name }}
                </label>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeModal" :disabled="loading">
              取消
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? '处理中...' : (showEditRoleModal ? '保存' : '添加') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue'
import { getUsersApi, createUserApi, updateUserApi, deleteUserApi } from '@/api/user'
import { ElMessage } from 'element-plus'
import {
  getRoleList,
  getRoleDetail,
  createRole,
  updateRole,
  deleteRole as deleteRoleApi
} from '@/api/permission'
import type * as PermissionTypes from '@/api/permission/types/permission'
import { useSystemStore } from '@/store/modules/systemStore'

//状态库
const systemStore = useSystemStore()
// 响应式数据
const showAddRoleModal = ref(false)
const showEditRoleModal = ref(false)
const editingRole = ref<any>(null)
const selectedRole = ref<any>(null)
const loading = ref(false)

//角色统计卡片数据
const totalRoles = computed(() => systemStore.roleTotal)
const totalUsers = computed(() => systemStore.userTotal)
const totalPermissions = computed(() => systemStore.permissionTotal)
const activeRoles = computed(() => systemStore.activeRoleTotal)


//获取角色列表参数
const currentPage = ref(1)
const pageSize = ref(20)

// 角色表单
const roleForm = ref<PermissionTypes.RoleRequest>({
  name: '',
  description: '',
  role: '',
  status: 1, // 1: 启用, 0: 禁用
  permissions: []
})

// 可用权限列表 - 从store中获取并筛选id和name
const availablePermissions = computed(() => {
  if (!systemStore.permissions || systemStore.permissions.length === 0) {
    return []
  }
  return systemStore.permissions.map(permission => ({
    id: permission.id,
    name: permission.name
  }))
})

// 角色数据
const roles = ref<any[]>([])


// 方法
const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    1: '启用',
    0: '禁用'
  }
  return statusMap[status]
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

const selectRole = (role: any) => {
  selectedRole.value = role
  console.log('出发了', role)
}

const editRole = async (role: any) => {
  try {
    loading.value = true
    editingRole.value = role
    const response = await getRoleDetail(role.id)

    if (response.data) {
      const roleData = response.data
      roleForm.value = {
        name: roleData.name,
        description: roleData.description || '',
        icon: role.icon || '👁️',
        status: roleData.status || 1,
        permissions: roleData.permissions?.map((p: any) =>
          availablePermissions.value.find(ap => ap.name === p)?.id
        ).filter(Boolean) || []
      }
      showEditRoleModal.value = true
    }
  } catch (error) {
    ElMessage.error('获取角色详情失败')
    console.error('获取角色详情失败:', error)
  } finally {
    loading.value = false
  }
}

const viewRole = (role: any) => {
  console.log('查看角色详情:', role)
}

const deleteRole = async (role: any) => {
  if (confirm(`确定要删除角色 "${role.name}" 吗？`)) {
    try {
      loading.value = true
      await deleteRoleApi(role.id)

      roles.value = roles.value.filter(r => r.id !== role.id)
      if (selectedRole.value?.id === role.id) {
        selectedRole.value = null
      }
      await fetchRoles()
      ElMessage.success('角色删除成功')
    } catch (error) {
      ElMessage.error('角色删除失败')
      console.error('角色删除失败:', error)
    } finally {
      loading.value = false
    }
  }
}

const saveRole = async () => {
  try {
    loading.value = true

    // 准备表单数据
    const formData = {
      ...roleForm.value,
      // 确保状态是数字类型
      status: roleForm.value.status === 'active' ? 1 :
              roleForm.value.status === 'disabled' ? 0 :
              Number(roleForm.value.status)
    }

    if (showEditRoleModal.value && editingRole.value) {
      // 编辑角色
      await updateRole(editingRole.value.id, formData)
      await systemStore.assignRolePermissions(editingRole.value.id, formData.permissions)
      ElMessage.success('角色更新成功')
    } else {
      // 添加角色
      await createRole(formData)
      await systemStore.assignRolePermissions(editingRole.value.id, formData.permissions)
      ElMessage.success('角色创建成功')
    }

    // 重新获取角色列表
    await fetchRoles()
    closeModal()
  } catch (error) {
    const message = showEditRoleModal.value ? '角色更新失败' : '角色创建失败'
    ElMessage.error(message)
    console.error(message, error)
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  showAddRoleModal.value = false
  showEditRoleModal.value = false
  editingRole.value = null
  roleForm.value = {
    name: '',
    description: '',
    role: '',
    status: 1,
    permissions: []
  }
}


// 获取角色列表
const fetchRoles = async () => {
  try {
    loading.value = true
    const params: PermissionTypes.RoleListParams = {
      page: currentPage.value,
      size: pageSize.value
    }

    // 通过store获取角色列表
    const roleData = await systemStore.fetchRoleList(params)

    if (roleData && roleData.data.items) {
      // 转换数据格式，适配前端展示
      roles.value = roleData.data.items.map((role: any) => ({
        ...role,
        // 处理权限显示
        // permissions: role.permissions || [],
        // permissionCount: role.permissions ? role.permissions.length : 0,
        // userCount: role.userCount || 0,
        // createdAt: new Date(role.createTime || Date.now())
      }))
    }
  } catch (error) {
    // 错误处理已在store中完成
    console.error('获取角色列表失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRoles()
  systemStore.fetchUsers()
  systemStore.fetchPermissionList()
})

</script>

<style scoped>
.roles-management {
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
  background: rgba(255, 255, 255, 0.1);
  color: #666666;
  border: 1px solid #e8e8e8;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
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

/* 角色容器 */
.roles-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  height: calc(100vh - 300px);
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  overflow-y: auto;
}

.role-card {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.role-card:hover {
  border-color: #1890ff;
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.role-card.active {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.1);
}

.role-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.role-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.role-info {
  flex: 1;
}

.role-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333333;
}

.role-description {
  margin: 0;
  font-size: 12px;
  color: #999999;
  line-height: 1.4;
}

.role-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.role-status.active {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.role-status.disabled {
  background: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
}

.role-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #999999;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
}

.role-permissions h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666666;
}

.permissions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.permission-tag {
  padding: 2px 8px;
  background: rgba(0, 212, 255, 0.1);
  color: #1890ff;
  border-radius: 4px;
  font-size: 11px;
}

.more-permissions {
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #999999;
  border-radius: 4px;
  font-size: 11px;
}

.role-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: #666666;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
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

/* 角色详情面板 */
.role-detail-panel {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  height: 100%;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.panel-header h3 {
  margin: 0;
  color: #333333;
  font-size: 18px;
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

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
}

.permission-item {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.permission-name {
  color: #333333;
  font-size: 12px;
}

.permission-type {
  color: #999999;
  font-size: 10px;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1890ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.user-info {
  flex: 1;
}

.user-name {
  color: #333333;
  font-size: 12px;
  font-weight: 500;
}

.user-email {
  color: #999999;
  font-size: 10px;
}

.user-status {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.user-status.active {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.user-status.offline {
  background: rgba(217, 217, 217, 0.2);
  color: #d9d9d9;
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

.permissions-selector {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
}

.permission-option {
  margin-bottom: 8px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666666;
  font-size: 14px;
  cursor: pointer;
}

.checkbox-wrapper input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 16px;
  height: 16px;
  border: 2px solid #e8e8e8;
  border-radius: 3px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkmark {
  background: #1890ff;
  border-color: #1890ff;
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 10px;
  font-weight: bold;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
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

/* 响应式设计 */
@media (max-width: 1024px) {
  .roles-container {
    grid-template-columns: 1fr;
  }

  .role-detail-panel {
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

  .roles-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }
}
</style>
