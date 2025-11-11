//用户
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
}
// 角色数据类型定义
export interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  status: number;
  permissions: string[];
  users: User[];
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
export type GetRoleDetailResponse = IApiResponseData<
{
  id: number;
  name: string;
  code: string;
  description: string;
  status: number;
  permissions: UserDetailIPermission[];
  createTime: string;
}>;

// 创建角色请求参数
export interface CreatRoleRequest {
  name: string;
  description: string;
  status: number;
}
export type CreateRoleResponse = IApiResponseData<{
  id: number;
  name: string;
  code: string;
}>;

// 更新角色请求参数
export interface UpdateRoleRequest {
  name: string;
  description: string;
  status: number;
}
export type UpdateRoleResponse = IApiResponseData<{
  id: number;
  name: string;
  code: string;
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
