import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const pageSource = await readFile(
  new URL('../src/views/Dashboard/safety-monitor/index.vue', import.meta.url),
  'utf8',
)
const routerSource = await readFile(
  new URL('../src/router/index.ts', import.meta.url),
  'utf8',
)
const layoutSource = await readFile(
  new URL('../src/layouts/MainLayout.vue', import.meta.url),
  'utf8',
)

assert.match(pageSource, /name:\s*'SafetyMonitorIndex'/)
assert.match(pageSource, /getSafetyMonitorRealtimeApi/)
assert.match(pageSource, /REFRESH_INTERVAL\s*=\s*30_000/)
assert.match(pageSource, /new AbortController\(\)/)
assert.match(pageSource, /requestController\s*!==\s*currentController/)
assert.match(pageSource, /visibilitychange/)
assert.match(pageSource, /<el-table/)
assert.match(pageSource, /class="sensor-table"/)
assert.match(pageSource, /filterSafetySensors/)
assert.match(pageSource, /placeholder="搜索传感器名称或编码"/)
assert.match(pageSource, /placeholder="全部类型"/)
assert.match(pageSource, /getSafetyMonitorRealtimeApi\([\s\S]*?undefined,[\s\S]*?currentController\.signal/)
assert.match(pageSource, /status_code/)
assert.doesNotMatch(pageSource, /class="sensor-card"/)

assert.match(routerSource, /path:\s*'safety-monitor'/)
assert.match(routerSource, /title:\s*'安全监测'/)
assert.match(layoutSource, /SafetyMonitorIndex/)

console.log('safetyMonitorPage tests passed')
