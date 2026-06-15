import {
  createToolDisplayData,
  getToolHeaderText,
  mergeToolResultData,
} from './aiToolStream.ts'
import type {
  AiToolDisplayData,
  AiToolName,
  AiToolResult,
  AiToolStatus,
} from './aiToolStream.ts'

export interface HistoryToolCall {
  index?: number
  id: string
  type?: string
  function: {
    name: AiToolName
    arguments?: string
  }
}

export interface HistoryChatMessage {
  id?: number | string
  session_id: string
  role: 'user' | 'assistant' | 'tool' | string
  content?: string | null
  tool_calls?: HistoryToolCall[] | null
  tool_call_id?: string | null
  tool_data?: string | Record<string, unknown> | null
  created_at?: string
}

export interface HistoryMessagePart {
  id: number
  session_id: string
  type: 'thinking' | 'tool' | 'response'
  content: string
  stepIndex?: number
  thinkTime?: string
  tool_calls?: HistoryToolCall[]
  tool_call_id?: string
  parent_message_id?: number
  toolName?: string
  toolStatus?: AiToolStatus
  toolArguments?: Record<string, unknown>
  toolResult?: AiToolResult
}

export interface HistoryUiMessage {
  id: number
  type: 'user' | 'assistant'
  content: string
  timestamp?: number
  loading?: boolean
  modelLoading?: boolean
  liked?: boolean
  parts?: HistoryMessagePart[]
}

