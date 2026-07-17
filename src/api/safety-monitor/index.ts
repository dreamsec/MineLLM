import { request } from '@/utils/service'
import { buildSafetyMonitorRealtimeRequest } from './request'
import type {
  GetSafetyMonitorRealtimeResponse,
} from './types/safetyMonitor'

/** 查询指定安全监测分站中每个传感器的最新数据。 */
export function getSafetyMonitorRealtimeApi(
  stationCode: string,
  types?: readonly string[],
  signal?: AbortSignal,
) {
  return request<GetSafetyMonitorRealtimeResponse>(
    buildSafetyMonitorRealtimeRequest(stationCode, types, signal),
  )
}

export type {
  GetSafetyMonitorRealtimeResponse,
  SafetyMonitorSensor,
  SafetyMonitorStationRealtime,
} from './types/safetyMonitor'
