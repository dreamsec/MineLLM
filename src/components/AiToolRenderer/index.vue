<template>
  <div class="tool-renderer" :class="`tool-renderer--${theme}`">
    <div v-if="tool.status === 'running'" class="tool-running">
      <span class="tool-dot"></span>
      <span>{{ getToolRunningText(tool.name) }}</span>
    </div>

    <div v-else-if="tool.status === 'error'" class="tool-error">
      {{ tool.result?.error || tool.result?.content || '工具调用失败，请稍后重试。' }}
    </div>

    <template v-else>
      <div v-if="tool.result?.content" class="tool-summary">
        {{ tool.result.content }}
      </div>

      <div v-if="tool.name === 'generate_chart'" class="chart-tool">
        <AiEChart v-if="chartOption" :option="chartOption" />
        <div v-else class="empty-state">后端未返回图表配置。</div>
        <div v-if="chartMeta.length" class="meta-row">
          <span v-for="item in chartMeta" :key="item.label" class="meta-chip">
            {{ item.label }}：{{ item.value }}
          </span>
        </div>
        <details v-if="chartFieldEntries.length" class="field-detail">
          <summary>字段说明</summary>
          <div class="field-grid">
            <span v-for="[field, label] in chartFieldEntries" :key="field">
              {{ field }}：{{ label }}
            </span>
          </div>
        </details>
      </div>

      <div v-else-if="tool.name === 'get_equipment_status'" class="status-tool">
        <div class="stat-grid">
          <div class="stat-item">
            <span class="stat-value">{{ equipmentStatusData?.total ?? 0 }}</span>
            <span class="stat-label">设备总数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ equipmentStatusData?.online_count ?? 0 }}</span>
            <span class="stat-label">在线</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ equipmentStatusData?.offline_count ?? 0 }}</span>
            <span class="stat-label">离线</span>
          </div>
          <div class="stat-item warning">
            <span class="stat-value">{{ equipmentStatusData?.abnormal_count ?? 0 }}</span>
            <span class="stat-label">异常</span>
          </div>
        </div>

        <div class="equipment-list">
          <div v-for="equipment in equipmentList" :key="equipment.equipment_code" class="equipment-card">
            <div class="equipment-head">
              <span class="status-light" :class="`status-light--${equipment.status_indicator || 'normal'}`"></span>
              <div>
                <div class="equipment-name">{{ equipment.equipment_name || equipment.equipment_code }}</div>
                <div class="equipment-subtitle">
                  {{ equipment.equipment_type || '未知类型' }} / {{ equipment.equipment_status || '未知状态' }}
                </div>
              </div>
            </div>
            <div class="param-grid">
              <div v-for="param in getKeyParams(equipment.key_params)" :key="param.key" class="param-item">
                <span>{{ param.label }}</span>
                <strong>{{ formatValue(param.value) }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="tool.name === 'query_equipment_data'" class="query-tool">
        <div class="meta-row">
          <span class="meta-chip">设备：{{ queryData?.equipment_name || queryData?.equipment_code || '-' }}</span>
          <span class="meta-chip">返回：{{ queryData?.record_count ?? 0 }} 条</span>
          <span class="meta-chip">总数：{{ queryData?.total_count ?? 0 }} 条</span>
        </div>

        <div v-if="summaryEntries.length" class="summary-grid">
          <div v-for="[field, summary] in summaryEntries" :key="field" class="summary-card">
            <div class="summary-title">{{ field }}</div>
            <div class="summary-values">
              <span>最小：{{ formatValue(summary.min) }}</span>
              <span>最大：{{ formatValue(summary.max) }}</span>
              <span>平均：{{ formatValue(summary.avg) }}</span>
            </div>
          </div>
        </div>

        <div v-if="queryRows.length" class="table-wrap">
          <table>
            <thead>
              <tr>
                <th v-for="column in queryColumns" :key="column">{{ column }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in queryRows" :key="index">
                <td v-for="column in queryColumns" :key="column">{{ formatValue(row[column]) }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="hasMoreRows" class="table-hint">仅展示前 {{ queryRows.length }} 条数据。</div>
        </div>
      </div>

      <div v-else-if="tool.name === 'search_knowledge_base'" class="knowledge-tool">
        <div class="meta-row">
          <span class="meta-chip">检索词：{{ knowledgeData?.query || '-' }}</span>
          <span class="meta-chip">命中：{{ knowledgeData?.count ?? knowledgeResults.length }} 条</span>
        </div>
        <div class="knowledge-list">
          <div v-for="item in knowledgeResults" :key="item.index" class="knowledge-item">
            <div class="knowledge-source">{{ item.source || '未知来源' }}</div>
            <div class="knowledge-content">{{ item.content }}</div>
          </div>
        </div>
      </div>

      <pre v-else-if="tool.legacyContent" class="legacy-block">{{ tool.legacyContent }}</pre>
      <pre v-else class="legacy-block">{{ stringify(tool.result?.data || tool.arguments || {}) }}</pre>
    </template>

    <details v-if="tool.arguments && Object.keys(tool.arguments).length" class="arguments-detail">
      <summary>查看调用参数</summary>
      <pre>{{ stringify(tool.arguments) }}</pre>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AiEChart from './AiEChart.vue'
import type { AiToolDisplayData } from '@/utils/aiToolStream'
import { getToolRunningText } from '@/utils/aiToolStream'
import { normalizeChartToolData } from '@/utils/aiChartOption'

const props = withDefaults(defineProps<{
  tool: AiToolDisplayData
  theme?: 'light' | 'dark'
}>(), {
  theme: 'light',
})

interface EquipmentItem {
  equipment_code: string
  equipment_name?: string
  equipment_type?: string
  equipment_status?: string
  status_indicator?: 'normal' | 'warning' | 'error'
  key_params?: Record<string, { label?: string; value?: unknown }>
}

interface EquipmentStatusData {
  equipments?: EquipmentItem[]
  total?: number
  online_count?: number
  offline_count?: number
  abnormal_count?: number
}

interface QuerySummary {
  count?: number
  min?: number | null
  max?: number | null
  avg?: number | null
}

interface QueryData {
  equipment_code?: string
  equipment_name?: string
  record_count?: number
  total_count?: number
  records?: Record<string, unknown>[]
  summary?: Record<string, QuerySummary>
}

interface KnowledgeData {
  query?: string
  count?: number
  results?: Array<{
    index: number
    content: string
    source: string
  }>
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

const toolData = computed(() => props.tool.result?.data)

const normalizedChart = computed(() => normalizeChartToolData(toolData.value))

const chartOption = computed(() => {
  return Object.keys(normalizedChart.value.option).length ? normalizedChart.value.option : null
})

const chartMeta = computed(() => {
  if (!isRecord(toolData.value)) return []
  const items: Array<{ label: string; value: string | number }> = []
  if (toolData.value.equipment_name) items.push({ label: '设备', value: String(toolData.value.equipment_name) })
  if (toolData.value.record_count !== undefined) items.push({ label: '数据量', value: String(toolData.value.record_count) })
  if (toolData.value.chart_type) items.push({ label: '图表类型', value: String(toolData.value.chart_type) })
  return items
})

const chartFieldEntries = computed(() => Object.entries(normalizedChart.value.fieldLabels))

const equipmentStatusData = computed(() => {
  return isRecord(toolData.value) ? (toolData.value as EquipmentStatusData) : undefined
})

const equipmentList = computed(() => equipmentStatusData.value?.equipments || [])

const queryData = computed(() => {
  return isRecord(toolData.value) ? (toolData.value as QueryData) : undefined
})

const summaryEntries = computed(() => Object.entries(queryData.value?.summary || {}))
const queryRows = computed(() => (queryData.value?.records || []).slice(0, 8))
const hasMoreRows = computed(() => (queryData.value?.records?.length || 0) > queryRows.value.length)
const queryColumns = computed(() => Object.keys(queryRows.value[0] || {}).slice(0, 8))

const knowledgeData = computed(() => {
  return isRecord(toolData.value) ? (toolData.value as KnowledgeData) : undefined
})

const knowledgeResults = computed(() => knowledgeData.value?.results || [])

const getKeyParams = (params?: EquipmentItem['key_params']) => {
  if (!params) return []
  return Object.entries(params).map(([key, item]) => ({
    key,
    label: item.label || key,
    value: item.value,
  }))
}

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(2)
  return String(value)
}

const stringify = (value: unknown) => {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}
</script>

<style scoped>
.tool-renderer {
  --tool-bg: #ffffff;
  --tool-soft-bg: #f7faff;
  --tool-border: #dbe8ff;
  --tool-text: #263445;
  --tool-muted: #66758a;
  --tool-accent: #1677ff;
  --tool-warning: #faad14;
  --tool-error: #ff4d4f;
  color: var(--tool-text);
}

.tool-renderer--dark {
  --tool-bg: rgba(4, 19, 31, 0.9);
  --tool-soft-bg: rgba(0, 188, 212, 0.08);
  --tool-border: rgba(0, 188, 212, 0.22);
  --tool-text: #dceff5;
  --tool-muted: #8daab1;
  --tool-accent: #00bcd4;
  --tool-warning: #ffc857;
  --tool-error: #ff7875;
}

.tool-running {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--tool-accent);
}

.tool-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--tool-accent);
  animation: pulse 1.2s infinite ease-in-out;
}

