import assert from 'node:assert/strict'

const {
  getHomeAlarmLevel,
} = await import('../src/utils/homeAlarmLevel.ts')

assert.equal(getHomeAlarmLevel(true, 0), 'alarm')
assert.equal(getHomeAlarmLevel(false, 1), 'warning')
assert.equal(getHomeAlarmLevel(true, 2), 'alarm')
assert.equal(getHomeAlarmLevel(false, 0), null)

console.log('homeAlarmLevel tests passed')
