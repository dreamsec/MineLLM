<template>
  <div class="threshold-page">
    <div class="page-heading">
      <div>
        <h1>设备阈值管理</h1>
        <p>按设备类型维护监测参数上下限，保存后由后端统一生效。</p>
      </div>
      <div class="heading-actions">
        <el-button :icon="Refresh" :loading="loading" @click="handleReadThreshold">
          读取阈值
        </el-button>
        <el-button
          type="primary"
          :icon="DocumentChecked"
          :loading="saving"
          @click="handleSaveThreshold"
        >
          保存阈值
        </el-button>
        <el-button
          :icon="Delete"
          type="danger"
          plain
          :loading="initializing"
          @click="handleInitializeThreshold"
        >
          初始化
        </el-button>
      </div>
    </div>

    <div class="threshold-layout">
      <aside class="selector-panel">
        <section class="selector-section">
          <h2>设备类型</h2>
          <div class="type-list">
            <button
              v-for="type in EQUIPMENT_THRESHOLD_TYPES"
              :key="type"
              class="type-item"
              :class="{ active: selectedType === type }"
              type="button"
              @click="handleTypeChange(type)"
            >
              <el-icon><component :is="getTypeIcon(type)" /></el-icon>
              <span>{{ type }}</span>
            </button>
          </div>
        </section>

        <section class="selector-section">
          <h2>配置范围</h2>
          <el-radio-group v-model="configScope" class="scope-group">
            <el-radio-button label="device">单设备配置</el-radio-button>
            <el-radio-button label="type">类型统一配置</el-radio-button>
          </el-radio-group>
          <p class="scope-hint">
            {{ configScope === 'type'
              ? `保存时会写入当前类型下 ${targetCodes.length} 台设备，单台特殊值可再切回单设备覆盖。`
              : '只读取、保存和初始化当前选中的设备。' }}
          </p>
        </section>

        <section class="selector-section">
          <h2>{{ configScope === 'type' ? '参考设备编号' : '设备编号' }}</h2>
          <el-select v-model="selectedCode" filterable class="code-select" @change="handleReadThreshold">
            <el-option
              v-for="code in currentTypeCodes"
              :key="code"
              :label="code"
              :value="code"
            />
          </el-select>
          <el-input
            v-model="codeKeyword"
            :prefix-icon="Search"
            placeholder="输入设备编号"
            class="code-search"
            clearable
          />
          <div class="code-list">
            <button
              v-for="code in filteredCodes"
              :key="code"
              class="code-item"
              :class="{ active: selectedCode === code }"
              type="button"
              @click="handleCodeChange(code)"
            >
              {{ code }}
            </button>
          </div>
        </section>
      </aside>

      <main class="editor-panel">
        <div class="summary-bar">
          <div class="summary-item">
            <span class="summary-label">配置对象</span>
            <strong>{{ currentTargetText }}</strong>
          </div>
          <div class="summary-item">
            <span class="summary-label">状态</span>
            <el-tag :type="configScope === 'type' ? 'warning' : thresholdData ? 'success' : 'info'">
              {{ configScope === 'type' ? `将写入 ${targetCodes.length} 台` : thresholdData ? '已保存' : '未设置' }}
            </el-tag>
          </div>
          <div class="summary-item">
            <span class="summary-label">已填阈值</span>
            <strong>{{ filledLimitCount }} / {{ totalLimitCount }}</strong>
          </div>
          <div class="summary-item">
            <span class="summary-label">最后更新</span>
            <strong>{{ lastUpdatedText }}</strong>
          </div>
        </div>

        <section class="table-panel">
          <div class="table-title">
            <h2>阈值参数</h2>
            <span>{{ currentFields.length }} 项参数</span>
          </div>
          <el-table
            v-loading="loading"
            :data="currentFields"
            border
            class="threshold-table"
          >
            <el-table-column prop="label" label="参数名称" min-width="160" />
            <el-table-column label="下限" min-width="220" align="center">
              <template #default="{ row }">
                <el-input-number
                  v-model="thresholdForm[row.key].lower"
                  :controls="true"
                  :precision="2"
                  controls-position="right"
                  placeholder="不设置"
                  class="threshold-input"
                />
              </template>
            </el-table-column>
            <el-table-column label="上限" min-width="220" align="center">
              <template #default="{ row }">
                <el-input-number
                  v-model="thresholdForm[row.key].upper"
                  :controls="true"
                  :precision="2"
                  controls-position="right"
                  placeholder="不设置"
                  class="threshold-input"
                />
              </template>
            </el-table-column>
            <el-table-column prop="unit" label="单位" width="120" align="center" />
          </el-table>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  Cpu,
  Delete,
  DocumentChecked,
  Odometer,
  Refresh,
  Search,
  SetUp,
  WindPower,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  deleteEquipmentThresholdApi,
  getDevicesApi,
  getEquipmentThresholdApi,
  upsertEquipmentThresholdApi,
} from '@/api/device'
import {
  EQUIPMENT_CODE_MAP,
  EQUIPMENT_THRESHOLD_TYPES,
  buildThresholdPayload,
  createInitializedThresholdState,
  createThresholdForm,
  getDefaultEquipmentCode,
  getThresholdTargetCodes,
  getThresholdFieldsByType,
  hydrateThresholdForm,
  type EquipmentThresholdType,
  type ThresholdConfigScope,
  type ThresholdApiData,
  type ThresholdFormData,
} from '@/constants/equipmentThreshold'

