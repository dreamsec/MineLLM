

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
  create_time: string
  // 更新时间 - 记录最后更新的时间戳
  update_time: string
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

// 新增设备请求参数接口
export interface AddDeviceRequestParams {
  // 设备编码
  equipment_code: string
  // 设备名称
  equipment_name: string
  // 设备类型
  equipment_type: string
  // 设备型号
  equipment_model: string
  // 制造商
  manufacturer: string
  // 安装位置
  install_location: string
  // 安装日期
  install_date: string
  // 额定功率
  rated_power: number
  // 额定电压
  rated_voltage: number
  // 额定电流
  rated_current: number
  // 设备状态
  equipment_status: string
  // 备注信息
  remark: string
}

// 新增设备响应数据类型
export type AddDeviceResponseData = IApiResponseData<{
    // 设备编码
    equipment_code: string
    // 设备名称
    equipment_name: string
    // 设备类型
    equipment_type: string
    // 设备型号
    equipment_model: string
    // 制造商
    manufacturer: string
    // 安装位置
    install_location: string
    // 安装日期
    install_date: string
    // 额定功率
    rated_power: number
    // 额定电压
    rated_voltage: number
    // 额定电流
    rated_current: number
    // 设备状态
    equipment_status: string
    // 备注信息
    remark: string
}>

//修改设备请求参数接口
export interface UpdateDeviceRequestParams {
  equipment_code: string
  equipment_name: string
  equipment_type: string
  manufacturer: string
  install_location: string
  install_date: string
  rated_power: number
  rated_voltage: number
  rated_current: number
  equipment_status: string
  is_online: number
  remark: string
}

// 修改设备响应数据类型
export type UpdateDeviceResponseData = IApiResponseData<DeviceData>;

// 删除设备响应数据类型
export type DeleteDeviceResponseData = IApiResponseData<string>;




// 基础设备实时数据接口（所有设备类型共享的字段）
export interface BaseRealtimeData {
  // 数据ID
  id?: number;
  // 设备编码
  equipment_code: string;
  // 数据采集时间
  collected_at: string;
}

// 提升机实时数据接口
export interface HoistRealtimeData extends BaseRealtimeData {
  // 提升机特有数据字段 - 电机温度相关
  motor_temp_1?: number;
  motor_temp_2?: number;
  motor_temp_3?: number;
  motor_temp_4?: number;
  motor_temp_5?: number;
  motor_temp_6?: number;
  motor_temp_7?: number;
  motor_temp_8?: number;
  motor_temp_9?: number;
  motor_temp_10?: number;
  motor_temp_11?: number;
  motor_temp_12?: number;
  motor_temp_max?: number;
  motor_current?: number;

  // 天轮温度相关
  sheave_temp_1?: number;
  sheave_temp_2?: number;
  sheave_temp_3?: number;
  sheave_temp_4?: number;
  sheave_temp_5?: number;
  sheave_temp_6?: number;
  sheave_temp_7?: number;
  sheave_temp_8?: number;
  sheave_temp_max?: number;

  // 主轴温度相关
  main_shaft_temp_1?: number;
  main_shaft_temp_2?: number;
  main_shaft_temp_3?: number;
  main_shaft_temp_4?: number;
  main_shaft_temp_max?: number;

  // 速度相关
  plc_speed_1?: number;
  plc_speed_2?: number;
  speed_1?: number;
  speed_2?: number;
  speed_3?: number;
  speed_4?: number;
  actual_speed?: number;
  speed_diff?: number;
  travel_diff?: number;
  deceleration?: number;

  // 副罐笼深度相关
  vice_skip_depth?: number;
  vice_skip_overwind?: number;
  vice_skip_deceleration_point?: number;
  vice_skip_stop_point?: number;
  vice_skip_monitor_2m?: number;

  // 主罐笼深度相关
  main_skip_depth?: number;
  main_skip_overwind?: number;
  main_skip_stop_point?: number;
  main_skip_deceleration_point?: number;
  main_skip_monitor_2m?: number;

  // 运行模式相关
  auto_run?: number;
  semi_auto_run?: number;
  simple_run?: number;
  manual_run?: number;
  repair_mode?: number;
  emergency_stop?: number;
  fault_stop?: number;
  fault_alarm?: number;
  start_condition_insufficient?: number;

  // 提升类型
  lift_person?: number;
  lift_material?: number;

  // 控制相关
  handle_zero_position?: number;
  handle_set_speed_check?: number;
  speed_setpoint?: number;
  guide_wheel_speed?: number;

  // 制动和温度
  brake_oil_pressure?: number;
  brake_oil_temp?: number;
  wellhead_temp?: number;

  // 信号
  signal_0?: number;
  signal_2?: number;
  signal_3?: number;
  signal_4?: number;
  signal_5?: number;

  // 励磁和气压
  excitation_merge?: number;
  excitation_current?: number;
  brake_air_pressure?: number;

