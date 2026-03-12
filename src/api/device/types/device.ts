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
  // 说明：后端新版本中，状态量为 Boolean，数值量为 Float。
  // 为兼容历史数据/不同序列化方式，这里对状态量使用 boolean | number (0/1)。

  // ===================== 1. 电机温度监测 (Float) =====================
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

  // ===================== 2. 天轮温度监测 (Float) =====================
  sheave_temp_1?: number;
  sheave_temp_2?: number;
  sheave_temp_3?: number;
  sheave_temp_4?: number;
  sheave_temp_5?: number;
  sheave_temp_6?: number;
  sheave_temp_7?: number;
  sheave_temp_8?: number;
  sheave_temp_max?: number;

  // ===================== 3. 主轴温度监测 (Float) =====================
  main_shaft_temp_1?: number;
  main_shaft_temp_2?: number;
  main_shaft_temp_3?: number;
  main_shaft_temp_4?: number;
  main_shaft_temp_max?: number;

  // ===================== 4. 速度数值 (Float) =====================
  plc_speed_1?: number;
  plc_speed_2?: number;
  actual_speed?: number;
  guide_wheel_speed?: number;
  speed_setpoint?: number;
  handle_set_speed_check?: number;
  speed_diff?: number;

  // ===================== 5. 速度状态 (Boolean) =====================
  speed_status_1?: boolean | number;
  speed_status_2?: boolean | number;
  speed_status_3?: boolean | number;
  speed_status_4?: boolean | number;
  deceleration?: boolean | number;

  // ===================== 6. 深度与位置数值 (Float) =====================
  main_skip_depth?: number;
  vice_skip_depth?: number;
  travel_diff?: number;

  // ===================== 7. 位置开关量 (Boolean) =====================
  main_skip_overwind?: boolean | number;
  main_skip_stop_point?: boolean | number;
  main_skip_deceleration_point?: boolean | number;
  main_skip_monitor_2m?: boolean | number;
  main_skip_calibration_point?: boolean | number;

  vice_skip_overwind?: boolean | number;
  vice_skip_stop_point?: boolean | number;
  vice_skip_deceleration_point?: boolean | number;
  vice_skip_monitor_2m?: boolean | number;
  vice_skip_calibration_point?: boolean | number;

  // ===================== 8. 运行模式 (Boolean) =====================
  auto_run?: boolean | number;
  semi_auto_run?: boolean | number;
  manual_run?: boolean | number;
  simple_run?: boolean | number;
  repair_mode?: boolean | number;

  // ===================== 9. 操作状态 (Boolean) =====================
  lift_person?: boolean | number;
  lift_material?: boolean | number;
  heavy_load_down?: boolean | number;
  handle_zero_position?: boolean | number;

  // ===================== 10. 设备状态 (Boolean) =====================
  inverter_enable?: boolean | number;
  inverter_running?: boolean | number;
  main_fan_run?: boolean | number;
  external_water_cooling_run?: boolean | number;
  main_transformer_merge?: boolean | number;
  excitation_merge?: boolean | number;

  // ===================== 11. 故障与报警 (Boolean) =====================
  emergency_stop?: boolean | number;
  fault_stop?: boolean | number;
  fault_alarm?: boolean | number;
  primary_hoist_fault?: boolean | number;
  start_condition_insufficient?: boolean | number;

  // ===================== 12. 电气与液压数值 (Float) =====================
  motor_current?: number;
  excitation_current?: number;
  brake_oil_pressure?: number;
  brake_oil_temp?: number;
  load_weight?: number;
  wellhead_temp?: number;

  // ===================== 13. 信号位 (Boolean) =====================
  signal_0?: boolean | number;
  signal_2?: boolean | number;
  signal_3?: boolean | number;
  signal_4?: boolean | number;
  signal_5?: boolean | number;
}

// 压风机实时数据接口
export interface CompressorRealtimeData extends BaseRealtimeData {
  // 说明：后端新版本中，状态量为 Boolean，数值量为 Float。
  // 为兼容历史数据/不同序列化方式，这里对状态量使用 boolean | number (0/1)。

  // ===================== 1. 实时运行监测 (Float) =====================
  // 温度
  unit_exhaust_temp?: number;
  host_exhaust_temp?: number;
  air_tank_temp?: number;
  coolant_temp?: number;
  running_temp?: number;