const selectedType = ref<EquipmentThresholdType>('排水机')
const configScope = ref<ThresholdConfigScope>('device')
const selectedCode = ref(getDefaultEquipmentCode(selectedType.value))
const codeKeyword = ref('')
const loading = ref(false)
const saving = ref(false)
const initializing = ref(false)
const thresholdData = ref<ThresholdApiData | null>(null)
const thresholdForm = ref<ThresholdFormData>(createThresholdForm(selectedType.value))
const deviceCodeMap = ref<Record<EquipmentThresholdType, string[]>>({ ...EQUIPMENT_CODE_MAP })
const savedAtText = ref('')

const currentFields = computed(() => getThresholdFieldsByType(selectedType.value))
const currentTypeCodes = computed(() => deviceCodeMap.value[selectedType.value] || [])
const targetCodes = computed(() =>
  getThresholdTargetCodes(configScope.value, selectedType.value, selectedCode.value, deviceCodeMap.value),
)
const currentTargetText = computed(() => {
  if (configScope.value === 'type') {
    return `${selectedType.value}全部设备（${targetCodes.value.length} 台）`
  }
  return `${selectedType.value} - ${selectedCode.value}`
})

const filteredCodes = computed(() => {
  const keyword = codeKeyword.value.trim().toUpperCase()
  if (!keyword) return currentTypeCodes.value
  return currentTypeCodes.value.filter((code) => code.toUpperCase().includes(keyword))
})

const totalLimitCount = computed(() => currentFields.value.length * 2)
const filledLimitCount = computed(() => {
  return currentFields.value.reduce((count, field) => {
    const range = thresholdForm.value[field.key]
    return count + Number(isFilled(range?.lower)) + Number(isFilled(range?.upper))
  }, 0)
})

const lastUpdatedText = computed(() => {
  const rawTime = thresholdData.value?.update_time || thresholdData.value?.updated_at
  return savedAtText.value || formatDateTime(rawTime) || '-'
})

function handleTypeChange(type: EquipmentThresholdType) {
  selectedType.value = type
  selectedCode.value = getDefaultEquipmentCode(type)
  codeKeyword.value = ''
  resetForm()
  handleReadThreshold()
}

function handleCodeChange(code: string) {
  selectedCode.value = code
  handleReadThreshold()
}

