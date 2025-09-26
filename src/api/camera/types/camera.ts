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
  // 视图X坐标
  vx: number
  // 视图Y坐标
  vy: number
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

