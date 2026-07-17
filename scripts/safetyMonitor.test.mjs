import assert from 'node:assert/strict'

const {
  DEFAULT_SAFETY_MONITOR_STATION_CODE,
  RECOMMENDED_SAFETY_SENSOR_TYPES,
  buildSensorTypesParam,
  filterSafetySensors,
  formatSafetyMonitorTime,
  formatSafetySensorValue,
  getSafetySensorTone,
  groupSafetySensorsByType,
  normalizeSensorTypes,
} = await import('../src/utils/safetyMonitor.ts')

assert.equal(DEFAULT_SAFETY_MONITOR_STATION_CODE, '24080000000043')
assert.deepEqual(
  RECOMMENDED_SAFETY_SENSOR_TYPES,
  ['激光甲烷', '粉尘', '环境温度'],
)

assert.deepEqual(
  normalizeSensorTypes([' 激光甲烷 ', '粉尘', '激光甲烷', ' ', '环境温度']),
  ['激光甲烷', '粉尘', '环境温度'],
)
assert.equal(
  buildSensorTypesParam([' 激光甲烷 ', '粉尘', '激光甲烷']),
  '激光甲烷,粉尘',
)
assert.equal(buildSensorTypesParam([]), undefined)

const methaneSensor = {
  sensor_code: 'MN001',
  sensor_name: '切眼甲烷',
  sensor_type: '激光甲烷',
}
const unknownSensor = {
  sensor_code: 'MN002',
  sensor_name: null,
  sensor_type: null,
}
assert.deepEqual(
  groupSafetySensorsByType([methaneSensor, unknownSensor]),
  {
    激光甲烷: [methaneSensor],
    未知类型: [unknownSensor],
  },
)

assert.equal(formatSafetySensorValue(0), '0')
assert.equal(formatSafetySensorValue(0.05), '0.05')
assert.equal(formatSafetySensorValue(null), '--')
assert.equal(formatSafetySensorValue(undefined), '--')

assert.equal(formatSafetyMonitorTime('2026-07-16T11:51:29'), '2026-07-16 11:51:29')
assert.equal(formatSafetyMonitorTime('2026-07-16 11:51:29'), '2026-07-16 11:51:29')
assert.equal(formatSafetyMonitorTime(null), '暂无实时记录')
assert.equal(formatSafetyMonitorTime('invalid-time'), 'invalid-time')

assert.equal(getSafetySensorTone('激光甲烷'), 'methane')
assert.equal(getSafetySensorTone('粉尘'), 'dust')
assert.equal(getSafetySensorTone('环境温度'), 'temperature')
assert.equal(getSafetySensorTone('一氧化碳'), 'default')

const tableSensors = [
  {
    sensor_code: 'MN001',
    sensor_name: '切眼甲烷',
    sensor_type: '激光甲烷',
  },
  {
    sensor_code: 'MN002',
    sensor_name: '皮带粉尘',
    sensor_type: '粉尘',
  },
  {
    sensor_code: 'KG001',
    sensor_name: null,
    sensor_type: '开停',
  },
]

assert.deepEqual(
  filterSafetySensors(tableSensors, { type: '粉尘', keyword: '' }),
  [tableSensors[1]],
)
assert.deepEqual(
  filterSafetySensors(tableSensors, { type: '', keyword: 'mn00' }),
  [tableSensors[0], tableSensors[1]],
)
assert.deepEqual(
  filterSafetySensors(tableSensors, { type: '激光甲烷', keyword: '切眼' }),
  [tableSensors[0]],
)
assert.deepEqual(
  filterSafetySensors(tableSensors, { type: '粉尘', keyword: '甲烷' }),
  [],
)

const {
  buildSafetyMonitorRealtimeRequest,
} = await import('../src/api/safety-monitor/request.ts')

assert.deepEqual(
  buildSafetyMonitorRealtimeRequest(
    '24080000000043',
    [' 激光甲烷 ', '粉尘', '激光甲烷'],
  ),
  {
    url: '/api/v1/safety-monitor/stations/24080000000043/realtime',
    method: 'get',
    params: { types: '激光甲烷,粉尘' },
    silent: true,
  },
)
assert.deepEqual(
  buildSafetyMonitorRealtimeRequest('station/code', []),
  {
    url: '/api/v1/safety-monitor/stations/station%2Fcode/realtime',
    method: 'get',
    params: undefined,
    silent: true,
  },
)

console.log('safetyMonitor tests passed')
