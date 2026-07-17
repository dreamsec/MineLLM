import { request } from "@/utils/service"
import type * as PermissionTypes from './types/permission';

// 获取角色列表
export const getRoleList = (params: PermissionTypes.RoleListParams)=> {
  return request<PermissionTypes.GetRoleListResponse>({
    url: '/api/v1/rbac/role/list',
    method: 'get',
    params
  });
};

// 获取角色详情
export const getRoleDetail = (roleId: number)=> {
  return request<PermissionTypes.GetRoleDetailResponse>({
    url: `/api/v1/rbac/role/${roleId}`,
    method: 'get'
  });
};

// 创建角色
export const createRole = (data: PermissionTypes.CreatRoleRequest)=> {
  return request<PermissionTypes.CreateRoleResponse>({
    url: '/api/v1/rbac/role',
    method: 'post',
    data
  });
};

// 更新角色
export const updateRole = (roleId: number, data: PermissionTypes.UpdateRoleRequest)=> {
  return request<PermissionTypes.UpdateRoleResponse>({
    url: `/api/v1/rbac/role/${roleId}`,
    method: 'put',
    data
  });
};

// 删除角色
export const deleteRole = (roleId: number)=> {
  return request<PermissionTypes.DeleteRoleResponse>({
    url: `/api/v1/rbac/role/${roleId}`,
    method: 'delete'
  });
};

// 获取权限列表
export const getPermissionList = (params: PermissionTypes.GetPermissionListParams)=> {
  return request<PermissionTypes.GetPermissionListResponse>({
    url: '/api/v1/rbac/permission/list',
    method: 'get',
    params
  });
};
// 为角色分配权限（已废弃，功能已合并到 createRole/updateRole 的 permission_ids 字段）
// @deprecated
export const assignRolePermissionsapi = (roleId: number, data: PermissionTypes.AssignRolePermissionRequest)=> {
  return request<IApiResponseData<string>>({
    url: `/api/v1/rbac/role/${roleId}/permissions`,
    method: 'post',
    data
  });
};

// 获取权限树
export const getPermissionTree = (params?: PermissionTypes.GetPermissionTreeParams)=> {
  return request<PermissionTypes.GetPermissionTreeResponse>({
    url: '/api/v1/rbac/permission/tree',
    method: 'get',
    params
  });
};

//为用户分配角色
export const assignUserRoleapi = (userId: number, data: PermissionTypes.AssignUserRoleRequest)=> {
  return request<IApiResponseData<string>>({
    url: `/api/v1/rbac/user/${userId}/roles`,
    method: 'post',
    data
  });
};
