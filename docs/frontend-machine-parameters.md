# 前端五大机器界面显示参数汇总

> 整理时间：2026-07-02
> 数据来源：前端 Vue 组件代码 (`src/views/Dashboard/*/index.vue`) 及 TypeScript 类型定义 (`src/api/device/types/device.ts`)

---

## 目录

1. [提升机（Hoist）](#1-提升机hoist)
2. [压风机（Air Compressor）](#2-压风机air-compressor)
3. [通风机（Ventilation Fan）](#3-通风机ventilation-fan)
4. [排水泵（Drainage Pump）](#4-排水泵drainage-pump)
5. [皮带机（Belt Conveyor）](#5-皮带机belt-conveyor)

---

## 1. 提升机（Hoist）

| 属性 | 值 |
|------|-----|
| **页面名称** | 提升机孪生平台 |
| **路由路径** | `/dashboard/tisheng` |
| **设备编码** | TS001（1台） |
| **Unity 场景** | `/NewElevator/Build/NewElevator` |
| **源文件** | `src/views/Dashboard/tisheng/index.vue` |

### 左侧面板：提升机实时数据（数值型参数）

| 序号 | 参数名称 | 字段 Key | 单位 |
|------|----------|----------|------|
| 1 | 主箕斗提升速度 | `main_skip_speed` | m/s |
| 2 | 主箕斗提升位置 | `main_skip_pos` | m |
| 3 | 副箕斗提升速度 | `vice_skip_speed` | m/s |
| 4 | 副箕斗提升位置 | `vice_skip_pos` | m |
| 5 | 定子电流 | `stator_current` | A |
| 6 | 励磁电流 | `excitation_current` | A |
| 7 | 进线电压 | `incoming_voltage` | V |
| 8 | 制动油压 | `brake_oil_pressure` | MPa |
| 9 | 电机温度1 | `motor_temp_1` | °C |
| 10 | 电机温度2 | `motor_temp_2` | °C |
| 11 | 电机温度3 | `motor_temp_3` | °C |
| 12 | 电机温度4 | `motor_temp_4` | °C |
| 13 | 电机温度5 | `motor_temp_5` | °C |
| 14 | 电机温度6 | `motor_temp_6` | °C |
| 15 | 轴承温度1 | `bearing_temp_1` | °C |
| 16 | 轴承温度2 | `bearing_temp_2` | °C |
| 17 | 轴承温度3 | `bearing_temp_3` | °C |
| 18 | 轴承温度4 | `bearing_temp_4` | °C |

> 共 **18** 个数值型参数

### 右侧面板：运行参数（布尔型状态）

#### 运行模式设置（7项）

| 序号 | 参数名称 | 字段 Key | 显示 |
|------|----------|----------|------|
| 1 | 自动模式 | `mode_auto` | 是/否 |
| 2 | 半自动模式 | `mode_semi_auto` | 是/否 |
| 3 | 手动模式 | `mode_manual` | 是/否 |
| 4 | 检修模式 | `mode_repair` | 是/否 |
| 5 | 提煤模式 | `mode_lift_coal` | 是/否 |
| 6 | 重物下放模式 | `mode_heavy_down` | 是/否 |
| 7 | 轻载模式 | `mode_light_load` | 是/否 |

#### 运行状态反馈（7项）

| 序号 | 参数名称 | 字段 Key | 显示 |
|------|----------|----------|------|
| 8 | 上行状态 | `status_moving_up` | 是/否 |
| 9 | 下行状态 | `status_moving_down` | 是/否 |
| 10 | 慢上状态 | `status_slow_up` | 是/否 |
| 11 | 慢下状态 | `status_slow_down` | 是/否 |
| 12 | 停车状态 | `status_stopped` | 是/否 |
| 13 | 运行方向已确定 | `dir_confirmed` | 是/否 |
| 14 | 主风机运行 | `main_fan_run` | 是/否 |

#### 离散速度反馈（5项）

| 序号 | 参数名称 | 字段 Key | 显示 |
|------|----------|----------|------|
| 15 | 速度反馈0.5m/s | `speed_fb_half` | 是/否 |
| 16 | 速度反馈2m/s | `speed_fb_2` | 是/否 |
| 17 | 速度反馈4m/s | `speed_fb_4` | 是/否 |
| 18 | 速度反馈6m/s | `speed_fb_6` | 是/否 |
| 19 | 速度反馈12m/s | `speed_fb_12` | 是/否 |

#### 关键位置节点 - 1#系统/主箕斗（6项）

| 序号 | 参数名称 | 字段 Key | 显示 |
|------|----------|----------|------|
| 20 | 1系统过卷点 | `pos_1_overwind` | 是/否 |
| 21 | 1系统停车点 | `pos_1_stop` | 是/否 |
| 22 | 1系统减速点 | `pos_1_decelerate` | 是/否 |
| 23 | 1系统2m/s检查点 | `pos_1_monitor_2m` | 是/否 |
| 24 | 1系统同步校正点 | `pos_1_sync_calib` | 是/否 |
| 25 | 箕斗1在卸载位 | `skip_1_unload_pos` | 是/否 |

#### 关键位置节点 - 2#系统/副箕斗（6项）

| 序号 | 参数名称 | 字段 Key | 显示 |
|------|----------|----------|------|
| 26 | 2系统过卷点 | `pos_2_overwind` | 是/否 |
| 27 | 2系统停车点 | `pos_2_stop` | 是/否 |
| 28 | 2系统减速点 | `pos_2_decelerate` | 是/否 |
| 29 | 2系统2m/s检查点 | `pos_2_monitor_2m` | 是/否 |
| 30 | 2系统同步校正点 | `pos_2_sync_calib` | 是/否 |
| 31 | 箕斗2在卸载位 | `skip_2_unload_pos` | 是/否 |

#### 核心操作与回路状态（6项）

| 序号 | 参数名称 | 字段 Key | 显示 |
|------|----------|----------|------|
| 32 | 总安全回路已合 | `loop_safety_closed` | 是/否 |
| 33 | 闭锁回路已合 | `loop_lock_closed` | 是/否 |
| 34 | 停车回路已合 | `loop_stop_closed` | 是/否 |
| 35 | 速度手柄零位 | `handle_speed_zero` | 是/否 |
| 36 | 闸手柄零位 | `handle_brake_zero` | 是/否 |
| 37 | 操作台闭锁 | `console_lock` | 是/否 |

#### 综合故障与报警（11项，true=正常/false=故障）

| 序号 | 参数名称 | 字段 Key | 显示 |
|------|----------|----------|------|
| 38 | 操作台急停 | `fault_emergency_stop` | 正常/故障 |
| 39 | 通讯故障 | `fault_comm` | 正常/故障 |
| 40 | 低压故障 | `fault_low_voltage` | 正常/故障 |
| 41 | 高压故障 | `fault_high_voltage` | 正常/故障 |
| 42 | 电机超载 | `fault_motor_overload` | 正常/故障 |
| 43 | 电机超速 | `fault_motor_overspeed` | 正常/故障 |
| 44 | 温度报警综合 | `fault_temp_alarm` | 正常/故障 |
| 45 | 温度故障综合 | `fault_temp_error` | 正常/故障 |
| 46 | 闸瓦磨损 | `fault_brake_wear` | 正常/故障 |
| 47 | 闸盘偏摆 | `fault_brake_deflection` | 正常/故障 |
| 48 | 卡箕斗故障 | `fault_skip_jam` | 正常/故障 |

> 右侧共 **48** 个布尔型状态参数

---

## 2. 压风机（Air Compressor）

| 属性 | 值 |
|------|-----|
| **页面名称** | 压风机孪生平台 |
| **路由路径** | `/dashboard/yafeng` |
| **设备编码** | YF001 ~ YF007（7台） |
| **Unity 场景** | `/CompressorFan/Build/CompressorFan` |
| **源文件** | `src/views/Dashboard/yafeng/index.vue` |

> 底部横向排列 7 张机组卡片，每张卡片显示以下分组参数：

### 实时运行监测（温度）— 数值型

| 序号 | 参数名称 | 字段 Key | 单位 |
|------|----------|----------|------|
| 1 | 机组排气温度 | `unit_exhaust_temp` | °C |
| 2 | 主机排气温度 | `host_exhaust_temp` | °C |
| 3 | 风包温度 | `air_tank_temp` | °C |
| 4 | 运行温度 | `running_temp` | °C |

### 实时运行监测（压力/真空）— 数值型

| 序号 | 参数名称 | 字段 Key | 单位 |
|------|----------|----------|------|
| 5 | 排气压力 | `exhaust_pressure` | MPa |
| 6 | 分离压力 | `separation_pressure` | MPa |

### 实时运行监测（电气/振动/时间）— 数值型

| 序号 | 参数名称 | 字段 Key | 单位 |
|------|----------|----------|------|
| 7 | 电压 | `voltage` | V |
| 8 | 电流 | `current` | A |
| 9 | 主机振动 | `host_vibration` | mm/s |
| 10 | 电机振动 | `motor_vibration` | mm/s |
| 11 | 当次运行时间 | `current_run_time` | h |
| 12 | 主机运行时间 | `host_run_time` | h |
| 13 | 主机加载时间 | `host_load_time` | h |

### 设备/模式状态 — 布尔型

| 序号 | 参数名称 | 字段 Key | 显示 |
|------|----------|----------|------|
| 14 | 待机状态 | `standby_status` | 开/关 |
| 15 | 运行反馈 | `running_feedback` | 开/关 |
| 16 | 故障存在 | `fault_exist` | 开/关 |
| 17 | 通信状态 | `comm_status` | 开/关 |
| 18 | 远控模式 | `remote_mode` | 开/关 |
| 19 | 就地模式 | `local_mode` | 开/关 |
| 20 | 加卸载模式 | `load_unload_mode` | 开/关 |
| 21 | 自动投退状态 | `auto_toggle_status` | 开/关 |

### 控制指令 — 布尔型

| 序号 | 参数名称 | 字段 Key | 显示 |
|------|----------|----------|------|
| 22 | 启动按钮 | `start_btn` | 开/关 |
| 23 | 停止按钮 | `stop_btn` | 开/关 |
| 24 | 自动投退按钮 | `auto_toggle_btn` | 开/关 |

### 排污阀系统 — 混合型

| 序号 | 参数名称 | 字段 Key | 类型 |
|------|----------|----------|------|
| 25 | 排污阀开状态 | `drain_valve_open` | 布尔 |
| 26 | 排污阀关状态 | `drain_valve_close` | 布尔 |
| 27 | 排污阀手动开按钮 | `drain_valve_manual_open_btn` | 布尔 |
| 28 | 排污阀手动关按钮 | `drain_valve_manual_close_btn` | 布尔 |
| 29 | 排污阀手动停按钮 | `drain_valve_manual_stop_btn` | 布尔 |
| 30 | 排污阀手自动按钮状态 | `drain_valve_mode_btn_status` | 数值 |
| 31 | 排污阀时间间隔设定 | `drain_valve_interval_setting` | 数值 |
| 32 | 排污阀时长设定 | `drain_valve_duration_setting` | 数值 |

### 保护设定与投退 — 混合型（4组 × 4项 = 16项）

#### 风包温度保护

| 序号 | 参数名称 | 字段 Key | 类型 |
|------|----------|----------|------|
| 33 | 风包温度报警值设定 | `air_tank_temp_alarm_setting` | 数值(°C) |
| 34 | 风包温度跳闸值设定 | `air_tank_temp_trip_setting` | 数值(°C) |
| 35 | 风包温度保护投退状态 | `air_tank_temp_protect_active` | 布尔 |
| 36 | 风包温度保护投退按钮 | `air_tank_temp_protect_btn` | 数值 |

#### 主机温度保护

| 序号 | 参数名称 | 字段 Key | 类型 |
|------|----------|----------|------|
| 37 | 主机温度报警值设定 | `host_temp_alarm_setting` | 数值(°C) |
| 38 | 主机温度跳闸值设定 | `host_temp_trip_setting` | 数值(°C) |
| 39 | 主机温度保护投退状态 | `host_temp_protect_active` | 布尔 |
| 40 | 主机温度保护投退按钮 | `host_temp_protect_btn` | 数值 |

#### 排气温度保护

| 序号 | 参数名称 | 字段 Key | 类型 |
|------|----------|----------|------|
| 41 | 排气温度报警值设定 | `exhaust_temp_alarm_setting` | 数值(°C) |
| 42 | 排气温度跳闸值设定 | `exhaust_temp_trip_setting` | 数值(°C) |
| 43 | 排气温度保护投退状态 | `exhaust_temp_protect_active` | 布尔 |
| 44 | 排气温度保护投退按钮 | `exhaust_temp_protect_btn` | 数值 |

#### 振动保护

| 序号 | 参数名称 | 字段 Key | 类型 |
|------|----------|----------|------|
| 45 | 振动报警值设定 | `vibration_alarm_setting` | 数值(mm/s) |
| 46 | 振动跳闸值设定 | `vibration_trip_setting` | 数值(mm/s) |
| 47 | 振动保护投退状态 | `vibration_protect_active` | 布尔 |
| 48 | 振动保护投退按钮 | `vibration_protect_btn` | 数值 |

> 每台机组共 **48** 个参数，7台合计 **336** 个参数槽位

---

## 3. 通风机（Ventilation Fan）

| 属性 | 值 |
|------|-----|
| **页面名称** | 通风机孪生平台 |
| **路由路径** | `/dashboard/tongfeng` |
| **设备编码** | TF001、TF002（2台） |
| **Unity 场景** | `/airMachine/Build/airMachine` |
| **源文件** | `src/views/Dashboard/tongfeng/index.vue` |

> 左侧面板显示 TF001，右侧面板显示 TF002，结构完全相同。

### 通风参数 / 变频 — 数值型

| 序号 | 参数名称 | 字段 Key | 单位 |
|------|----------|----------|------|
| 1 | 风速 | `air_speed` | m/s |
| 2 | 风量 | `air_volume` | m³/s |
| 3 | 全压 | `total_pressure` | Pa |
| 4 | 负压 | `neg_pressure` | Pa |
| 5 | 变频频率 | `inverter_freq` | Hz |
| 6 | 变频电流 | `inverter_current` | A |

### 1级电机 — 数值型

| 序号 | 参数名称 | 字段 Key | 单位 |
|------|----------|----------|------|
| 7 | 电压 | `motor1_voltage` | V |
| 8 | 电流 | `motor1_current` | A |
| 9 | 有功 | `motor1_active_power` | kW |
| 10 | 垂直振动 | `motor1_vert_vibration` | mm/s |
| 11 | 水平振动 | `motor1_horiz_vibration` | mm/s |
| 12 | 北轴温度 | `motor1_north_axis_temp` | ℃ |

### 2级电机 — 数值型

| 序号 | 参数名称 | 字段 Key | 单位 |
|------|----------|----------|------|
| 13 | 电压 | `motor2_voltage` | V |
| 14 | 电流 | `motor2_current` | A |
| 15 | 有功 | `motor2_active_power` | kW |
| 16 | 垂直振动 | `motor2_vert_vibration` | mm/s |
| 17 | 水平振动 | `motor2_horiz_vibration` | mm/s |
| 18 | 北轴温度 | `motor2_north_axis_temp` | ℃ |

### 运行状态 — 布尔型

| 序号 | 参数名称 | 字段 Key | 显示 |
|------|----------|----------|------|
| 19 | 变频运行 | `inverter_run_feedback` | 是/否 |
| 20 | 自动 | `auto_mode` | 是/否 |
| 21 | 手动 | `manual_mode` | 是/否 |
| 22 | 待机 | `standby_mode` | 是/否 |
| 23 | 抽风 | `exhaust_wind_mode` | 是/否 |

### 报警 / 故障 — 布尔型（true=正常/false=报警）

| 序号 | 参数名称 | 字段 Key | 显示 |
|------|----------|----------|------|
| 24 | 报警 | `general_alarm` | 正常/报警 |
| 25 | 主电机报警 | `main_motor_alarm` | 正常/报警 |
| 26 | 润滑站报警 | `lube_general_alarm` | 正常/报警 |
| 27 | 定子温度报警 | `stator_temp_alarm` | 正常/报警 |
| 28 | 主轴承温度报警 | `bearing_temp_alarm` | 正常/报警 |

> 每台通风机 **28** 个参数，2台合计 **56** 个参数

---

## 4. 排水泵（Drainage Pump）

| 属性 | 值 |
|------|-----|
| **页面名称** | 排水泵孪生平台 |
| **路由路径** | `/dashboard/paishui` |
| **设备编码** | PS001、PS002、PS003（3台） |
| **Unity 场景** | `/waterMachine/Build/waterMachine` |
| **源文件** | `src/views/Dashboard/paishui/index.vue` |

> 底部横向排列 3 张泵卡片，每张卡片显示以下参数：

### 电气与压力参数 — 数值型

| 序号 | 参数名称 | 字段 Key | 单位 |
|------|----------|----------|------|
| 1 | 电流 | `current` | A |
| 2 | 正压 | `pos_pressure` | MPa |
| 3 | 负压 | `neg_pressure` | MPa |
| 4 | 累计运行 | `total_run_hours` + `total_run_minutes` | h/m (组合显示) |

### 温度监测 — 数值型

| 序号 | 参数名称 | 字段 Key | 单位 |
|------|----------|----------|------|
| 5 | 电机U温 | `motor_temp_u` | ℃ |
| 6 | 电机V温 | `motor_temp_v` | ℃ |
| 7 | 电机W温 | `motor_temp_w` | ℃ |
| 8 | 电机前轴温 | `motor_front_axis_temp` | ℃ |
| 9 | 电机后轴温 | `motor_rear_axis_temp` | ℃ |
| 10 | 水泵前轴温 | `pump_front_axis_temp` | ℃ |
| 11 | 水泵后轴温 | `pump_rear_axis_temp` | ℃ |

### 运行状态 — 布尔型

| 序号 | 参数名称 | 字段 Key | 显示 |
|------|----------|----------|------|
| 12 | 运行状态 | `run_status` | 是/否 |
| 13 | 运行反馈 | `run_feedback` | 是/否 |
| 14 | 备用 | `standby_status` | 是/否 |
| 15 | 检修 | `maintenance_status` | 是/否 |
| 16 | 禁起 | `forbid_start` | 是/否 |
| 17 | 总故障 | `total_fault` | 是/否 |

> 每台泵 **17** 个参数（页面显示），3台合计 **51** 个参数

---

## 5. 皮带机（Belt Conveyor）

| 属性 | 值 |
|------|-----|
| **页面名称** | 皮带机孪生平台 |
| **路由路径** | `/dashboard/yunshu` |
| **设备编码** | YS001（1台） |
| **Unity 场景** | `/Belt/Build/Belt` |
| **源文件** | `src/views/Dashboard/yunshu/index.vue` |

### 左侧面板：基本运行数据 — 数值型

| 序号 | 参数名称 | 字段 Key | 单位 |
|------|----------|----------|------|
| 1 | 皮带速度 | `belt_speed` | m/s |
| 2 | 皮带张力 | `belt_tension` | kN |
| 3 | 煤仓空高 | `coal_bunker_level` | m |
| 4 | 1#电机温度 | `motor_1_temp` | °C |
| 5 | 2#电机温度 | `motor_2_temp` | °C |
| 6 | 1#滚筒温度 | `drum_1_temp` | °C |
| 7 | 2#滚筒温度 | `drum_2_temp` | °C |

> 共 **7** 个数值型参数

### 右侧面板：监测状态数据

#### 系统控制状态 — 布尔型

| 序号 | 参数名称 | 字段 Key | 类型 |
|------|----------|----------|------|
| 8 | 系统总故障 | `general_fault` | 报警类（1=故障） |
| 9 | 松闸状态 | `brake_released` | 状态类（1=松闸） |
| 10 | 集控模式 | `mode_remote` | 状态类（1=集控） |
| 11 | 检修模式 | `mode_maintenance` | 状态类（1=检修） |
| 12 | 就地模式 | `mode_local` | 状态类（1=就地） |
| 13 | 手动模式 | `mode_manual` | 状态类（1=手动） |
| 14 | 给煤机运行 | `feeder_running` | 状态类（1=运行） |
| 15 | 水冷1运行 | `water_cooling_1_running` | 状态类（1=运行） |
| 16 | 水冷2运行 | `water_cooling_2_running` | 状态类（1=运行） |

#### 电机运行监测 — 布尔型

| 序号 | 参数名称 | 字段 Key | 类型 |
|------|----------|----------|------|
| 17 | 1#电机运行 | `motor_1_running` | 状态类（1=运行） |
| 18 | 1#电机超温 | `fault_motor_1_overheat` | 报警类（1=超温） |
| 19 | 2#电机运行 | `motor_2_running` | 状态类（1=运行） |
| 20 | 2#电机超温 | `fault_motor_2_overheat` | 报警类（1=超温） |

#### 安全保护与故障 — 布尔型（报警类）

| 序号 | 参数名称 | 字段 Key | 说明 |
|------|----------|----------|------|
| 21 | 滚筒超温 | `fault_drum_overheat` | 1=超温 |
| 22 | 闸返回故障 | `fault_brake_return` | 1=故障 |
| 23 | 皮带返回故障 | `fault_belt_return` | 1=故障 |
| 24 | 张力故障 | `fault_tension` | 1=故障 |
| 25 | 堆煤保护 | `fault_coal_piling` | 1=堆煤 |
| 26 | 烟雾保护 | `fault_smoke` | 1=烟雾 |
| 27 | 纵撕保护 | `fault_tear` | 1=纵撕 |
| 28 | 跑偏保护 | `fault_deviation` | 1=跑偏 |
| 29 | 打滑保护 | `fault_skid` | 1=打滑 |
| 30 | 拉线故障 | `fault_pull_cord` | 1=拉线 |
| 31 | 集控急停 | `emergency_stop_remote` | 1=急停 |
| 32 | 操作台急停 | `emergency_stop_console` | 1=急停 |

> 共 **32** 个参数

---

## 汇总统计

| 设备 | 设备编码 | 台数 | 数值型参数 | 布尔型参数 | 参数小计(每台) | 页面总参数 |
|------|----------|------|-----------|-----------|-------------|-----------|
| 提升机 | TS001 | 1 | 18 | 48 | 66 | **66** |
| 压风机 | YF001~YF007 | 7 | 25 | 23 | 48 | **336** |
| 通风机 | TF001~TF002 | 2 | 18 | 10 | 28 | **56** |
| 排水泵 | PS001~PS003 | 3 | 11 | 6 | 17 | **51** |
| 皮带机 | YS001 | 1 | 7 | 25 | 32 | **32** |
| **合计** | — | **14台** | — | — | — | **541** |

### 参数类型分布

| 类型 | 数量 | 说明 |
|------|------|------|
| 数值型（模拟量） | — | 温度、压力、电流、电压、速度、振动、位置、时间等 |
| 布尔型（状态量） | — | 运行状态、模式、故障报警、保护投退等 |
| 布尔型（故障量） | — | 故障类参数采用反逻辑：true=正常，false=故障 |

### 通用架构特点

- **所有界面**均采用 Vue 3 + TypeScript + Element Plus 技术栈
- **所有界面**均集成 Unity WebGL 3D 数字孪生模型
- **数据刷新**：通过 `getRealtimeDataApi(equipment_code)` 轮询获取，间隔 1~3 秒
- **数据桥接**：Vue → Unity 通过 `SendMessage` 传递格式化字符串
- **页面布局**：居中 3D 模型 + 浮层数据面板（左右或底部）
