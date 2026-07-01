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

  // ===================== 2. 轴承温度监测 (Float) =====================
  bearing_temp_1?: number;
  bearing_temp_2?: number;
  bearing_temp_3?: number;
  bearing_temp_4?: number;

  // ===================== 3. 模拟量核心运行数据 (Float) =====================
  main_skip_speed?: number;
  main_skip_pos?: number;
  vice_skip_speed?: number;
  vice_skip_pos?: number;
  stator_current?: number;
  excitation_current?: number;
  incoming_voltage?: number;
  brake_oil_pressure?: number;

  // ===================== 4. 运行模式设置 (Boolean) =====================
  mode_auto?: boolean | number;
  mode_semi_auto?: boolean | number;
  mode_manual?: boolean | number;
  mode_repair?: boolean | number;
  mode_lift_coal?: boolean | number;
  mode_heavy_down?: boolean | number;
  mode_light_load?: boolean | number;

  // ===================== 5. 运行状态反馈 (Boolean) =====================
  status_moving_up?: boolean | number;
  status_moving_down?: boolean | number;
  status_slow_up?: boolean | number;
  status_slow_down?: boolean | number;
  status_stopped?: boolean | number;
  dir_confirmed?: boolean | number;
  main_fan_run?: boolean | number;

  // ===================== 6. 离散速度反馈 (Boolean) =====================
  speed_fb_half?: boolean | number;
  speed_fb_2?: boolean | number;
  speed_fb_4?: boolean | number;
  speed_fb_6?: boolean | number;
  speed_fb_12?: boolean | number;

  // ===================== 7. 关键位置节点 (Boolean) =====================
  pos_1_overwind?: boolean | number;
  pos_1_stop?: boolean | number;
  pos_1_decelerate?: boolean | number;
  pos_1_monitor_2m?: boolean | number;
  pos_1_sync_calib?: boolean | number;
  skip_1_unload_pos?: boolean | number;
  pos_2_overwind?: boolean | number;
  pos_2_stop?: boolean | number;
  pos_2_decelerate?: boolean | number;
  pos_2_monitor_2m?: boolean | number;
  pos_2_sync_calib?: boolean | number;
  skip_2_unload_pos?: boolean | number;

  // ===================== 8. 核心操作与回路状态 (Boolean) =====================
  loop_safety_closed?: boolean | number;
  loop_lock_closed?: boolean | number;
  loop_stop_closed?: boolean | number;
  handle_speed_zero?: boolean | number;
  handle_brake_zero?: boolean | number;
  console_lock?: boolean | number;

  // ===================== 9. 综合故障与报警 (Boolean) =====================
  fault_emergency_stop?: boolean | number;
  fault_comm?: boolean | number;
  fault_low_voltage?: boolean | number;
  fault_high_voltage?: boolean | number;
  fault_motor_overload?: boolean | number;
  fault_motor_overspeed?: boolean | number;
  fault_temp_alarm?: boolean | number;
  fault_temp_error?: boolean | number;
  fault_brake_wear?: boolean | number;
  fault_brake_deflection?: boolean | number;
  fault_skip_jam?: boolean | number;
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
  running_temp?: number;

  // 压力与真空
  exhaust_pressure?: number;
  separation_pressure?: number;

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
  remote_mode?: boolean | number;
  local_mode?: boolean | number;
  load_unload_mode?: boolean | number;
  auto_toggle_status?: boolean | number;

  // ===================== 3. 控制指令 (Boolean) =====================
  start_btn?: boolean | number;
  stop_btn?: boolean | number;
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
  // 1. 核心运行数据
  belt_speed?: number;           // 皮带速度
  belt_tension?: number;         // 皮带张力
  coal_bunker_level?: number;    // 煤仓空高

  // 2. 温度监测
  motor_1_temp?: number;         // 电机1温度
  motor_2_temp?: number;         // 电机2温度
  drum_1_temp?: number;          // 滚筒1温度
  drum_2_temp?: number;          // 滚筒2温度

  // 3. 控制模式
  mode_remote?: boolean;         // 集控状态
  mode_local?: boolean;          // 就地状态
  mode_maintenance?: boolean;    // 检修状态
  mode_manual?: boolean;         // 手动状态

  // 4. 运行与设备反馈
  motor_1_running?: boolean;     // 电机1返回
  motor_2_running?: boolean;     // 电机2返回
  brake_released?: boolean;      // 松闸返回
  water_cooling_1_running?: boolean; // 水冷1返回
  water_cooling_2_running?: boolean; // 水冷2返回
  feeder_running?: boolean;      // 给煤机电机返回

  // 5. 综合报警与急停
  general_fault?: boolean;       // 总故障
  emergency_stop_console?: boolean; // 操作台急停
  emergency_stop_remote?: boolean;  // 集控急停

  // 6. 皮带六大保护故障
  fault_smoke?: boolean;         // 烟雾故障
  fault_tear?: boolean;          // 纵撕故障
  fault_deviation?: boolean;     // 跑偏故障
  fault_coal_piling?: boolean;   // 堆煤故障
  fault_skid?: boolean;          // 打滑故障
  fault_pull_cord?: boolean;     // 拉线故障

  // 7. 机械与电气过载故障
  fault_motor_1_overheat?: boolean; // 电机1超温
  fault_motor_2_overheat?: boolean; // 电机2超温
  fault_drum_overheat?: boolean;    // 滚筒超温故障
  fault_brake_return?: boolean;     // 闸返回故障
  fault_belt_return?: boolean;      // 皮带返回故障
  fault_tension?: boolean;          // 张力故障
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

import type {
  EquipmentThresholdType,
  ThresholdApiData,
  ThresholdPayload,
} from '@/constants/equipmentThreshold'

// 设备阈值数据：后端字段较多，具体字段由设备类型配置决定
export type EquipmentThresholdData = ThresholdApiData

// 保存阈值时只提交用户填写过的上下限字段
export type UpsertEquipmentThresholdRequestParams = Partial<ThresholdPayload>

export type UpsertEquipmentThresholdResponseData = IApiResponseData<EquipmentThresholdData>

export type GetEquipmentThresholdResponseData = IApiResponseData<EquipmentThresholdData | null>

export interface GetEquipmentThresholdListRequestParams {
  equipment_type?: EquipmentThresholdType | ''
  page?: number
  page_size?: number
}

export type GetEquipmentThresholdListResponseData = IApiResponseData<{
  total: number
  list: EquipmentThresholdData[]
}>

export type DeleteEquipmentThresholdResponseData = IApiResponseData<null>