.tool-error {
  color: var(--tool-error);
  line-height: 1.6;
}

.tool-summary {
  margin-bottom: 10px;
  color: var(--tool-muted);
  line-height: 1.6;
}

.chart-tool {
  background: var(--tool-bg);
  border: 1px solid var(--tool-border);
  border-radius: 8px;
  padding: 10px;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0;
}

.meta-chip {
  padding: 4px 8px;
  border: 1px solid var(--tool-border);
  border-radius: 999px;
  color: var(--tool-muted);
  font-size: 12px;
  background: var(--tool-soft-bg);
}

.stat-grid,
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  margin-bottom: 10px;
}

.stat-item,
.summary-card,
.equipment-card,
.knowledge-item {
  background: var(--tool-bg);
  border: 1px solid var(--tool-border);
  border-radius: 8px;
  padding: 10px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--tool-accent);
}

.stat-item.warning .stat-value {
  color: var(--tool-warning);
}

.stat-label,
.summary-values,
.equipment-subtitle,
.knowledge-source,
.table-hint {
  color: var(--tool-muted);
  font-size: 12px;
}

.equipment-list,
.knowledge-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.equipment-head {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.equipment-name,
.summary-title,
.knowledge-source {
  font-weight: 600;
}

.status-light {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 5px;
  background: #52c41a;
  flex-shrink: 0;
}

.status-light--warning {
  background: #faad14;
}

.status-light--error {
  background: #ff4d4f;
}

.param-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 6px;
}

.param-item {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: var(--tool-muted);
}

.param-item strong {
  color: var(--tool-text);
}

.summary-values {
  display: grid;
  gap: 4px;
  margin-top: 6px;
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--tool-border);
  border-radius: 8px;
  background: var(--tool-bg);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

th,
td {
  padding: 8px;
  border-bottom: 1px solid var(--tool-border);
  text-align: left;
  white-space: nowrap;
}

th {
  color: var(--tool-muted);
  background: var(--tool-soft-bg);
}

.knowledge-content {
  margin-top: 6px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.empty-state,
.legacy-block {
  color: var(--tool-muted);
}

.legacy-block,
.arguments-detail pre {
  margin: 8px 0 0;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid var(--tool-border);
  background: var(--tool-soft-bg);
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
}

.arguments-detail {
  margin-top: 8px;
  color: var(--tool-muted);
  font-size: 12px;
}

.field-detail {
  margin-top: 8px;
  color: var(--tool-muted);
  font-size: 12px;
}

.field-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  margin-top: 6px;
  line-height: 1.6;
}

.arguments-detail summary,
.field-detail summary {
  cursor: pointer;
  user-select: none;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(0.8);
    opacity: 0.45;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
