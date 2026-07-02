import type {
  ExportEquipmentAlarmDailyReportParams,
} from '@/api/equipment-alarm'

export interface BuildAlarmDailyExportParamsOptions {
  date: string
  equipmentType?: string
  equipmentCode?: string
}

export function buildAlarmDailyExportParams(options: BuildAlarmDailyExportParamsOptions) {
  const params: ExportEquipmentAlarmDailyReportParams = {
    date: options.date,
  }

  if (options.equipmentType) {
    params.equipment_type = options.equipmentType
  }

  if (options.equipmentCode) {
    params.equipment_code = options.equipmentCode
  }

  return params
}

export function buildAlarmDailyExportFileName(
  date: string,
  equipmentType: string,
  equipmentCode: string,
) {
  if (equipmentCode) return `${equipmentCode}_${date}_报警日报.docx`
  if (equipmentType) return `${date}_${equipmentType}报警日报.docx`
  return `${date}_全部设备报警日报.docx`
}
