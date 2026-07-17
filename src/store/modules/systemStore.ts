import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import {
  getRoleList,
  getRoleDetail,
  createRole,
  updateRole,
  deleteRole,
  getPermissionList,
  assignUserRoleapi,
} from '@/api/permission'
import type * as PermissionTypes from '@/api/permission/types/permission'
import {
  getUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi
} from '@/api/user'
import type * as UserTypes from '@/api/user/types/user'

export const useSystemStore = defineStore('system', () => {
  // 角色相关状态
  const roles = ref<any>([])
  const currentRole = ref<PermissionTypes.GetRoleDetailResponse['data'] | null>(null)

  // 用户相关状态
  const users = ref<any>([])
  const currentUser = ref<any>(null)

  // 权限相关状态
  const permissions = ref<any>([])

  const roleTotal = ref(0)
  const userTotal = ref(0)
  const permissionTotal = ref(0)
  const activeRoleTotal = ref(0)

  // 加载状态
  const loading = ref({
    roles: false,
    users: false,
    permissions: false
  })
  //分页，用于角色列表
  const pagination = ref({
    roles: {
      page: 1,
      size: 20000,
    },
    users: {
      page: 1,
      size: 20000,
    }
  })

  //获取用户列表
    //获取用户列表 - 对应API: getUsersApi
  async function fetchUsers(params: UserTypes.GetUsersRequestParams= {
    page: 1,
    size: 20
  }) {
    try {
      loading.value.users = true
      const response = await getUsersApi(params)

      users.value = response.data.items
      userTotal.value = response.data.total

      return response
    } catch (error) {
      ElMessage.error('获取用户列表失败')
      console.error('获取用户列表失败:', error)
      throw error
    } finally {
      loading.value.users = false
    }
  }

  //创建用户 - 对应API: createUserApi
  async function createUser(data: UserTypes.CreateUserRequestData) {
    try {
      loading.value.users = true
      const response = await createUserApi(data)
      ElMessage.success('创建用户成功')
      return response
    } catch (error) {
      ElMessage.error('创建用户失败')
      console.error('创建用户失败:', error)
      throw error
    } finally {
      loading.value.users = false
    }
  }

  //更新用户 - 对应API: updateUserApi
  async function updateUser(userId: number, data: UserTypes.UpdateUserRequestData) {
    try {
      loading.value.users = true
      const response = await updateUserApi(userId, data)
      ElMessage.success('更新用户成功')
      // 更新成功后刷新列表
      //await fetchUsers(pagination.value.users)
      return response
    } catch (error) {
      ElMessage.error('更新用户失败')
      console.error('更新用户失败:', error)
      throw error
    } finally {
      loading.value.users = false
    }
  }

  //删除用户 - 对应API: deleteUserApi
  async function deleteUser(userId: number) {
    try {
      loading.value.users = true
      const response = await deleteUserApi(userId)
      ElMessage.success('删除用户成功')
      // 删除成功后刷新列表
      //await fetchUsers(pagination.value.users)
      return response
    } catch (error) {
      ElMessage.error('删除用户失败')
      console.error('删除用户失败:', error)
      throw error
    } finally {
      loading.value.users = false
    }
  }

  //为用户分配角色
  async function assignUserRole(userId: number, roleIds: number[]) {
    try {
      loading.value.users = true
      const response = await assignUserRoleapi(userId, { role_ids: roleIds })
      ElMessage.success('为用户分配角色成功')
      // 分配成功后刷新用户详情
      //await fetchUserDetail(userId)
      return response
    } catch (error) {
      ElMessage.error('为用户分配角色失败')
      console.error('为用户分配角色失败:', error)
      throw error
    } finally {
      loading.value.users = false
    }
  }






  //获取角色列表
  async function fetchRoleList(params: PermissionTypes.RoleListParams) {
    try {
      loading.value.roles = true
      const response = await getRoleList(params)

      roles.value = response.data.items
      roleTotal.value = response.data.total
      activeRoleTotal.value = response.data.items.filter((r: any) => r.status === 1).length

      return response
    } catch (error) {
      ElMessage.error('获取角色列表失败')
      console.error('获取角色列表失败:', error)
      throw error
    } finally {
      loading.value.roles = false
    }
  }

  //获取角色详情
  async function fetchRoleDetail(roleId: number) {
    try {
      loading.value.roles = true
      const response = await getRoleDetail(roleId)

      return response
    } catch (error) {
      ElMessage.error('获取角色详情失败')
      console.error('获取角色详情失败:', error)
      throw error
    } finally {
      loading.value.roles = false
    }
  }

  //增加角色（包含权限分配，一步完成）
  async function addRole(data: PermissionTypes.CreatRoleRequest) {
    try {
      loading.value.roles = true
      const response = await createRole(data)
      ElMessage.success('创建角色成功')
      // 创建成功后刷新列表
      await fetchRoleList(pagination.value.roles)
      return response
    } catch (error) {
      ElMessage.error('创建角色失败')
      console.error('创建角色失败:', error)
      throw error
    } finally {
      loading.value.roles = false
    }
  }

  //更新角色（包含权限更新，一步完成）
  async function modifyRole(roleId: number, data: PermissionTypes.UpdateRoleRequest) {
    try {
      loading.value.roles = true
      const response = await updateRole(roleId, data)
      ElMessage.success('更新角色成功')
      // 更新成功后刷新列表
      await fetchRoleList(pagination.value.roles)
      return response
    } catch (error) {
      ElMessage.error('更新角色失败')
      console.error('更新角色失败:', error)
      throw error
    } finally {
      loading.value.roles = false
    }
  }

  //删除角色
  async function removeRole(roleId: number) {
    try {
      loading.value.roles = true
      const response = await deleteRole(roleId)
      ElMessage.success('删除角色成功')
      // 删除成功后刷新列表
      await fetchRoleList(pagination.value.roles)
      return response
    } catch (error) {
      ElMessage.error('删除角色失败')
      console.error('删除角色失败:', error)
      throw error
    } finally {
      loading.value.roles = false
    }
  }


  //获取权限列表
  async function fetchPermissionList(params: PermissionTypes.GetPermissionListParams= {
    page: 1,
    size: 200
  }) {
    try {
      loading.value.permissions = true
      const response = await getPermissionList(params)

      permissions.value = response.data.items
      permissionTotal.value = response.data.total

      return response
    } catch (error) {
      ElMessage.error('获取权限列表失败')
      console.error('获取权限列表失败:', error)
      throw error
    } finally {
      loading.value.permissions = false
    }
  }

  function resetStore() {
    roles.value = []
    currentRole.value = null
    users.value = []
    currentUser.value = null
    loading.value = {
      roles: false,
      users: false,
      permissions: false
    }
    pagination.value = {
      roles: { page: 1, size: 10 },
      users: { page: 1, size: 10 },
    }
  }

  return {
    // 角色相关
    roles,
    currentRole,
    roleTotal,
    activeRoleTotal,

    // 用户相关
    users,
    currentUser,
    userTotal,

    // 权限相关
    permissionTotal,
    permissions,

    // 角色方法
    fetchRoleList,
    fetchRoleDetail,
    addRole,
    modifyRole,
    removeRole,

    // 用户方法 - 严格对应API接口名称
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    assignUserRole,

    // 权限方法
    fetchPermissionList,



    resetStore
  }
})
