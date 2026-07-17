//用户
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
}

// 权限简要信息（用于角色关联展示，列表和详情统一使用此结构）
export interface PermissionBrief {
  id: number;
  name: string;
  code?: string;
  type?: number;
}

// 角色数据类型定义
export interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  status: number;
  permissions: PermissionBrief[];
  users: User[];
  user_count: number;
  permission_count: number;
  createTime: string;
  updateTime?: string;
}

// 用户详情中的权限数据类型定义
export interface UserDetailIPermission {
  id: number;
  name: string;
  code: string;
  type: number;
}

// 角色列表请求参数
export interface RoleListParams {
  page: number;
  size: number;

}

// 角色列表响应数据
export type GetRoleListResponse = IApiResponseData<{
  items: Role[];
  total: number;
  page: number;
  size: number;
}>;

// 角色详情响应数据
export type GetRoleDetailResponse = IApiResponseData<{
  id: number;
  name: string;
  code: string;
  description: string;
  status: number;
  permissions: PermissionBrief[];
  users: User[];
  createTime: string;
  updateTime?: string;
}>;

// 创建角色请求参数
export interface CreatRoleRequest {
  name: string;
  code: string;
  description?: string;
  status?: number;
  permission_ids: number[];
}
export type CreateRoleResponse = IApiResponseData<{
  id: number;
  name: string;
  code: string;
  description: string;
  status: number;
  permissions: PermissionBrief[];
  createTime: string;
}>;

// 更新角色请求参数
export interface UpdateRoleRequest {
  name: string;
  code: string;
  description?: string;
  status?: number;
  permission_ids: number[];
}
export type UpdateRoleResponse = IApiResponseData<{
  id: number;
  name: string;
  code: string;
  description: string;
  status: number;
  permissions: PermissionBrief[];
  updateTime: string;
}>;

//删除角色响应参数
export type DeleteRoleResponse = IApiResponseData<string>;







// 完整权限项数据类型定义
export interface Permission {
  id: number;
  name: string;
  parent_id: number;
  code: string;
  type: number;
  order_num: number | null;
  path: string;
  route_name: string;
  status: number;
  remark: string;
  create_time: string;
}


//获取权限列表请求参数
export interface GetPermissionListParams {
  page: number;
  size: number;
}

// 获取权限列表响应数据
export type GetPermissionListResponse = IApiResponseData<{
  items: Permission[];
  total: number;
}>;
// 为角色分配权限请求参数
export interface AssignRolePermissionRequest {
  permission_ids: number[];
}
// 为用户分配角色请求参数
export interface AssignUserRoleRequest {
  role_ids: number[];
}

// 权限树节点（用于树形权限选择器）
export interface PermissionTreeNode {
  id: number;
  name: string;
  code: string;
  type: number;
  children: PermissionTreeNode[];
}

// 获取权限树请求参数
export interface GetPermissionTreeParams {
  type?: number;
  status?: number;
}

// 获取权限树响应数据
export type GetPermissionTreeResponse = IApiResponseData<PermissionTreeNode[]>;