async function handleReadThreshold() {
  if (!selectedCode.value) {
    ElMessage.warning('请选择设备编号')
    return
  }

  loading.value = true
  try {
    const response = await getEquipmentThresholdApi(selectedCode.value)
    if (response.code === 1 && response.data) {
      thresholdData.value = response.data
      thresholdForm.value = hydrateThresholdForm(selectedType.value, response.data)
      savedAtText.value = ''
      ElMessage.success('阈值读取成功')
      return
    }

    thresholdData.value = null
    resetForm()
    ElMessage.info(response.message || '该设备尚未设置阈值')
  } catch (error) {
    console.error('读取阈值失败:', error)
    ElMessage.error('读取阈值失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

async function handleSaveThreshold() {
  if (targetCodes.value.length === 0) {
    ElMessage.warning('没有可保存的目标设备')
    return
  }

  const payload = buildThresholdPayload(selectedType.value, thresholdForm.value)
  if (Object.keys(payload).length === 0) {
    ElMessage.warning('请至少填写一个阈值')
    return
  }

  if (configScope.value === 'type') {
    try {
      await ElMessageBox.confirm(
        `确认将当前阈值保存到 ${selectedType.value} 下 ${targetCodes.value.length} 台设备吗？`,
        '类型统一配置',
        {
          type: 'warning',
          confirmButtonText: '确认保存',
          cancelButtonText: '取消',
        },
      )
    } catch {
      return
    }
  }

  saving.value = true
  try {
    const results = await Promise.allSettled(
      targetCodes.value.map((code) => upsertEquipmentThresholdApi(code, payload)),
    )
    const failedCodes = getFailedCodes(results)
    const firstSuccess = results.find((result) => result.status === 'fulfilled' && result.value.code === 1)

    if (failedCodes.length === 0 && firstSuccess?.status === 'fulfilled') {
      if (configScope.value === 'device') {
        thresholdData.value = firstSuccess.value.data
        thresholdForm.value = hydrateThresholdForm(selectedType.value, firstSuccess.value.data)
      }
      savedAtText.value = new Date().toLocaleString()
      ElMessage.success(
        configScope.value === 'type'
          ? `${selectedType.value} ${targetCodes.value.length} 台设备阈值保存成功`
          : firstSuccess.value.message || '阈值保存成功',
      )
      return
    }

    ElMessage.error(`以下设备阈值保存失败：${failedCodes.join('、')}`)
  } catch (error) {
    console.error('保存阈值失败:', error)
    ElMessage.error('阈值保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

async function handleInitializeThreshold() {
  if (targetCodes.value.length === 0) {
    ElMessage.warning('没有可初始化的目标设备')
    return
  }

  try {
    await ElMessageBox.confirm(
      configScope.value === 'type'
        ? `确认初始化 ${selectedType.value} 下 ${targetCodes.value.length} 台设备的阈值吗？该操作会删除这些设备后端已保存阈值。`
        : `确认初始化 ${selectedCode.value} 的阈值吗？该操作会删除后端已保存阈值，设备恢复为未设置。`,
      '初始化设备阈值',
      {
        type: 'warning',
        confirmButtonText: '确认初始化',
        cancelButtonText: '取消',
      },
    )

    initializing.value = true
    const results = await Promise.allSettled(
      targetCodes.value.map((code) => deleteEquipmentThresholdApi(code)),
    )
    const failedCodes = getFailedCodes(results)
    if (failedCodes.length === 0) {
      applyInitializedState()
      ElMessage.success(
        configScope.value === 'type'
          ? `${selectedType.value} ${targetCodes.value.length} 台设备阈值已初始化`
          : '设备阈值已初始化',
      )
      return
    }

    ElMessage.error(`以下设备阈值初始化失败：${failedCodes.join('、')}`)
  } catch {
    // 用户取消时不需要提示，保持页面原样。
  } finally {
    initializing.value = false
  }
}

async function loadDeviceCodes() {
  try {
    const response = await getDevicesApi({ page: 1, page_size: 1000 })
    const devices = response.data?.list || []
    const nextMap: Record<EquipmentThresholdType, string[]> = { ...EQUIPMENT_CODE_MAP }

    for (const device of devices) {
      if (!isEquipmentThresholdType(device.equipment_type)) continue
      if (!nextMap[device.equipment_type].includes(device.equipment_code)) {
        nextMap[device.equipment_type].push(device.equipment_code)
      }
    }

    deviceCodeMap.value = nextMap
  } catch (error) {
    console.warn('获取设备列表失败，使用内置设备编号:', error)
  }
}

function resetForm() {
  // 根据设备类型重建表单，避免切换设备后残留上一类设备的字段。
  thresholdForm.value = createThresholdForm(selectedType.value)
  thresholdData.value = null
  savedAtText.value = ''
}

function applyInitializedState() {
  // 初始化成功后，页面与后端保持一致：无阈值数据、表单为空、状态显示“未设置”。
  const initializedState = createInitializedThresholdState(selectedType.value)
  thresholdData.value = initializedState.thresholdData
  thresholdForm.value = initializedState.thresholdForm
  savedAtText.value = initializedState.savedAtText
}

function getFailedCodes<T extends { code?: number }>(
  results: PromiseSettledResult<T>[],
) {
  return results
    .map((result, index) => {
      if (result.status === 'rejected') return targetCodes.value[index]
      return result.value.code === 1 ? '' : targetCodes.value[index]
    })
    .filter(Boolean)
}

function getTypeIcon(type: EquipmentThresholdType) {
  const iconMap = {
    提升机: Odometer,
    压风机: WindPower,
    通风机: WindPower,
    排水机: Cpu,
    运输机: SetUp,
  }
  return iconMap[type]
}

function isEquipmentThresholdType(value: string): value is EquipmentThresholdType {
  return EQUIPMENT_THRESHOLD_TYPES.includes(value as EquipmentThresholdType)
}

function isFilled(value: unknown) {
  return value !== null && value !== undefined && value !== ''
}

function formatDateTime(value: unknown) {
  if (typeof value !== 'string' || !value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

onMounted(async () => {
  await loadDeviceCodes()
  await handleReadThreshold()
})
</script>

<style scoped>
.threshold-page {
  min-height: 100%;
  color: #1f2937;
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  padding: 18px 20px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.page-heading h1 {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 650;
}

.page-heading p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.heading-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.threshold-layout {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.selector-panel,
.editor-panel,
.table-panel {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.selector-panel {
  padding: 18px;
}

.selector-section + .selector-section {
  margin-top: 28px;
}

.selector-section h2,
.table-title h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 650;
}

.type-list,
.code-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
}

.type-item,
.code-item {
  width: 100%;
  min-height: 42px;
  border: 1px solid #dcdfe6;
  background: #ffffff;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  text-align: left;
}

.type-item:hover,
.code-item:hover {
  color: #1677ff;
  border-color: #91caff;
  background: #f0f7ff;
}

.type-item.active,
.code-item.active {
  color: #1677ff;
  border-color: #1677ff;
  background: #eaf3ff;
  font-weight: 650;
}

.code-select,
.code-search {
  width: 100%;
  margin-top: 14px;
}

.scope-group {
  width: 100%;
  margin-top: 14px;
}

:deep(.scope-group .el-radio-button) {
  flex: 1;
}

:deep(.scope-group .el-radio-button__inner) {
  width: 100%;
}

.scope-hint {
  margin: 10px 0 0;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.6;
}

.editor-panel {
  padding: 18px;
}

.summary-bar {
  display: grid;
  grid-template-columns: 1.4fr 0.7fr 0.8fr 1fr;
  gap: 0;
  margin-bottom: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.summary-item {
  min-height: 74px;
  padding: 14px 18px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.summary-item:last-child {
  border-right: none;
}

.summary-label {
  color: #8c95a6;
  font-size: 13px;
}

.summary-item strong {
  color: #111827;
  font-size: 15px;
}

.table-panel {
  padding: 18px;
}

.table-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.table-title span {
  color: #6b7280;
  font-size: 13px;
}

.threshold-table {
  width: 100%;
}

.threshold-input {
  width: 180px;
}

:deep(.el-table th.el-table__cell) {
  background: #f7f9fc;
  color: #374151;
  font-weight: 650;
}

:deep(.el-input-number .el-input__inner) {
  text-align: center;
}

@media (max-width: 1100px) {
  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .heading-actions {
    justify-content: flex-start;
  }

  .threshold-layout {
    grid-template-columns: 1fr;
  }

  .summary-bar {
    grid-template-columns: repeat(2, 1fr);
  }

  .summary-item:nth-child(2) {
    border-right: none;
  }

  .summary-item:nth-child(1),
  .summary-item:nth-child(2) {
    border-bottom: 1px solid #e5e7eb;
  }
}

@media (max-width: 640px) {
  .summary-bar {
    grid-template-columns: 1fr;
  }

  .summary-item {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }

  .summary-item:last-child {
    border-bottom: none;
  }

  .threshold-input {
    width: 140px;
  }
}
</style>
