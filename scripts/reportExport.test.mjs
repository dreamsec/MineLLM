import assert from 'node:assert/strict'

const {
  REPORT_PERIOD_OPTIONS,
  buildReportExportRequest,
  buildReportFileName,
  ensureReportExportBlob,
  getDefaultReportDate,
  getReportMeta,
} = await import('../src/utils/reportExport.ts')

assert.deepEqual(
  REPORT_PERIOD_OPTIONS.map((option) => option.value),
  ['daily', 'weekly', 'monthly', 'alarmDaily'],
)

assert.equal(getReportMeta('daily').label, '日报')
assert.equal(getReportMeta('weekly').label, '周报')
assert.equal(getReportMeta('monthly').label, '月报')
assert.equal(getReportMeta('alarmDaily').label, '报警日报')
assert.equal(getReportMeta('alarmDaily').dateLabel, '报警日期')

assert.equal(getDefaultReportDate('daily', new Date(2026, 6, 2)), '2026-07-02')
assert.equal(getDefaultReportDate('weekly', new Date(2026, 6, 2)), '2026-06-22')
assert.equal(getDefaultReportDate('monthly', new Date(2026, 6, 2)), '2026-06-01')
assert.equal(getDefaultReportDate('alarmDaily', new Date(2026, 6, 2)), '2026-07-02')
assert.equal(getDefaultReportDate('weekly', new Date(2026, 0, 4)), '2025-12-22')
assert.equal(getDefaultReportDate('monthly', new Date(2026, 0, 4)), '2025-12-01')

assert.deepEqual(buildReportExportRequest('daily', '', '', '2026-07-02'), {
  url: '/api/v1/equipment-report/daily/export-all',
  method: 'post',
  params: { report_date: '2026-07-02' },
})

assert.deepEqual(buildReportExportRequest('weekly', '排水机', '', '2026-06-22'), {
  url: '/api/v1/equipment-report/weekly/export-by-type',
  method: 'post',
  params: { equipment_type: '排水机', period_start_date: '2026-06-22' },
})

assert.deepEqual(buildReportExportRequest('monthly', '提升机', 'TS001', '2026-06-01'), {
  url: '/api/v1/equipment-report/monthly/export',
  method: 'get',
  params: { equipment_code: 'TS001', period_start_date: '2026-06-01' },
})

assert.equal(buildReportFileName('daily', '', '', '2026-07-02'), '2026-07-02_全部设备日报汇总.docx')
assert.equal(buildReportFileName('weekly', '排水机', '', '2026-06-22'), '2026-06-22_排水机周报汇总.docx')
assert.equal(buildReportFileName('monthly', '提升机', 'TS001', '2026-06-01'), 'TS001_2026-06-01_月报.docx')

const jsonErrorBlob = new Blob([
  JSON.stringify({ code: 0, message: '未找到 2026-07-02 的报警记录', data: null }),
], { type: 'application/json' })

await assert.rejects(
  () => ensureReportExportBlob(jsonErrorBlob),
  { message: '未找到 2026-07-02 的报警记录' },
)

const docxBlob = new Blob([new Uint8Array([0x50, 0x4b, 0x03, 0x04])], {
  type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
})

assert.equal(await ensureReportExportBlob(docxBlob), docxBlob)

console.log('reportExport tests passed')