  // 负载重量
  load_weight?: number;
}

// 压风机实时数据接口
export interface CompressorRealtimeData extends BaseRealtimeData {
  // 压风机特有数据字段
  standby_status?: string;
  current_run_time?: number;
  unit_exhaust_temp?: number;
  intake_vacuum?: number;
  coolant_temp?: number;
  motor_vibration?: number;
  analog_alarm_airbag_temp?: number;
  separation_pressure?: number;
  main_exhaust_temp?: number;
  running_temp?: number;
  voltage?: number;
  current?: number;
  separation_diff_pressure?: number;
  analog_current_airbag_temp?: number;
  exhaust_pressure?: number;
  main_vibration?: number;
}

// 通风机实时数据接口
export interface VentilatorRealtimeData extends BaseRealtimeData {
  // 通风机特有数据字段
  motor1_current?: number;
  motor1_voltage?: number;
  motor2_horiz_vibration?: number;
  motor2_south_axis_temp?: number;
  motor1_phase_b_temp?: number;
  vfd_run_current?: number;
  alarm?: number;
  vfd_run_feedback?: number;
  motor1_north_axis_temp?: number;
  motor1_phase_c_temp?: number;
  motor2_vert_vibration?: number;
  motor1_vert_vibration?: number;
  motor1_south_axis_temp?: number;
  motor2_phase_a_temp?: number;
  motor1_phase_a_temp?: number;
  motor2_phase_c_temp?: number;
  motor2_voltage?: number;
  motor1_horiz_vibration?: number;
  motor2_phase_b_temp?: number;
  motor2_current?: number;
  motor2_north_axis_temp?: number;
  vfd_run_freq?: number;
  side_door_closed?: number;
  side_door_opened?: number;
  standby?: number;
  air_volume?: number;
  air_speed?: number;
  exhaust_mode?: number;
  neg_pressure?: number;
  total_pressure?: number;
}

// 排水机实时数据接口
export interface PumpRealtimeData extends BaseRealtimeData {
  // 排水机特有数据字段
  // 电机相关
  voltage?: number;
  current?: number;
  current_fault?: number;
  motor_phase_a_temp?: number;
  motor_phase_b_temp?: number;
  motor_phase_c_temp?: number;
  motor_vibration_1?: number;
  motor_vibration_2?: number;
  motor_rear_axis_temp?: number;
  motor_front_axis_temp?: number;
  motor_overheat_fault?: number;
  
  // 泵相关
  pump_fault?: number;
  pump_emergency_fault?: number;
  pump_vibration_1?: number;
  pump_vibration_2?: number;
  pump_overheat_fault?: number;
  pump_run_feedback?: number;
  pump_front_axis_temp?: number;
  pump_rear_axis_temp?: number;
  
  // 压力相关
  pos_pressure?: number;
  neg_pressure?: number;
  pos_pressure_fault?: number;
  neg_pressure_fault?: number;
  
  // 阀门相关
  main_valve_close_feedback?: number;
  main_valve_overload_fault?: number;
  main_valve_closed?: number;
  main_valve_open_feedback?: number;
  main_valve_opening?: number;
  main_valve_closed_fault?: number;
  main_valve_open?: number;
  main_valve_open_fault?: number;
  jet_ball_valve_status?: number;
  
  // 运行状态相关
  semi_auto_status?: number;
  runtime_reset_button?: number;
  total_fault?: number;
  device_stop_status?: number;
  maintenance_status?: number;
  remote_status?: number;
  runtime_minutes?: number;
  runtime_hours?: number;
  runtime?: number;
  local_status?: number;
  vibration_fault?: number;
  
  // 为兼容旧版接口保留的字段（实际应使用上述新字段）
  positive_pressure?: number;
  negative_pressure?: number;
  pump_front_temp?: number;
  motor_front_temp?: number;
  pump_rear_temp?: number;
  motor_rear_temp?: number;
  total_run_time?: number;
}

// 运输机实时数据接口
export interface ConveyorRealtimeData extends BaseRealtimeData {
  // 运输机特有数据字段
  belt_speed?: number;
  load_capacity?: number;
  motor_current?: number;
  motor_voltage?: number;
  motor_power?: number;
  motor_temperature?: number;
  gearbox_temperature?: number;
  bearing_temperature?: number;
  belt_tension?: number;
  vibration_value?: number;
  belt_deviation?: number;
  running_hours?: number;
  transport_direction?: string;
}

// 设备实时数据联合类型
export type EquipmentRealtimeData =
    | HoistRealtimeData
  | CompressorRealtimeData
  | VentilatorRealtimeData
  | PumpRealtimeData
  | ConveyorRealtimeData;

// 设备实时数据响应类型
export type GetEquipmentRealtimeDataResponse = IApiResponseData<EquipmentRealtimeData>;







