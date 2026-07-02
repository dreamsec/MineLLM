import assert from 'node:assert/strict'

const {
  buildAlarmDailyExportFileName,
  buildAlarmDailyExportParams,
} = await import('../src/utils/alarmReportExport.ts')

assert.deepEqual(
  buildAlarmDailyExportParams({
    date: '2026-07-02',
    equipmentType: '',
    equipmentCode: '',
  }),
  { date: '2026-07-02' },
)

assert.deepEqual(
  buildAlarmDailyExportParams({
    date: '2026-07-02',
    equipmentType: '通风机',
    equipmentCode: '',
  }),
  { date: '2026-07-02', equipment_type: '通风机' },
)

assert.deepEqual(
  buildAlarmDailyExportParams({
    date: '2026-07-02',
    equipmentType: '通风机',
    equipmentCode: 'TF001',
  }),
  { date: '2026-07-02', equipment_type: '通风机', equipment_code: 'TF001' },
)

assert.equal(
  buildAlarmDailyExportFileName('2026-07-02', '', ''),
  '2026-07-02_全部设备报警日报.docx',
)

assert.equal(
  buildAlarmDailyExportFileName('2026-07-02', '通风机', ''),
  '2026-07-02_通风机报警日报.docx',
)

assert.equal(
  buildAlarmDailyExportFileName('2026-07-02', '通风机', 'TF001'),
  'TF001_2026-07-02_报警日报.docx',
)

console.log('alarmReportExport tests passed')
