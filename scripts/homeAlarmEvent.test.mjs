import assert from 'node:assert/strict'

const {
  mapAlarmEventToHomeItem,
  normalizeAlarmEventList,
} = await import('../src/utils/homeAlarmEvent.ts')

const thresholdEvent = {
  id: 123,
  equipment_code: 'PS001',
  equipment_type: '排水机',
  alarm_source: 'threshold',
  level: 'warning',
  alarm_code: 'threshold:motor_temp_v:upper',
  title: '阈值超限',
  message: '电机温度 95℃ 超过上限 90℃',
  source_key: 'motor_temp_v',
  direction: 'upper',
  value: 95,
  threshold: 90,
  status: 'active',
  ack_status: 'unacknowledged',
  start_time: '2026-07-02 10:12:00',
}

assert.deepEqual(normalizeAlarmEventList([thresholdEvent]), [thresholdEvent])
assert.deepEqual(normalizeAlarmEventList({ list: [thresholdEvent] }), [thresholdEvent])
assert.deepEqual(normalizeAlarmEventList(null), [])

const thresholdItem = mapAlarmEventToHomeItem(thresholdEvent, '排水泵#1')
assert.equal(thresholdItem.id, '123')
assert.equal(thresholdItem.eventId, 123)
assert.equal(thresholdItem.code, 'PS001')
assert.equal(thresholdItem.name, '排水泵#1')
assert.equal(thresholdItem.level, 'warning')
assert.equal(thresholdItem.time, '10:12:00')
assert.equal(thresholdItem.message, '[阈值超限] 电机温度 95℃ 超过上限 90℃')

const fieldItem = mapAlarmEventToHomeItem({
  ...thresholdEvent,
  id: 456,
  alarm_source: 'field',
  level: 'alarm',
  title: '设备故障',
  message: '',
  start_time: '2026-07-02T11:08:09',
}, '')

assert.equal(fieldItem.id, '456')
assert.equal(fieldItem.name, 'PS001')
assert.equal(fieldItem.level, 'alarm')
assert.equal(fieldItem.time, '11:08:09')
assert.equal(fieldItem.message, '[设备故障]')

console.log('homeAlarmEvent tests passed')