  // 压力与真空
  exhaust_pressure?: number;
  separation_pressure?: number;
  separation_diff_pressure?: number;
  intake_vacuum?: number;

  // 电气参数
  current?: number;
  voltage?: number;

  // 振动
  host_vibration?: number;
  motor_vibration?: number;

  // 时间统计
  current_run_time?: number;
  host_run_time?: number;
  host_load_time?: number;

  // ===================== 2. 设备状态 (Boolean) =====================
  standby_status?: boolean | number;
  running_feedback?: boolean | number;
  fault_exist?: boolean | number;
  comm_status?: boolean | number;

  // 模式状态
  auto_manual_mode?: boolean | number;
  remote_mode?: boolean | number;
  local_mode?: boolean | number;
  load_unload_mode?: boolean | number;
  auto_toggle_status?: boolean | number;

  // ===================== 3. 控制指令 (Boolean) =====================
  start_btn?: boolean | number;
  stop_btn?: boolean | number;
  load_btn?: boolean | number;
  unload_btn?: boolean | number;
  auto_btn?: boolean | number;
  manual_btn?: boolean | number;
  auto_toggle_btn?: boolean | number;

  // ===================== 4. 排污阀系统 (混合类型) =====================
  drain_valve_open?: boolean | number;
  drain_valve_close?: boolean | number;
  drain_valve_manual_open_btn?: boolean | number;
  drain_valve_manual_close_btn?: boolean | number;
  drain_valve_manual_stop_btn?: boolean | number;
  drain_valve_mode_btn_status?: number;
  drain_valve_interval_setting?: number;
  drain_valve_duration_setting?: number;

  // ===================== 5. 保护设定与投退 (混合类型) =====================
  // 风包温度保护
  air_tank_temp_alarm_setting?: number;
  air_tank_temp_trip_setting?: number;
  air_tank_temp_protect_active?: boolean | number;
  air_tank_temp_protect_btn?: number;

  // 主机温度保护
  host_temp_alarm_setting?: number;
  host_temp_trip_setting?: number;
  host_temp_protect_active?: boolean | number;
  host_temp_protect_btn?: number;

  // 排气温度保护
  exhaust_temp_alarm_setting?: number;
  exhaust_temp_trip_setting?: number;
  exhaust_temp_protect_active?: boolean | number;
  exhaust_temp_protect_btn?: number;

  // 振动保护
  vibration_alarm_setting?: number;
  vibration_trip_setting?: number;
  vibration_protect_active?: boolean | number;
  vibration_protect_btn?: number;
}

// 通风机实时数据接口
export interface VentilatorRealtimeData extends BaseRealtimeData {
  // 通风机实时数据（新后端字段，Float -> number；Boolean -> boolean | number）

  // ===================== 1. 电机监测 (Float) =====================
  motor1_phase_a_temp?: number;
  motor1_phase_b_temp?: number;
  motor1_phase_c_temp?: number;
  motor1_north_axis_temp?: number;
  motor1_south_axis_temp?: number;
  motor1_vert_vibration?: number;
  motor1_horiz_vibration?: number;
  motor1_current?: number;
  motor1_voltage?: number;
  motor1_active_power?: number;

  motor2_phase_a_temp?: number;
  motor2_phase_b_temp?: number;
  motor2_phase_c_temp?: number;
  motor2_north_axis_temp?: number;
  motor2_south_axis_temp?: number;
  motor2_vert_vibration?: number;
  motor2_horiz_vibration?: number;
  motor2_current?: number;
  motor2_voltage?: number;
  motor2_active_power?: number;

  inverter_current?: number;
  inverter_freq?: number;

  // ===================== 2. 通风参数 (Float) =====================
  air_volume?: number;
  air_speed?: number;
  neg_pressure?: number;
  total_pressure?: number;

  // ===================== 3. 风门与执行机构 =====================
  side_door_opening?: number;
  side_door_open_limit?: boolean | number;
  side_door_close_limit?: boolean | number;
  side_door_opening_process?: boolean | number;
  side_door_closing_process?: boolean | number;

  air_door_opening?: number;
  air_door_open_limit?: boolean | number;
  air_door_close_limit?: boolean | number;
  air_door_open_fault?: boolean | number;
  air_door_close_fault?: boolean | number;

