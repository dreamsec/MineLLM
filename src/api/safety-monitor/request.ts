import { buildSensorTypesParam } from '../../utils/safetyMonitor.ts'

/** 构造实时数据请求配置，便于单独验证筛选参数和站点编码。 */
export function buildSafetyMonitorRealtimeRequest(
  stationCode: string,
  types?: readonly string[],
  signal?: AbortSignal,
) {
  const typesParam = buildSensorTypesParam(types)

  return {
    url: `/api/v1/safety-monitor/stations/${encodeURIComponent(stationCode)}/realtime`,
    method: 'get' as const,
    params: typesParam ? { types: typesParam } : undefined,
    silent: true,
    ...(signal ? { signal } : {}),
  }
}
