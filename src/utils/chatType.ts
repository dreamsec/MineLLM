export type ChatType = 'expert' | 'normal'

export interface ChatTypeOption {
  value: ChatType
  label: string
  description: string
}

export const DEFAULT_CHAT_TYPE: ChatType = 'expert'

export const CHAT_TYPE_OPTIONS: ChatTypeOption[] = [
  {
    value: 'expert',
    label: '专家模式',
    description: '功能完整，可调用工具',
  },
  {
    value: 'normal',
    label: '普通模式',
    description: '快速回复，纯文本问答',
  },
]

// 后端旧数据或异常值统一兜底为专家模式，避免页面状态出现空值。
export const normalizeChatType = (value: unknown): ChatType => {
  return value === 'normal' ? 'normal' : DEFAULT_CHAT_TYPE
}

export type ChatTypeRestoreReason = 'session-load' | 'list-refresh'

// 只有用户主动加载历史会话时，才用会话字段恢复模式；普通列表刷新不能覆盖用户刚切换的选择。
export const shouldRestoreChatTypeFromSession = (reason: ChatTypeRestoreReason): boolean => {
  return reason === 'session-load'
}
