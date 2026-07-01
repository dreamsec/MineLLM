import assert from 'node:assert/strict'

const {
  analyzeThresholdBreaches,
  getEquipmentThresholdTypeByCode,
} = await import('../src/utils/equipmentThresholdAlarm.ts')

assert.equal(getEquipmentThresholdTypeByCode('TS001'), '提升机')
assert.equal(getEquipmentThresholdTypeByCode('YF003'), '压风机')
assert.equal(getEquipmentThresholdTypeByCode('TF002'), '通风机')
assert.equal(getEquipmentThresholdTypeByCode('PS001'), '排水机')
assert.equal(getEquipmentThresholdTypeByCode('YS001'), '运输机')
assert.equal(getEquipmentThresholdTypeByCode('UNKNOWN'), null)

const compressorBreaches = analyzeThresholdBreaches({
  equipmentCode: 'YF001',
  realtimeData: {
    equipment_code: 'YF001',
    collected_at: '2026-06-29T09:00:00',
    current: 66,
  },
  thresholdData: {
    equipment_code: 'YF001',
    current_lower: 10,
    current_upper: 50,
  },
})

assert.equal(compressorBreaches.length, 1)
assert.equal(compressorBreaches[0].fieldKey, 'current')
assert.equal(compressorBreaches[0].direction, 'upper')
assert.equal(compressorBreaches[0].value, 66)
assert.equal(compressorBreaches[0].threshold, 50)
assert.match(compressorBreaches[0].message, /超过上限/)

const pumpBreaches = analyzeThresholdBreaches({
  equipmentCode: 'PS001',
  realtimeData: {
    equipment_code: 'PS001',
    collected_at: '2026-06-29T09:00:00',
    motor_temp_u: 72,
    motor_temp_v: 95,
    motor_temp_w: 80,
  },
  thresholdData: {
    equipment_code: 'PS001',
    motor_temp_upper: 90,
  },
})

assert.equal(pumpBreaches.length, 1)
assert.equal(pumpBreaches[0].fieldKey, 'motor_temp')
assert.equal(pumpBreaches[0].sourceKey, 'motor_temp_v')
assert.equal(pumpBreaches[0].value, 95)
assert.equal(pumpBreaches[0].threshold, 90)

const unsetThresholdBreaches = analyzeThresholdBreaches({
  equipmentCode: 'YF001',
  realtimeData: {
    equipment_code: 'YF001',
    collected_at: '2026-06-29T09:00:00',
    current: 999,
    voltage: 999,
  },
  thresholdData: {
    equipment_code: 'YF001',
    current_lower: null,
    current_upper: '',
    voltage_lower: undefined,
    voltage_upper: undefined,
  },
})

assert.deepEqual(unsetThresholdBreaches, [])

const normalBreaches = analyzeThresholdBreaches({
  equipmentCode: 'PS001',
  realtimeData: {
    equipment_code: 'PS001',
    collected_at: '2026-06-29T09:00:00',
    current: 30,
  },
  thresholdData: null,
})

assert.deepEqual(normalBreaches, [])

console.log('equipmentThresholdAlarm tests passed')
