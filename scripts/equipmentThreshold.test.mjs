import assert from 'node:assert/strict'

const {
  EQUIPMENT_THRESHOLD_TYPES,
  buildThresholdPayload,
  createInitializedThresholdState,
  createThresholdForm,
  getThresholdTargetCodes,
  getDefaultEquipmentCode,
  getThresholdFieldsByType,
  hydrateThresholdForm,
} = await import('../src/constants/equipmentThreshold.ts')

assert.deepEqual(EQUIPMENT_THRESHOLD_TYPES, ['提升机', '压风机', '通风机', '排水机', '运输机'])
assert.equal(getDefaultEquipmentCode('排水机'), 'PS001')
assert.equal(getDefaultEquipmentCode('压风机'), 'YF001')
assert.deepEqual(
  getThresholdTargetCodes('device', '压风机', 'YF003', {
    提升机: ['TS001'],
    压风机: ['YF001', 'YF002', 'YF003', 'YF004', 'YF005', 'YF006', 'YF007'],
    通风机: ['TF001', 'TF002'],
    排水机: ['PS001', 'PS002', 'PS003'],
    运输机: ['YS001'],
  }),
  ['YF003'],
)
assert.deepEqual(
  getThresholdTargetCodes('type', '压风机', 'YF003', {
    提升机: ['TS001'],
    压风机: ['YF001', 'YF002', 'YF003', 'YF004', 'YF005', 'YF006', 'YF007'],
    通风机: ['TF001', 'TF002'],
    排水机: ['PS001', 'PS002', 'PS003'],
    运输机: ['YS001'],
  }),
  ['YF001', 'YF002', 'YF003', 'YF004', 'YF005', 'YF006', 'YF007'],
)
assert.deepEqual(
  getThresholdTargetCodes('type', '压风机', 'YF003', {
    提升机: ['TS001'],
    压风机: ['YF001', 'YF001', 'YF002'],
    通风机: ['TF001', 'TF002'],
    排水机: ['PS001', 'PS002', 'PS003'],
    运输机: ['YS001'],
  }),
  ['YF001', 'YF002'],
)

const pumpFields = getThresholdFieldsByType('排水机')
assert.deepEqual(
  pumpFields.map((field) => field.key),
  ['current', 'pos_pressure', 'neg_pressure', 'motor_temp', 'motor_axis_temp', 'pump_axis_temp'],
)
assert.equal(pumpFields[0].label, '电流')
assert.equal(pumpFields[0].unit, 'A')

const emptyPumpForm = createThresholdForm('排水机')
assert.deepEqual(emptyPumpForm.current, { lower: null, upper: null })
assert.deepEqual(emptyPumpForm.pump_axis_temp, { lower: null, upper: null })

const initializedState = createInitializedThresholdState('排水机')
assert.equal(initializedState.thresholdData, null)
assert.equal(initializedState.savedAtText, '')
assert.deepEqual(initializedState.thresholdForm.current, { lower: null, upper: null })
assert.deepEqual(initializedState.thresholdForm.pump_axis_temp, { lower: null, upper: null })

const hydratedPumpForm = hydrateThresholdForm('排水机', {
  equipment_code: 'PS001',
  current_upper: 52,
  current_lower: 0,
  pos_pressure_upper: 1.5,
  unknown_upper: 999,
})
assert.deepEqual(hydratedPumpForm.current, { lower: 0, upper: 52 })
assert.deepEqual(hydratedPumpForm.pos_pressure, { lower: null, upper: 1.5 })
assert.equal(Object.hasOwn(hydratedPumpForm, 'unknown'), false)

const payload = buildThresholdPayload('排水机', {
  current: { lower: 0, upper: 52 },
  pos_pressure: { lower: null, upper: 1.5 },
  neg_pressure: { lower: '', upper: undefined },
  motor_temp: { lower: '20', upper: '85.5' },
  motor_axis_temp: { lower: null, upper: null },
  pump_axis_temp: { lower: null, upper: null },
})
assert.deepEqual(payload, {
  current_lower: 0,
  current_upper: 52,
  pos_pressure_upper: 1.5,
  motor_temp_lower: 20,
  motor_temp_upper: 85.5,
})

for (const equipmentType of EQUIPMENT_THRESHOLD_TYPES) {
  const fields = getThresholdFieldsByType(equipmentType)
  assert.ok(fields.length > 0, `${equipmentType} should have threshold fields`)
  for (const field of fields) {
    assert.equal(field.upperKey, `${field.key}_upper`)
    assert.equal(field.lowerKey, `${field.key}_lower`)
  }
}

console.log('equipmentThreshold tests passed')