interface ToolPartRef {
  message: HistoryUiMessage
  part: HistoryMessagePart
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

const parseJsonValue = (value: unknown) => {
  if (!value || typeof value !== 'string') return value

  try {
    return JSON.parse(value) as unknown
  } catch {
    return value
  }
}

const parseToolArguments = (argumentsText?: string) => {
  const parsed = parseJsonValue(argumentsText)
  return isRecord(parsed) ? parsed : undefined
}

const toTimestamp = (value?: string) => {
  if (!value) return Date.now()
  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? timestamp : Date.now()
}

const toMessageId = (value: HistoryChatMessage['id'], fallback: number) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

const normalizeToolCall = (call: HistoryToolCall, index: number): HistoryToolCall => ({
  index: call.index ?? index,
  id: call.id,
  type: call.type || 'function',
  function: {
    name: call.function.name,
    arguments: call.function.arguments || '{}',
  },
})

const mergeResultData = (contentData: unknown, toolData: unknown) => {
  if (isRecord(contentData) && isRecord(toolData)) {
    return { ...contentData, ...toolData }
  }
  return contentData ?? toolData
}

const inferToolName = (toolData: unknown): AiToolName => {
  if (isRecord(toolData) && isRecord(toolData.echarts_option)) return 'generate_chart'
  return 'unknown'
}

const toToolResult = (message: HistoryChatMessage): AiToolResult => {
  const contentPayload = parseJsonValue(message.content)
  const toolData = parseJsonValue(message.tool_data)

  if (isRecord(contentPayload)) {
    const resultData = mergeResultData(contentPayload.data, toolData)
    return {
      success: typeof contentPayload.success === 'boolean' ? contentPayload.success : true,
      content: typeof contentPayload.content === 'string' ? contentPayload.content : undefined,
      data: resultData,
      error: typeof contentPayload.error === 'string' ? contentPayload.error : null,
    }
  }

  return {
    success: true,
    content: typeof contentPayload === 'string' ? contentPayload : undefined,
    data: toolData,
    error: null,
  }
}

export const buildHistoryMessages = (historyMessages: HistoryChatMessage[]): HistoryUiMessage[] => {
  const messages: HistoryUiMessage[] = []
  const toolPartByCallId = new Map<string, ToolPartRef>()
  let activeAssistant: HistoryUiMessage | null = null
  let activeStepIndex = 0
  let fallbackId = Date.now()

  const nextFallbackId = () => {
    fallbackId += 1
    return fallbackId
  }

  const ensureAssistantMessage = (source: HistoryChatMessage) => {
    if (activeAssistant) return activeAssistant

    activeAssistant = {
      id: toMessageId(source.id, nextFallbackId()),
      type: 'assistant',
      content: '',
      timestamp: toTimestamp(source.created_at),
      loading: false,
      modelLoading: false,
      liked: false,
      parts: [],
    }
    activeStepIndex = 0
    messages.push(activeAssistant)
    return activeAssistant
  }

  const appendResponsePart = (source: HistoryChatMessage, content: string) => {
    const assistant = ensureAssistantMessage(source)
    const responsePart = assistant.parts?.find((part) => part.type === 'response')

    if (responsePart) {
      responsePart.content += content
      return
    }

    activeStepIndex += 1
    assistant.parts?.push({
      id: nextFallbackId(),
      session_id: source.session_id,
      type: 'response',
      content,
      stepIndex: activeStepIndex,
    })
    assistant.content += content
  }

  historyMessages.forEach((source) => {
    if (source.role === 'user') {
      activeAssistant = null
      activeStepIndex = 0
      messages.push({
        id: toMessageId(source.id, nextFallbackId()),
        type: 'user',
        content: source.content || '',
        timestamp: toTimestamp(source.created_at),
      })
      return
    }

    if (source.role === 'tool') {
      const toolResult = toToolResult(source)
      const callId = source.tool_call_id || ''
      const existing = callId ? toolPartByCallId.get(callId) : undefined

      if (existing) {
        const currentTool = createToolDisplayData({
          call_id: existing.part.tool_call_id || callId,
          name: existing.part.toolName || inferToolName(toolResult.data),
          arguments: existing.part.toolArguments,
        })
        const mergedTool = mergeToolResultData(currentTool, {
          call_id: callId,
          name: existing.part.toolName || inferToolName(toolResult.data),
          result: toolResult,
        })

        existing.part.content = mergedTool.result?.content || getToolHeaderText(mergedTool)
        existing.part.toolStatus = mergedTool.status
        existing.part.toolResult = mergedTool.result
        existing.part.toolName = mergedTool.name
        return
      }

      // 历史数据可能缺少 assistant.tool_calls，这里兜底创建一个可渲染的工具块。
      const assistant = ensureAssistantMessage(source)
      activeStepIndex += 1
      const tool: AiToolDisplayData = {
        callId,
        name: inferToolName(toolResult.data),
        status: toolResult.success ? 'success' : 'error',
        result: toolResult,
      }
      assistant.parts?.push({
        id: nextFallbackId(),
        session_id: source.session_id,
        type: 'tool',
        content: toolResult.content || getToolHeaderText(tool),
        stepIndex: activeStepIndex,
        tool_call_id: callId,
        toolName: tool.name,
        toolStatus: tool.status,
        toolResult,
      })
      return
    }

    const assistant = ensureAssistantMessage(source)
    const toolCalls = Array.isArray(source.tool_calls)
      ? source.tool_calls.map(normalizeToolCall)
      : []

    toolCalls.forEach((call) => {
      activeStepIndex += 1
      const tool = createToolDisplayData({
        call_id: call.id,
        name: call.function.name,
        arguments: parseToolArguments(call.function.arguments),
      })
      const part: HistoryMessagePart = {
        id: nextFallbackId(),
        session_id: source.session_id,
        type: 'tool',
        content: getToolHeaderText(tool),
        stepIndex: activeStepIndex,
        tool_calls: [call],
        tool_call_id: call.id,
        toolName: tool.name,
        toolStatus: tool.status,
        toolArguments: tool.arguments,
      }

      assistant.parts?.push(part)
      toolPartByCallId.set(call.id, { message: assistant, part })
    })

    if (source.content) {
      appendResponsePart(source, source.content)
    }
  })

  return messages
}
