<template>
  <div class="users-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">用户管理</h1>
        <p class="page-subtitle">管理系统用户账户、权限分配和登录状态</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showAddUserModal = true">
          <span class="btn-icon">➕</span>
          添加用户
        </button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <div class="search-box">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索用户名、邮箱或姓名..."
            class="search-input"
          />
        </div>
      </div>
      <div class="filter-options">
        <select v-model="statusFilter" class="filter-select">
          <option value="">全部状态</option>
          <option value="active">在线</option>
          <option value="offline">离线</option>
          <option value="disabled">禁用</option>
        </select>
        <select v-model="roleFilter" class="filter-select">
          <option value="">全部角色</option>
          <option value="admin">管理员</option>
          <option value="operator">操作员</option>
          <option value="viewer">观察员</option>
        </select>
      </div>
    </div>

    <!-- 用户统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon online">👥</div>
        <div class="stat-content">
          <div class="stat-number">{{ totalUsers }}</div>
          <div class="stat-label">总用户数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon active">🟢</div>
        <div class="stat-content">
          <div class="stat-number">{{ onlineUsers }}</div>
          <div class="stat-label">在线用户</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning">⚠️</div>
        <div class="stat-content">
          <div class="stat-number">{{ disabledUsers }}</div>
          <div class="stat-label">禁用用户</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon info">📊</div>
        <div class="stat-content">
          <div class="stat-number">{{ newUsersToday }}</div>
          <div class="stat-label">今日新增</div>
        </div>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="users-table-container">
      <div class="table-header">
        <h3>用户列表</h3>
        <div class="table-actions">
          <button class="btn btn-secondary" @click="refreshUsers">
            <span class="btn-icon">🔄</span>
            刷新
          </button>
          <button class="btn btn-secondary" @click="exportUsers">
            <span class="btn-icon">📤</span>
            导出
          </button>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th>用户信息</th>
              <th>角色</th>
              <th>状态</th>
              <th>最后登录</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
              <td class="user-info">
                <div class="user-avatar">
                  <div class="status-indicator" :class="user.status"></div>
                </div>
                <div class="user-details">
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-email">{{ user.email }}</div>
                </div>
              </td>
              <td class="user-role">
                <span class="role-badge" :class="user.role">{{ user.roleName }}</span>
              </td>
              <td class="user-status">
                <span class="status-badge" :class="user.status">
                  {{ getStatusText(user.status) }}
                </span>
              </td>
              <td class="last-login">{{ formatDate(user.lastLogin) }}</td>
              <td class="created-time">{{ formatDate(user.createdAt) }}</td>
              <td class="user-actions">
                <button class="action-btn edit" @click="editUser(user)" title="编辑">
                  ✏️
                </button>
                <button class="action-btn view" @click="viewUser(user)" title="查看">
                  👁️
                </button>
                <button
                  class="action-btn delete"
                  @click="deleteUser(user)"
                  title="删除"
                  v-if="user.id !== currentUserId"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <button
          class="pagination-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </button>
        <span class="pagination-info">
          第 {{ currentPage }} 页，共 {{ totalPages }} 页
        </span>
        <button
          class="pagination-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 添加/编辑用户模态框 -->
    <div v-if="showAddUserModal || showEditUserModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showEditUserModal ? '编辑用户' : '添加用户' }}</h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <form @submit.prevent="saveUser" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label>用户名</label>
              <input v-model="userForm.username" type="text" required />
            </div>
            <div class="form-group">
              <label>姓名</label>
              <input v-model="userForm.name" type="text" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>邮箱</label>
              <input v-model="userForm.email" type="email" required />
            </div>
            <div class="form-group">
              <label>手机号</label>
              <input v-model="userForm.phone" type="tel" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>角色</label>
              <select v-model="userForm.role" required>
                <option value="admin">管理员</option>
                <option value="operator">操作员</option>
                <option value="viewer">观察员</option>
              </select>
            </div>
            <div class="form-group">
              <label>状态</label>
              <select v-model="userForm.status" required>
                <option value="active">启用</option>
                <option value="disabled">禁用</option>
              </select>
            </div>
          </div>
          <div class="form-group" v-if="!showEditUserModal">
            <label>密码</label>
            <input v-model="userForm.password" type="password" required />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary">
              {{ showEditUserModal ? '保存' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const searchQuery = ref('')
const statusFilter = ref('')
const roleFilter = ref('')
const currentPage = ref(1)
const showAddUserModal = ref(false)
const showEditUserModal = ref(false)
const editingUser = ref<any>(null)
const currentUserId = ref(1) // 当前登录用户ID

// 用户表单
const userForm = ref({
  username: '',
  name: '',
  email: '',
  phone: '',
  role: 'viewer',
  status: 'active',
  password: ''
})

// 模拟用户数据
const users = ref([
  {
    id: 1,
    username: 'admin',
    name: '系统管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    role: 'admin',
    roleName: '管理员',
    status: 'active',
    avatar: 'https://via.placeholder.com/40',
    lastLogin: new Date('2024-01-15T10:30:00'),
    createdAt: new Date('2024-01-01T00:00:00')
  },
  {
    id: 2,
    username: 'operator1',
    name: '张工程师',
    email: 'zhang@example.com',
    phone: '13800138001',
    role: 'operator',
    roleName: '操作员',
    status: 'active',
    avatar: 'https://via.placeholder.com/40',
    lastLogin: new Date('2024-01-15T09:15:00'),
    createdAt: new Date('2024-01-05T00:00:00')
  },
  {
    id: 3,
    username: 'viewer1',
    name: '李观察员',
    email: 'li@example.com',
    phone: '13800138002',
    role: 'viewer',
    roleName: '观察员',
    status: 'offline',
    avatar: 'https://via.placeholder.com/40',
    lastLogin: new Date('2024-01-14T16:45:00'),
    createdAt: new Date('2024-01-10T00:00:00')
  },
  {
    id: 4,
    username: 'operator2',
    name: '王技术员',
    email: 'wang@example.com',
    phone: '13800138003',
    role: 'operator',
    roleName: '操作员',
    status: 'disabled',
    avatar: 'https://via.placeholder.com/40',
    lastLogin: new Date('2024-01-10T14:20:00'),
    createdAt: new Date('2024-01-08T00:00:00')
  }
])

// 计算属性
const filteredUsers = computed(() => {
  let filtered = users.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query)
    )
  }

  // 状态过滤
  if (statusFilter.value) {
    filtered = filtered.filter(user => user.status === statusFilter.value)
  }

  // 角色过滤
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }

  return filtered
})

