// 摄像头数据接口 - 定义单个摄像头的完整数据结构
export interface CameraData {
  // 摄像头唯一标识ID
  id: number
  // 摄像头名称
  name: string
  // IP地址
  ip: string
  // 用户名
  username: string
  // 密码
  password: string
  // RTSP地址
  rtsp: string
  // 状态 - 0表示离线，1表示在线
  status: number
  // X坐标
  x: number
  // Y坐标
  y: number
  // 创建时间
  create_time: string
  // 更新时间
  update_time: string
}

// 获取摄像头列表请求参数接口
export interface GetCamerasRequestParams {
  // 名称 - 可选，用于搜索摄像头名称
  name?: string
  // IP地址 - 可选，用于搜索摄像头IP
  ip?: string
  // 状态 - 可选，用于筛选摄像头状态
  status?: number
  // 页码 - 可选，指定要获取的页码，默认为1
  page?: number
  // 每页数量 - 可选，指定每页显示的摄像头数量
  page_size?: number
}

// 获取摄像头列表响应数据接口
export interface GetCamerasResponseData {
  // 总数
  total: number
  // 摄像头列表数组
  list: CameraData[]
}
// 摄像头响应数据包装接口
export type CameraApiResponse = IApiResponseData<GetCamerasResponseData>

// 新增摄像头请求参数接口
export interface AddCameraRequestParams {
  // 摄像头名称
  name: string
  // IP地址
  ip: string
  // 用户名
  username: string
  // 密码
  password: string
  // RTSP地址
  rtsp: string
  // X坐标
  x: number
  // Y坐标
  y: number
}

// 新增摄像头响应数据类型
export type AddCameraResponseData = IApiResponseData<{
  // 摄像头唯一标识ID
  id: number
  // 摄像头名称
  name: string
  // IP地址
  ip: string
  // 用户名
  username: string
  // 密码
  password: string
  // RTSP地址
  rtsp: string
  // 状态 - 0表示离线，1表示在线
  status: number
  // X坐标
  x: number
  // Y坐标
  y: number
  // 创建时间
  create_time: string
  // 更新时间
  update_time: string
}>

// 修改摄像头请求参数接口
export interface UpdateCameraRequestParams {
  // 摄像头唯一标识ID
  id: number
  // 摄像头名称
  name: string
  // IP地址
  ip: string
  // 用户名
  username: string
  // 密码
  password: string
  // RTSP地址
  rtsp: string
  // 状态 - 0表示离线，1表示在线
  status: number
  // X坐标
  x: number
  // Y坐标
  y: number
}

// 修改摄像头响应数据类型
export type UpdateCameraResponseData = IApiResponseData<{
  // 摄像头唯一标识ID
  id: number
  // 摄像头名称
  name: string
  // IP地址
  ip: string
  // 用户名
  username: string
  // 密码
  password: string
  // RTSP地址
  rtsp: string
  // 状态 - 0表示离线，1表示在线
  status: number
  // X坐标
  x: number
  // Y坐标
  y: number
  // 创建时间
  create_time: string
  // 更新时间
  update_time: string
}>

//删除摄像头请求参数接口
export interface DeleteCameraRequestParams {
  // 摄像头唯一标识ID
  id: number
}
// 删除摄像头响应数据类型
export type DeleteCameraResponseData = IApiResponseData<string>

// 摄像头实时流响应字段（后端返回 Result[dict]，此处对齐为可拓展结构）
export interface CameraStreamData {
  // 可播放的地址（可能为 HLS.m3u8 / WebRTC 业务URL / MP4 等）
  play_url: string
  id: number
}

// 获取摄像头实时流响应类型
export type GetCameraStreamResponseData = IApiResponseData<CameraStreamData>
