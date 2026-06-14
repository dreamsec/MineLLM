export type AiToolName =
  | 'get_equipment_status'
  | 'query_equipment_data'
  | 'generate_chart'
  | 'search_knowledge_base'
  | string

export type AiToolStatus = 'running' | 'success' | 'error'

export interface AiToolResult {
  success: boolean
  content?: string
  data?: unknown
  error?: string | null
}

export interface AiToolCallPayload {
  call_id: string
  name: AiToolName
  arguments?: Record<string, unknown>
}

export interface AiToolResultPayload {
  call_id: string
  name: AiToolName
  result: AiToolResult
}

export interface AiToolDisplayData {
  callId: string
  name: AiToolName
  status: AiToolStatus
  arguments?: Record<string, unknown>
  result?: AiToolResult
  legacyContent?: string
}

export interface ChatStreamChunk {
  code?: number
  data_type?: string
  data?: unknown
  done?: boolean
  message?: string
}

const TOOL_LABELS: Record<string, string> = {
  get_equipment_status: '设备状态查询',
  query_equipment_data: '历史数据查询',
  generate_chart: '图表生成',
  search_knowledge_base: '知识库检索',
}

const TOOL_RUNNING_TEXT: Record<string, string> = {
  get_equipment_status: '正在查询设备状态...',
  query_equipment_data: '正在查询设备历史数据...',
  generate_chart: '正在生成图表...',
  search_knowledge_base: '正在检索知识库...',
}

export const getToolLabel = (name?: string) => {
  if (!name) return '工具调用'
  return TOOL_LABELS[name] || name
}

export const getToolRunningText = (name?: string) => {
  if (!name) return '正在调用工具...'
  return TOOL_RUNNING_TEXT[name] || `正在调用 ${name}...`
}

export const getToolHeaderText = (tool: AiToolDisplayData) => {
  const label = getToolLabel(tool.name)
  if (tool.status === 'running') return getToolRunningText(tool.name)
  if (tool.status === 'error') return `${label}失败`
  return `${label}完成`
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export const isAiToolCallPayload = (value: unknown): value is AiToolCallPayload => {
  if (!isRecord(value)) return false
  return (
    typeof value.call_id === 'string' &&
    typeof value.name === 'string' &&
    !('result' in value)
  )
}

export const isAiToolResultPayload = (value: unknown): value is AiToolResultPayload => {
  if (!isRecord(value) || !isRecord(value.result)) return false
  return typeof value.call_id === 'string' && typeof value.name === 'string'
}

export const createToolDisplayData = (payload: AiToolCallPayload): AiToolDisplayData => ({
  callId: payload.call_id,
  name: payload.name,
  status: 'running',
  arguments: payload.arguments,
})

export const mergeToolResultData = (
  previous: AiToolDisplayData | undefined,
  payload: AiToolResultPayload,
): AiToolDisplayData => ({
  callId: payload.call_id,
  name: payload.name,
  arguments: previous?.arguments,
  result: payload.result,
  status: payload.result.success ? 'success' : 'error',
})

export const parseSseJsonLine = (line: string): ChatStreamChunk | null => {
  const trimmed = line.trim()
  if (!trimmed || trimmed === 'data: [DONE]' || trimmed === '[DONE]') return null

  // 兼容标准 SSE 的 "data: {...}" 和当前后端直接输出 JSON 两种格式。
  const jsonText = trimmed.startsWith('data:') ? trimmed.slice(5).trim() : trimmed
  return JSON.parse(jsonText) as ChatStreamChunk
}
