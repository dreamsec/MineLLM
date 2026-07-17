export interface SafetyMonitorSensor {
  sensor_code: string
  sensor_name: string | null
  sensor_type: string | null
  sensor_category: string | null
  value: number | null
  unit: string | null
  status_code: string | null
  monitor_time: string | null
}

export interface SafetyMonitorStationRealtime {
  station_code: string
  station_name: string
  sensor_count: number
  latest_time: string | null
  sensors: SafetyMonitorSensor[]
}

export type GetSafetyMonitorRealtimeResponse =
  IApiResponseData<SafetyMonitorStationRealtime | null>
