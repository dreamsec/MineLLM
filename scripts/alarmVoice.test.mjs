import assert from 'node:assert/strict'

const {
  appendAnnouncedAlarmIds,
  buildAlarmSpeechText,
  pickNewAlarmItems,
} = await import('../src/utils/alarmVoice.ts')

const announcedIds = new Set(['101'])
const alarms = [
  { id: '101', name: '通风机#1', message: '[设备报警] 1#注油泵故障触发' },
  { id: '102', name: '排水泵#2', message: '[阈值超限] 电机温度超过上限' },
]

const newItems = pickNewAlarmItems(alarms, announcedIds)
assert.equal(newItems.length, 1)
assert.equal(newItems[0].id, '102')

const nextAnnouncedIds = appendAnnouncedAlarmIds(announcedIds, newItems)
assert.equal(nextAnnouncedIds.has('101'), true)
assert.equal(nextAnnouncedIds.has('102'), true)
assert.equal(announcedIds.has('102'), false)

assert.equal(
  buildAlarmSpeechText(alarms[0]),
  '通风机号1，设备报警，1号注油泵故障触发',
)

assert.equal(
  buildAlarmSpeechText({ id: '103', name: '', message: '' }),
  '未知设备，收到新的报警',
)

console.log('alarmVoice tests passed')