const totalUsers = computed(() => users.value.length)
const onlineUsers = computed(() => users.value.filter(u => u.status === 'active').length)
const disabledUsers = computed(() => users.value.filter(u => u.status === 'disabled').length)
const newUsersToday = computed(() => {
  const today = new Date()
  return users.value.filter(u => {
    const createdDate = new Date(u.createdAt)
    return createdDate.toDateString() === today.toDateString()
  }).length
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / 10))

// 方法
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '在线',
    offline: '离线',
    disabled: '禁用'
  }
  return statusMap[status] || status
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const refreshUsers = () => {
  // 模拟刷新数据
  console.log('刷新用户数据')
}

const exportUsers = () => {
  // 模拟导出功能
  console.log('导出用户数据')
}

const editUser = (user: any) => {
  editingUser.value = user
  userForm.value = { ...user }
  showEditUserModal.value = true
}

const viewUser = (user: any) => {
  console.log('查看用户详情:', user)
}

const deleteUser = (user: any) => {
  if (confirm(`确定要删除用户 "${user.name}" 吗？`)) {
    users.value = users.value.filter(u => u.id !== user.id)
  }
}

const saveUser = () => {
  if (showEditUserModal.value && editingUser.value) {
    // 编辑用户
    const index = users.value.findIndex(u => u.id === editingUser.value.id)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...userForm.value }
    }
  } else {
    // 添加用户
    const newUser = {
      id: Date.now(),
      ...userForm.value,
      roleName: getRoleName(userForm.value.role),
      avatar: 'https://via.placeholder.com/40',
      lastLogin: new Date(),
      createdAt: new Date()
    }
    users.value.push(newUser)
  }

  closeModal()
}