  horiz_door_opening_process?: boolean | number;
  horiz_door_closing_process?: boolean | number;

  fan_damper_open_fault?: boolean | number;
  fan_damper_close_fault?: boolean | number;
  fan_damper_alarm?: boolean | number;

  // ===================== 4. 运行状态与控制 (Boolean) =====================
  run_feedback?: boolean | number;
  inverter_run_feedback?: boolean | number;
  motor1_run_feedback?: boolean | number;
  motor2_run_feedback?: boolean | number;

  auto_mode?: boolean | number;
  manual_mode?: boolean | number;
  standby_mode?: boolean | number;
  exhaust_wind_mode?: boolean | number;
  reverse_wind_mode?: boolean | number;

  cmd_start?: boolean | number;
  cmd_stop?: boolean | number;
  cmd_switch?: boolean | number;
  cmd_reset?: boolean | number;
  cmd_mute?: boolean | number;
  system_estop?: boolean | number;

  // ===================== 5. 故障与报警 (Boolean) =====================
  general_alarm?: boolean | number;
  main_motor_alarm?: boolean | number;
  other_plc_fault?: boolean | number;
  oil_pump1_fault?: boolean | number;
  oil_pump2_fault?: boolean | number;
  lube_pressure_low?: boolean | number;
  lube_general_alarm?: boolean | number;

  stator_temp_alarm?: boolean | number;
  bearing_temp_alarm?: boolean | number;
  main_motor_bearing_alarm?: boolean | number;
  main_motor_bearing_warning?: boolean | number;

  motor_u1_rise_warn?: boolean | number;
  motor_v1_rise_warn?: boolean | number;
  motor_w1_rise_warn?: boolean | number;
  motor_front_axis_rise_warn?: boolean | number;
  motor_rear_axis_rise_warn?: boolean | number;
  front_axis_rise_warn_1?: boolean | number;
  front_axis_rise_warn_2?: boolean | number;
  bearing_rise_warn_1?: boolean | number;
  bearing_rise_warn_2?: boolean | number;

  bearing_vibration_alarm?: boolean | number;
  bearing_vibration_warning?: boolean | number;
  front_axis_vert_vib_rise_warn?: boolean | number;
  front_axis_horiz_vib_rise_warn?: boolean | number;
  rear_axis_vert_vib_rise_warn?: boolean | number;
  rear_axis_horiz_vib_rise_warn?: boolean | number;

  front_motor_remote_alarm?: boolean | number;
  rear_motor_remote_alarm?: boolean | number;

  // ===================== 6. 统计时间 (Float) =====================
  total_run_hours?: number;
  run_time_days?: number;
  run_time_hours?: number;
  run_time_minutes?: number;
  run_time_seconds?: number;
  stall_time_minutes?: number;
  stall_time_seconds?: number;

  // --------------------- 旧字段（兼容历史接口） ---------------------
  vfd_run_current?: number;
  vfd_run_feedback?: number;
  vfd_run_freq?: number;
  alarm?: number;
  standby?: number;
  exhaust_mode?: number;
  side_door_closed?: number;
  side_door_opened?: number;
}

// 排水机实时数据接口
export interface PumpRealtimeData extends BaseRealtimeData {
  // 排水机新后端字段（Float -> number；Boolean -> boolean | number；Int16/Integer -> number）
  current?: number;
  pos_pressure?: number;
  neg_pressure?: number;
  total_run_hours?: number;
  total_run_minutes?: number;

  motor_temp_u?: number;
  motor_temp_v?: number;
  motor_temp_w?: number;
  motor_front_axis_temp?: number;
  motor_rear_axis_temp?: number;
  pump_front_axis_temp?: number;
  pump_rear_axis_temp?: number;

  run_status?: boolean | number;
  run_feedback?: boolean | number;
  auto_starting?: boolean | number;
  auto_stopping?: boolean | number;
  remote_selected?: boolean | number;
  local_allow?: boolean | number;
  standby_status?: boolean | number;
  maintenance_status?: boolean | number;
  forbid_start?: boolean | number;

