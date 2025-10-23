// 用户信息接口
export interface User {
  id: number;
  username: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  status: number;
  roles: string[];
  create_time: string;
}

// 获取用户列表请求参数
export interface GetUsersRequestParams {
  page?: number;
  size?: number;
}

// 获取用户列表响应数据
export type GetUsersResponseData = IApiResponseData<{
  items: User[];
  total: number;
  page: number;
  size: number;
}>


// 创建用户请求数据
export interface CreateUserRequestData {
  username: string;
  password: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  status: number;
  roles: string[];
}

// 更新用户请求数据
export interface UpdateUserRequestData {
  password: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  status: number;
  roles: string[];
}