const getRoleName = (role: string) => {
  const roleMap: Record<string, string> = {
    admin: '管理员',
    operator: '操作员',
    viewer: '观察员'
  }
  return roleMap[role] || role
}

const closeModal = () => {
  showAddUserModal.value = false
  showEditUserModal.value = false
  editingUser.value = null
  userForm.value = {
    username: '',
    name: '',
    email: '',
    phone: '',
    role: 'viewer',
    status: 'active',
    password: ''
  }
}

onMounted(() => {
  // 页面加载时的初始化
  console.log('用户管理页面已加载')
})
</script>

<style scoped>
.users-management {
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
  background: #1890ff;
  color: white;
  border: 1px solid #1890ff;
}

.btn-primary:hover {
  transform: translateY(-2px);
  background: #40a9ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.btn-secondary {
  background: #ffffff;
  color: #666666;
  border: 1px solid #d9d9d9;
}

.btn-secondary:hover {
  background: #f0f8ff;
  border-color: #1890ff;
  color: #1890ff;
}

.btn-icon {
  font-size: 16px;
}

/* 搜索和筛选 */
.search-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-box {
  flex: 1;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #999999;
  font-size: 16px;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  color: #333333;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.filter-options {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 10px 12px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  color: #333333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  border-color: #1890ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.2);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 24px;
}

.stat-icon.online {
  background: linear-gradient(135deg, #52c41a, #73d13d);
}

.stat-icon.active {
  background: linear-gradient(135deg, #1890ff, #40a9ff);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #faad14, #ffc53d);
}

.stat-icon.info {
  background: linear-gradient(135deg, #722ed1, #9254de);
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

/* 表格 */
.users-table-container {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
}

.table-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333333;
}

.table-actions {
  display: flex;
  gap: 12px;
}

.table-wrapper {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  padding: 16px 24px;
  text-align: center;
  font-weight: 600;
  color: #666666;
  background: #f0f8ff;
  border-bottom: 1px solid #e8e8e8;
}

.users-table td {
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
}

.user-row:hover {
  background: #f0f8ff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  position: relative;
  width: 40px;
  height: 40px;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #ffffff;
}

.status-indicator.active {
  background: #52c41a;
}

.status-indicator.offline {
  background: #d9d9d9;
}

.status-indicator.disabled {
  background: #ff4d4f;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: #333333;
  margin-bottom: 4px;
}

.user-email {
  font-size: 12px;
  color: #999999;
}

.role-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge.admin {
  background: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
}

.role-badge.operator {
  background: rgba(250, 173, 20, 0.2);
  color: #faad14;
}

.role-badge.viewer {
  background: rgba(24, 144, 255, 0.2);
  color: #1890ff;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.status-badge.offline {
  background: rgba(217, 217, 217, 0.2);
  color: #d9d9d9;
}

.status-badge.disabled {
  background: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
}

.user-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #fafafa;
  color: #666666;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  border: 1px solid #e8e8e8;
}

.action-btn:hover {
  background: #f0f8ff;
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

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-top: 1px solid #e8e8e8;
  background: #fafafa;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #e8e8e8;
  background: #ffffff;
  color: #666666;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f0f8ff;
  border-color: #1890ff;
  color: #1890ff;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: #999999;
  font-size: 14px;
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
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
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
  background: #fafafa;
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
.form-group select {
  padding: 10px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: #fafafa;
  color: #333333;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  background: #ffffff;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
}

.modal-actions .btn-secondary {
  background: #ffffff;
  color: #666666;
  border: 1px solid #d9d9d9;
}

.modal-actions .btn-secondary:hover {
  background: #f0f8ff;
  border-color: #1890ff;
  color: #1890ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .search-section {
    flex-direction: column;
    gap: 16px;
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