  total_fault?: boolean | number;
  start_fault?: boolean | number;
  stop_fault?: boolean | number;
  soft_start_fault?: boolean | number;
  current_abnormal?: boolean | number;
  pos_pressure_timeout?: boolean | number;
  neg_pressure_timeout?: boolean | number;
  motor_vert_vib_alert?: boolean | number;
  motor_horiz_vib_alert?: boolean | number;
  pump_vert_vib_alert?: boolean | number;
  pump_horiz_vib_alert?: boolean | number;

  cmd_start?: boolean | number;
  cmd_stop?: boolean | number;
  cmd_reset_time?: boolean | number;

  // 排水机特有数据字段
  // 电机相关
  voltage?: number;
  current_fault?: number;
  motor_phase_a_temp?: number;
  motor_phase_b_temp?: number;
  motor_phase_c_temp?: number;
  motor_vibration_1?: number;
  motor_vibration_2?: number;
  motor_overheat_fault?: number;

  // 泵相关
  pump_fault?: number;
  pump_emergency_fault?: number;
  pump_vibration_1?: number;
  pump_vibration_2?: number;
  pump_overheat_fault?: number;
  pump_run_feedback?: number;

  // 压力相关
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
  device_stop_status?: number;
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
  // ===================== A. 基础运行状态 =====================
  is_running?: boolean;          // 运行标志
  has_power?: boolean;           // 有无电源
  belt_speed?: number;           // 皮带速度(m/s)
  belt_tension?: number;         // 皮带张力(N)

  // 控制模式
  is_remote_control?: boolean;   // 集控模式
  is_local_control?: boolean;    // 就地模式
  is_maintenance_mode?: boolean; // 检修模式

  // ===================== B. 电机监测 (支持多电机) =====================
  // --- 1号电机 ---
  motor_current_1?: number; // 1号电机电流(A)
  motor_temp_1?: number;    // 1号电机温度(℃)
  motor_overheat_1?: boolean; // 1号电机超温报警
  motor_running_1?: boolean;  // 1号电机运行状态

  // --- 2号电机 ---
  motor_current_2?: number; // 2号电机电流(A)
  motor_temp_2?: number;    // 2号电机温度(℃)
  motor_overheat_2?: boolean; // 2号电机超温报警
  motor_running_2?: boolean;  // 2号电机运行状态

  // --- 3号电机 ---
  motor_current_3?: number; // 3号电机电流(A)
  motor_temp_3?: number;    // 3号电机温度(℃)
  motor_overheat_3?: boolean; // 3号电机超温报警
  motor_running_3?: boolean;  // 3号电机运行状态

  // ===================== C. 滚筒与制动 =====================
  drum_temp?: number;         // 滚筒温度(℃)
  drum_overheat?: boolean;    // 滚筒超温报警
  brake_status?: boolean;     // 闸松闸状态(True为松闸/运行)
  brake_fault?: boolean;      // 闸故障

  // ===================== D. 安全保护 (报警状态) =====================
  smoke_alarm?: boolean;       // 烟雾保护
  tear_alarm?: boolean;        // 纵撕/撕裂保护
  deviation_alarm?: boolean;   // 跑偏保护
  coal_piling_alarm?: boolean; // 堆煤保护
  skid_alarm?: boolean;        // 打滑保护
  emergency_stop?: boolean;    // 急停标识

  // ===================== E. 关联设备 (给煤机) =====================
  feeder_running?: boolean;    // 给煤机运行
  feeder_coal_level?: number;  // 给煤机煤位
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

// 查询变量历史数据请求参数接口
export interface GetEquipmentHistoryVariableParams {
  // 设备编号
  equipment_code: string;
  // 查询变量
  query_variable: string;
  // 开始时间 (YYYY-MM-DD HH:MM:SS)
  start_time: string;
  // 结束时间 (YYYY-MM-DD HH:MM:SS)
  end_time: string;
}

// 历史变量数据点
export interface HistoryVariablePoint {
  // 收集时间
  collected_at: string;
  // 变量值
  value: number | string | boolean;
}

// 查询变量历史数据响应数据
export interface GetEquipmentHistoryVariableData {
  equipment_code: string;
  query_variable: string;
  start_time: string;
  end_time: string;
  total: number;
  history: HistoryVariablePoint[];
}

// 查询变量历史数据响应类型
export type GetEquipmentHistoryVariableResponse = IApiResponseData<GetEquipmentHistoryVariableData>;





