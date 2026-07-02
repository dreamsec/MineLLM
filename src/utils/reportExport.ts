export type EquipmentReportPeriodType = 'daily' | 'weekly' | 'monthly'
export type ReportPeriodType = EquipmentReportPeriodType | 'alarmDaily'
export type ReportExportMethod = 'get' | 'post'

export interface ReportPeriodOption {
  label: string
  value: ReportPeriodType
}

export interface ReportPeriodMeta {
  label: string
  dateLabel: string
  datePlaceholder: string
  dateParamKey: 'report_date' | 'period_start_date'
}

export interface ReportExportRequestConfig {
  url: string
  method: ReportExportMethod
  params: Record<string, string>
}

const REPORT_PERIOD_META: Record<ReportPeriodType, ReportPeriodMeta> = {
  daily: {
    label: '日报',
    dateLabel: '报告日期',
    datePlaceholder: '选择日期',
    dateParamKey: 'report_date',
  },
  weekly: {
    label: '周报',
    dateLabel: '周期起始',
    datePlaceholder: '选择周一日期',
    dateParamKey: 'period_start_date',
  },
  monthly: {
    label: '月报',
    dateLabel: '周期起始',
    datePlaceholder: '选择每月1号',
    dateParamKey: 'period_start_date',
  },
  alarmDaily: {
    label: '报警日报',
    dateLabel: '报警日期',
    datePlaceholder: '选择日期',
    dateParamKey: 'report_date',
  },
}

export const REPORT_PERIOD_OPTIONS: ReportPeriodOption[] = [
  { label: REPORT_PERIOD_META.daily.label, value: 'daily' },
  { label: REPORT_PERIOD_META.weekly.label, value: 'weekly' },
  { label: REPORT_PERIOD_META.monthly.label, value: 'monthly' },
  { label: REPORT_PERIOD_META.alarmDaily.label, value: 'alarmDaily' },
]

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getPreviousWeekMonday(baseDate: Date) {
  const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate())
  const daysFromMonday = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - daysFromMonday - 7)
  return date
}

function getPreviousMonthFirstDay(baseDate: Date) {
  return new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1)
}

export function getReportMeta(periodType: ReportPeriodType) {
  return REPORT_PERIOD_META[periodType]
}

export function getDefaultReportDate(periodType: ReportPeriodType, baseDate = new Date()) {
  if (periodType === 'weekly') {
    // 周报默认取上一个自然周的周一，和后端 period_start_date 语义保持一致。
    return formatDate(getPreviousWeekMonday(baseDate))
  }
  if (periodType === 'monthly') {
    // 月报默认取上一个自然月的 1 号，避免用户手动换算周期起点。
    return formatDate(getPreviousMonthFirstDay(baseDate))
  }
  return formatDate(baseDate)
}

export function buildReportExportRequest(
  periodType: EquipmentReportPeriodType,
  equipmentType: string,
  equipmentCode: string,
  reportDate: string,
): ReportExportRequestConfig {
  const meta = getReportMeta(periodType)
  const dateParam = { [meta.dateParamKey]: reportDate }

  if (!equipmentType) {
    return {
      url: `/api/v1/equipment-report/${periodType}/export-all`,
      method: 'post',
      params: dateParam,
    }
  }

  if (!equipmentCode) {
    return {
      url: `/api/v1/equipment-report/${periodType}/export-by-type`,
      method: 'post',
      params: { equipment_type: equipmentType, ...dateParam },
    }
  }

  return {
    url: `/api/v1/equipment-report/${periodType}/export`,
    method: 'get',
    params: { equipment_code: equipmentCode, ...dateParam },
  }
}

export function buildReportFileName(
  periodType: EquipmentReportPeriodType,
  equipmentType: string,
  equipmentCode: string,
  reportDate: string,
) {
  const reportLabel = getReportMeta(periodType).label

  if (!equipmentType) {
    return `${reportDate}_全部设备${reportLabel}汇总.docx`
  }
  if (!equipmentCode) {
    return `${reportDate}_${equipmentType}${reportLabel}汇总.docx`
  }
  return `${equipmentCode}_${reportDate}_${reportLabel}.docx`
}

function pickApiErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== 'object') return ''
  const data = payload as { message?: unknown }
  return typeof data.message === 'string' ? data.message : ''
}

function isTextResponseBlob(blob: Blob) {
  const type = blob.type.toLowerCase()
  return type.includes('application/json') || type.startsWith('text/')
}

export async function ensureReportExportBlob(response: unknown) {
  const directErrorMessage = pickApiErrorMessage(response)
  if (directErrorMessage) {
    throw new Error(directErrorMessage)
  }

  const blob = response instanceof Blob ? response : new Blob([response as BlobPart])
  const shouldInspectBody = isTextResponseBlob(blob) || blob.size <= 128 * 1024
  if (!shouldInspectBody) return blob

  let text = ''
  try {
    text = await blob.text()
  } catch {
    return blob
  }

  const trimmedText = text.trim()
  if (!trimmedText || trimmedText.startsWith('PK')) return blob

  // responseType=blob 时，后端的 JSON 错误也会变成 Blob，这里拦住，避免保存成损坏的 docx。
  if (trimmedText.startsWith('{') || trimmedText.startsWith('[')) {
    let parsed: unknown
    try {
      parsed = JSON.parse(trimmedText) as unknown
    } catch {
      throw new Error('导出失败，后端未返回有效的 Word 文件')
    }
    throw new Error(pickApiErrorMessage(parsed) || '导出失败，后端未返回有效的 Word 文件')
  }

  if (isTextResponseBlob(blob)) {
    throw new Error(trimmedText || '导出失败，后端未返回有效的 Word 文件')
  }

  return blob
}
