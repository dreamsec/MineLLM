

// 设备数据接口 - 定义单个设备的完整数据结构
// 该接口对应后端返回的单个设备数据格式
export interface DeviceData {
  // 设备唯一标识ID
  id: number
  // 设备编码 - 设备的唯一编码标识
  equipment_code: string
  // 设备名称 - 设备的显示名称
  equipment_name: string
  // 设备类型 - 标识设备所属的类型分类
  equipment_type: string
  // 设备型号 - 设备的具体型号信息
  equipment_model: string
  // 制造商 - 设备的生产厂家
  manufacturer: string
  // 安装位置 - 设备的安装地点
  install_location: string
  // 安装日期 - 设备的安装时间，格式通常为ISO日期字符串
  install_date: string
  // 额定功率 - 设备的功率参数
  rated_power: number
  // 额定电压 - 设备的电压参数
  rated_voltage: number
  // 额定电流 - 设备的电流参数
  rated_current: number
  // 设备状态 - 设备当前的运行状态
  equipment_status: string
  // 在线状态 - 0表示离线，非0表示在线
  is_online: number
  // 创建时间 - 记录创建的时间戳
  created_at: string
  // 更新时间 - 记录最后更新的时间戳
  updated_at: string
  // 备注信息 - 关于设备的其他说明
  remark: string
}

// 获取设备列表请求参数接口
// 该接口定义了请求设备列表时可以传递的查询参数
export interface GetDevicesRequestParams {
  // 页码 - 可选，指定要获取的页码，默认为1
  page?: number
  // 每页数量 - 可选，指定每页显示的设备数量
  page_size?: number
  // 设备类型 - 可选，按照设备类型进行筛选
  equipment_type?: string
  // 设备状态 - 可选，按照设备状态进行筛选
}

// 获取设备列表响应数据类型
// 使用泛型IApiResponseData包装设备列表数据
// 符合项目中统一的API响应格式规范
export type GetDevicesResponseData = IApiResponseData<{
  // 总数 - 符合条件的设备总数量
  total: number
  // 设备列表 - 当前页的设备数据数组，每个元素为DeviceData类型
  list: DeviceData[]
}>

