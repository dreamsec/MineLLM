<template>
  <div class="safety-dashboard">
    <header class="dashboard-header">
      <img src="@/assets/img/up.png" class="header-bg" alt="" />

      <div class="station-block">
        <span class="station-kicker">SAFETY MONITORING STATION</span>
        <h1>{{ stationTitle }}</h1>
        <div class="station-code">
          <el-icon><Location /></el-icon>
          <span>分站编码 {{ station?.station_code || DEFAULT_SAFETY_MONITOR_STATION_CODE }}</span>
        </div>
      </div>

      <div class="header-metrics">
        <div class="metric-item">
          <span>传感器总数</span>
          <strong>{{ station?.sensor_count ?? '--' }}</strong>
        </div>
        <div class="metric-item">
          <span>当前显示</span>
          <strong>{{ filteredSensors.length }}</strong>
        </div>
        <div class="metric-item">
          <span>传感器类型</span>
          <strong>{{ availableSensorTypes.length }}</strong>
        </div>
        <div class="metric-item metric-time">
          <span>最新监测时间</span>
          <strong>{{ latestMonitorTime }}</strong>
        </div>
      </div>
    </header>

    <main class="data-panel">
      <div class="table-toolbar">
        <div class="toolbar-title">
          <el-icon><DataAnalysis /></el-icon>
          <div>
            <h2>分站实时数据</h2>
            <span>
              <el-icon><Timer /></el-icon>
              {{ autoRefreshText }}
              <template v-if="lastSuccessAt"> · 最近成功 {{ lastSuccessAt }}</template>
            </span>
          </div>
        </div>

        <div class="toolbar-actions">
          <el-input
            v-model="searchKeyword"
            class="sensor-search"
            clearable
            placeholder="搜索传感器名称或编码"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select
            v-model="selectedType"
            class="type-select"
            clearable
            placeholder="全部类型"
          >
            <el-option
              v-for="sensorType in availableSensorTypes"
              :key="sensorType"
              :label="sensorType"
              :value="sensorType"
            />
          </el-select>

          <el-tooltip content="立即刷新全部数据" placement="bottom">
            <el-button
              class="refresh-button"
              circle
              :loading="refreshing"
              aria-label="立即刷新全部数据"
              @click="loadRealtime"
            >
              <el-icon v-if="!refreshing"><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <div v-if="errorMessage && station" class="refresh-error" role="status">
        <el-icon><WarningFilled /></el-icon>
        <span>{{ errorMessage }}</span>
      </div>

      <section v-if="initialLoading && !station" class="state-panel">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <h2>正在加载分站全部实时数据</h2>
        <p>首次加载完成后，每 30 秒自动刷新一次。</p>
      </section>

      <section v-else-if="errorMessage && !station" class="state-panel error-state">
        <el-icon><WarningFilled /></el-icon>
        <h2>实时数据加载失败</h2>
        <p>{{ errorMessage }}</p>
        <el-button type="primary" @click="loadRealtime">重新加载</el-button>
      </section>

      <section v-else class="table-shell">
        <el-table
          class="sensor-table"
          :data="filteredSensors"
          height="100%"
          border
          stripe
          row-key="sensor_code"
          :empty-text="emptyText"
        >
          <el-table-column type="index" label="序号" width="64" align="center" fixed="left" />

          <el-table-column
            prop="sensor_name"
            label="传感器名称 / 安装位置"
            min-width="190"
            show-overflow-tooltip
            fixed="left"
          >
            <template #default="{ row }">
              <span class="sensor-name">{{ row.sensor_name || row.sensor_code }}</span>
            </template>
          </el-table-column>

          <el-table-column
            prop="sensor_code"
            label="传感器编码"
            min-width="235"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span class="sensor-code-cell">{{ row.sensor_code }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="sensor_type" label="传感器类型" width="125" align="center">
            <template #default="{ row }">
              <span
                class="type-tag"
                :class="`type-${getSafetySensorTone(row.sensor_type)}`"
              >
                {{ row.sensor_type || '未知类型' }}
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="sensor_category" label="类别" width="78" align="center">
            <template #default="{ row }">
              {{ row.sensor_category || '--' }}
            </template>
          </el-table-column>

          <el-table-column prop="value" label="实时值" width="112" align="right">
            <template #default="{ row }">
              <span class="reading-value">{{ formatSafetySensorValue(row.value) }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="unit" label="单位" width="92" align="center">
            <template #default="{ row }">
              {{ row.unit || '--' }}
            </template>
          </el-table-column>

          <el-table-column prop="status_code" label="状态码" width="86" align="center">
            <template #default="{ row }">
              <span class="status-code">{{ row.status_code ?? '--' }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="monitor_time" label="监测时间" width="172" align="center">
            <template #default="{ row }">
              <span class="monitor-time">{{ formatSafetyMonitorTime(row.monitor_time) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <footer v-if="station" class="table-footer">
        <span>共 {{ station.sensor_count }} 条传感器数据</span>
        <span v-if="hasActiveFilters">筛选后显示 {{ filteredSensors.length }} 条</span>
        <span>数据来源：分站实时监测接口</span>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onActivated,
  onDeactivated,
  onMounted,
  onUnmounted,
  ref,
} from 'vue'
import {
  DataAnalysis,
  Loading,
  Location,
  Refresh,
  Search,
  Timer,
  WarningFilled,
} from '@element-plus/icons-vue'
import {
  getSafetyMonitorRealtimeApi,
  type SafetyMonitorStationRealtime,
} from '@/api/safety-monitor'
import {
  DEFAULT_SAFETY_MONITOR_STATION_CODE,
  filterSafetySensors,
  formatSafetyMonitorTime,
  formatSafetySensorValue,
  getSafetySensorTone,
} from '@/utils/safetyMonitor'

defineOptions({
  name: 'SafetyMonitorIndex',
})

const REFRESH_INTERVAL = 30_000

const station = ref<SafetyMonitorStationRealtime | null>(null)
const searchKeyword = ref('')
const selectedType = ref('')
const initialLoading = ref(true)
const refreshing = ref(false)
const errorMessage = ref('')
const pageVisible = ref(true)
const lastSuccessAt = ref('')

let refreshTimer: number | undefined
let requestController: AbortController | null = null
let componentActive = false

const stationTitle = computed(() => (
  station.value?.station_name || '82下延二中车场43#监测分站'
))

const latestMonitorTime = computed(() => (
  formatSafetyMonitorTime(station.value?.latest_time)
))

const availableSensorTypes = computed(() => {
  const sensorTypes = (station.value?.sensors ?? [])
    .map(sensor => sensor.sensor_type?.trim())
    .filter((sensorType): sensorType is string => Boolean(sensorType))

  return [...new Set(sensorTypes)].sort((left, right) => left.localeCompare(right, 'zh-CN'))
})

const filteredSensors = computed(() => (
  filterSafetySensors(station.value?.sensors ?? [], {
    type: selectedType.value,
    keyword: searchKeyword.value,
  })
))

const hasActiveFilters = computed(() => (
  Boolean(selectedType.value || searchKeyword.value.trim())
))

const emptyText = computed(() => (
  hasActiveFilters.value ? '没有符合筛选条件的传感器' : '暂无传感器数据'
))

const autoRefreshText = computed(() => {
  if (!pageVisible.value) return '页面隐藏，自动刷新已暂停'
  return refreshing.value ? '正在刷新全部数据' : '每 30 秒自动刷新'
})

function isCanceledRequest(error: unknown) {
  const requestError = error as { code?: string; name?: string }
  return requestError?.code === 'ERR_CANCELED' || requestError?.name === 'CanceledError'
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  return '实时数据请求失败，请稍后重试'
}

async function loadRealtime() {
  requestController?.abort()
  const currentController = new AbortController()
  requestController = currentController

  if (station.value) {
    refreshing.value = true
  } else {
    initialLoading.value = true
  }
  errorMessage.value = ''

  try {
    const response = await getSafetyMonitorRealtimeApi(
      DEFAULT_SAFETY_MONITOR_STATION_CODE,
      undefined,
      currentController.signal,
    )

    if (requestController !== currentController || currentController.signal.aborted) {
      return
    }

    if (response.code !== 1 || !response.data) {
      errorMessage.value = response.message || '安全监测分站实时数据获取失败'
      return
    }

    station.value = response.data
    lastSuccessAt.value = new Date().toLocaleTimeString('zh-CN', {
      hour12: false,
    })
  } catch (error) {
    if (requestController !== currentController) return
    if (!isCanceledRequest(error)) {
      errorMessage.value = getErrorMessage(error)
    }
  } finally {
    // 旧请求结束时不能清理新请求的加载状态。
    if (requestController === currentController) {
      requestController = null
      initialLoading.value = false
      refreshing.value = false
    }
  }
}

function stopPolling() {
  if (refreshTimer !== undefined) {
    window.clearInterval(refreshTimer)
    refreshTimer = undefined
  }
}

function startPolling() {
  stopPolling()
  if (!componentActive || !pageVisible.value) return

  refreshTimer = window.setInterval(() => {
    void loadRealtime()
  }, REFRESH_INTERVAL)
}

function pauseRealtime() {
  stopPolling()
  requestController?.abort()
  requestController = null
}

function resumeRealtime() {
  if (!componentActive || !pageVisible.value) return
  void loadRealtime()
  startPolling()
}

function handleVisibilityChange() {
  pageVisible.value = !document.hidden
  if (pageVisible.value) {
    resumeRealtime()
  } else {
    pauseRealtime()
  }
}

onMounted(() => {
  componentActive = true
  pageVisible.value = !document.hidden
  document.addEventListener('visibilitychange', handleVisibilityChange)
  resumeRealtime()
})

onActivated(() => {
  if (componentActive) return
  componentActive = true
  pageVisible.value = !document.hidden
  resumeRealtime()
})

onDeactivated(() => {
  componentActive = false
  pauseRealtime()
})

onUnmounted(() => {
  componentActive = false
  pauseRealtime()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.safety-dashboard {
  width: 100%;
  height: calc(100vh - 100px);
  min-height: 650px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #e8f5ff;
  border: 1px solid rgba(35, 142, 236, 0.42);
  background: #020b19;
  font-family: "Microsoft YaHei", Arial, sans-serif;
}

.dashboard-header {
  position: relative;
  min-height: 144px;
  padding: 28px 32px 24px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  overflow: hidden;
  border-bottom: 1px solid rgba(43, 154, 247, 0.42);
  background: linear-gradient(90deg, #04142c 0%, #08284b 52%, #05162d 100%);
}

.header-bg {
  position: absolute;
  inset: 0 0 auto;
  width: 100%;
  height: 92px;
  object-fit: cover;
  opacity: 0.7;
  pointer-events: none;
}

.station-block,
.header-metrics {
  position: relative;
  z-index: 1;
}

.station-block {
  min-width: 0;
}

.station-kicker {
  display: block;
  margin-bottom: 7px;
  color: #4cc9ff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
}

.station-block h1 {
  margin: 0;
  overflow: hidden;
  color: #ffffff;
  font-size: 27px;
  line-height: 1.3;
  letter-spacing: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 0 18px rgba(37, 166, 255, 0.45);
}

.station-code {
  margin-top: 9px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #8fb9d8;
  font-size: 12px;
}

.header-metrics {
  display: grid;
  grid-template-columns: 110px 110px 110px minmax(190px, 1fr);
  flex-shrink: 0;
  border: 1px solid rgba(64, 158, 255, 0.32);
  background: rgba(3, 20, 43, 0.72);
}

.metric-item {
  min-height: 68px;
  padding: 11px 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  border-right: 1px solid rgba(64, 158, 255, 0.24);
}

.metric-item:last-child {
  border-right: 0;
}

.metric-item span {
  color: #75a4c9;
  font-size: 11px;
}

.metric-item strong {
  color: #55d8ff;
  font-size: 23px;
  line-height: 1.2;
  letter-spacing: 0;
}

.metric-time strong {
  color: #dff6ff;
  font-size: 14px;
}

.data-panel {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #041124;
}

.table-toolbar {
  min-height: 72px;
  padding: 13px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.28);
  background: #06182f;
}

.toolbar-title {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 11px;
}

.toolbar-title > .el-icon {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  color: #4acbff;
  font-size: 29px;
}

.toolbar-title h2 {
  margin: 0;
  color: #ecf8ff;
  font-size: 16px;
  line-height: 1.4;
  letter-spacing: 0;
}

.toolbar-title span {
  margin-top: 3px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #7099b9;
  font-size: 11px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.sensor-search {
  width: 250px;
}

.type-select {
  width: 150px;
}

.refresh-button {
  width: 34px;
  height: 34px;
  color: #dff7ff;
  border-color: #258fd9;
  background: #0c5b96;
}

.refresh-button:hover {
  color: #ffffff;
  border-color: #53cfff;
  background: #0879c7;
}

.refresh-error {
  min-height: 38px;
  padding: 8px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffd5d9;
  border-bottom: 1px solid rgba(255, 94, 113, 0.42);
  background: #311322;
  font-size: 12px;
}

.table-shell {
  min-height: 320px;
  flex: 1;
  padding: 14px 16px 0;
  overflow: hidden;
}

.sensor-table {
  width: 100%;
  height: 100%;
}

.sensor-name {
  color: #eaf7ff;
  font-weight: 600;
}

.sensor-code-cell {
  color: #85b7db;
  font-family: Consolas, "Microsoft YaHei", monospace;
  font-size: 11px;
}

.reading-value {
  color: #41d8ff;
  font-size: 15px;
  font-weight: 800;
}

.monitor-time {
  color: #b9d6ea;
  font-size: 11px;
}

.status-code {
  min-width: 34px;
  padding: 3px 7px;
  display: inline-block;
  color: #8edaff;
  border: 1px solid rgba(67, 180, 244, 0.36);
  border-radius: 4px;
  background: rgba(21, 92, 143, 0.28);
  font-size: 11px;
}

.type-tag {
  min-width: 72px;
  padding: 4px 7px;
  display: inline-block;
  border: 1px solid currentColor;
  border-radius: 4px;
  font-size: 11px;
  line-height: 1.2;
}

.type-methane {
  color: #40dfc6;
  background: rgba(25, 135, 119, 0.18);
}

.type-dust {
  color: #f4c85c;
  background: rgba(151, 112, 25, 0.18);
}

.type-temperature {
  color: #ff8998;
  background: rgba(158, 54, 73, 0.18);
}

.type-default {
  color: #71b9ff;
  background: rgba(41, 105, 169, 0.2);
}

.table-footer {
  min-height: 38px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 24px;
  color: #668eac;
  border-top: 1px solid rgba(64, 158, 255, 0.25);
  background: #05152b;
  font-size: 11px;
}

.state-panel {
  min-height: 320px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #779fbd;
  text-align: center;
}

.state-panel > .el-icon {
  width: 42px;
  height: 42px;
  color: #48caff;
  font-size: 42px;
}

.state-panel h2,
.state-panel p {
  margin: 0;
}

.state-panel h2 {
  color: #e7f6ff;
  font-size: 18px;
  letter-spacing: 0;
}

.state-panel p {
  font-size: 12px;
}

.error-state > .el-icon {
  color: #ff7183;
}

.loading-icon {
  animation: rotate 1.2s linear infinite;
}

:deep(.sensor-search .el-input__wrapper),
:deep(.type-select .el-select__wrapper) {
  border-radius: 4px;
  background: #071d39;
  box-shadow: 0 0 0 1px rgba(54, 145, 218, 0.48) inset;
}

:deep(.sensor-search .el-input__inner),
:deep(.type-select .el-select__placeholder),
:deep(.type-select .el-select__selected-item) {
  color: #d8efff;
  font-size: 12px;
}

:deep(.sensor-search .el-input__inner::placeholder) {
  color: #668eae;
}

:deep(.sensor-table) {
  --el-table-bg-color: #06162c;
  --el-table-tr-bg-color: #06162c;
  --el-table-header-bg-color: #0a2d55;
  --el-table-border-color: rgba(55, 145, 214, 0.32);
  --el-table-text-color: #bed9eb;
  --el-table-header-text-color: #7fd8ff;
  --el-table-row-hover-bg-color: #0b3765;
  --el-fill-color-lighter: #081d38;
  font-size: 12px;
}

:deep(.sensor-table th.el-table__cell) {
  height: 46px;
  padding: 0;
  background: #0a2d55;
  font-size: 12px;
  font-weight: 700;
}

:deep(.sensor-table td.el-table__cell) {
  height: 46px;
  padding: 0;
}

:deep(.sensor-table .cell) {
  line-height: 1.4;
}

:deep(.sensor-table .el-table__inner-wrapper::before),
:deep(.sensor-table .el-table__border-left-patch) {
  background: rgba(55, 145, 214, 0.32);
}

:deep(.sensor-table .el-table__fixed),
:deep(.sensor-table .el-table__fixed-right) {
  box-shadow: 6px 0 12px rgba(0, 0, 0, 0.22);
}

:deep(.sensor-table .el-scrollbar__thumb) {
  background: rgba(47, 157, 231, 0.58);
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1180px) {
  .dashboard-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 18px;
  }

  .header-metrics {
    width: 100%;
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .station-block h1 {
    white-space: normal;
  }
}

@media (max-width: 820px) {
  .safety-dashboard {
    height: auto;
    min-height: calc(100vh - 90px);
    overflow: visible;
  }

  .dashboard-header {
    padding: 24px 18px 20px;
  }

  .header-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .metric-item:nth-child(2) {
    border-right: 0;
  }

  .metric-item:nth-child(-n + 2) {
    border-bottom: 1px solid rgba(64, 158, 255, 0.24);
  }

  .table-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .toolbar-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .sensor-search {
    width: min(100%, 300px);
    flex: 1 1 220px;
  }

  .type-select {
    width: 150px;
    flex: 0 0 150px;
  }

  .table-shell {
    height: 560px;
    flex: none;
    padding: 12px 10px 0;
  }

  .table-footer {
    min-height: 54px;
    padding: 10px 14px;
    align-items: flex-end;
    flex-direction: column;
    justify-content: center;
    gap: 3px;
  }
}

@media (max-width: 520px) {
  .station-block h1 {
    font-size: 22px;
  }

  .metric-item {
    padding: 10px 12px;
  }

  .metric-item strong {
    font-size: 20px;
  }

  .toolbar-actions {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 132px 34px;
  }

  .sensor-search,
  .type-select {
    width: 100%;
    min-width: 0;
  }
}
</style>
