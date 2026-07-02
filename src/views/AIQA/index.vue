<template>
  <div class="ai-qna-page">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <div class="header-left">
        <h1>大模型智能问答</h1>
        <p>基于大模型的智能问答与历史记录管理</p>
      </div>
      <div class="header-actions">
        <button class="action-btn secondary" @click="newChat">
          <i class="fas fa-trash"></i>
          新建对话
        </button>
        <button class="action-btn secondary" @click="clearHistory">
          <i class="fas fa-trash"></i>
          清空对话
        </button>
        <button class="action-btn primary" @click="exportChat">
          <i class="fas fa-download"></i>
          导出记录
        </button>
      </div>
    </div>

    <div class="qna-container">
      <!-- 左侧对话区域 -->
      <div class="chat-section">
        <!-- 对话历史 -->
        <div class="chat-messages" ref="messagesContainer">
          <div v-if="messages.length === 0" class="welcome-message">
            <div class="welcome-content">
              <div class="ai-hero-orb">
                <div class="orb-rings">
                  <div class="ring ring-1"></div>
                  <div class="ring ring-2"></div>
                  <div class="ring ring-3"></div>
                </div>
                <div class="orb-core">
                  <div class="orb-glow"></div>
                  <div class="orb-inner">
                    <i class="fas fa-robot"></i>
                  </div>
                  <div class="orb-particles">
                    <span class="particle" :style="{'--i': 0}"></span>
                    <span class="particle" :style="{'--i': 1}"></span>
                    <span class="particle" :style="{'--i': 2}"></span>
                    <span class="particle" :style="{'--i': 3}"></span>
                    <span class="particle" :style="{'--i': 4}"></span>
                    <span class="particle" :style="{'--i': 5}"></span>
                  </div>
                </div>
              </div>
              <h3>智能运维助手</h3>
              <p>我是您的智能运维助手，可以为您解答设备维护、故障诊断、操作规程等相关问题。</p>
              <!-- <div class="quick-start-tips">
                <h4>您可以问我：</h4>
                <ul>
                  <li>设备故障诊断和处理方法</li>
                  <li>维护保养操作流程</li>
                  <li>安全规程和注意事项</li>
                  <li>技术参数查询</li>
                </ul>
              </div> -->
            </div>
          </div>

          <div v-for="message in messages" :key="message.id" :class="['message', message.type]">

            <!-- 消息头像 -->
            <div class="message-avatar">
              <div v-if="message.type === 'user'" class="user-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div v-else class="ai-avatar">
                <i class="fas fa-robot"></i>
              </div>
            </div>

            <div class="message-content">
              <div class="message-header">
                <span class="sender-name">{{ message.type === 'user' ? '您' : 'AI助手' }}</span>
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
              </div>

              <div class="message-body">
                <div v-if="message.type === 'user'" class="user-message">
                  {{ message.content }}
                </div>
                <!-- 修改AI消息显示部分 -->
                <div v-else class="ai-message">
                  <div>
                    <div v-if="message.modelLoading" class="model-loading">
                      <span class="model-loading-text">模型加载中（首次可能需要 1–2 秒）</span>
                      <div class="typing-indicator" aria-hidden="true">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                    <!-- 按照parts数组顺序直接渲染 -->
                    <div v-for="part in message.parts" :key="`part-${part.id}`" class="content-part">
                      <!-- 思考部分 -->
                      <div v-if="part.type === 'thinking'" class="expandable-section thinking-section">
                        <div
                          class="section-header"
                          @click="toggleSection(message.id, `thinking-${part.stepIndex}`)"
                        >
                          <i class="fas fa-brain"></i>
                          <span>已深度思考</span>
                          <span class="thinking-timer">（用时{{ part.thinkTime || getThinkingTime() }}）</span>
                          <i :class="['fas', isExpanded(message.id, `thinking-${part.stepIndex}`) ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
                        </div>
                        <div v-if="isExpanded(message.id, `thinking-${part.stepIndex}`)" class="section-content thinking-content">
                          <div class="thinking-step">
                            <div class="step-content">{{ part.content }}</div>
                          </div>
                        </div>
                      </div>

                      <!-- 工具调用部分 -->
                      <div v-else-if="part.type === 'tool'" class="expandable-section tool-section">
                        <div
                          class="section-header"
                          @click="toggleSection(message.id, `tool-${part.stepIndex}`)"
                        >
                          <i class="fas fa-server"></i>
                          <span>{{ getToolHeader(part) }}</span>
                          <i :class="['fas', isExpanded(message.id, `tool-${part.stepIndex}`) ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
                        </div>
                        <div v-if="isExpanded(message.id, `tool-${part.stepIndex}`)" class="section-content tool-content">
                          <AiToolRenderer :tool="getToolDisplayData(part)" theme="light" />
                        </div>
                      </div>
                      <!-- 响应内容直接展示 -->
                      <div v-else-if="part.type === 'response'" class="response-content">
                        <div v-html="formatAIResponse(part.content)"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- AI回答的操作按钮 -->
              <div v-if="message.type === 'assistant' && !message.loading" class="message-actions">
                <button class="action-btn small" @click="copyMessage(message.content)">
                  <i class="fas fa-copy"></i>
                  复制
                </button>
                <button class="action-btn small" @click="likeMessage(message.id)">
                  <i :class="message.liked ? 'fas fa-thumbs-up' : 'far fa-thumbs-up'"></i>
                  {{ message.liked ? '已点赞' : '点赞' }}
                </button>
                <button class="action-btn small" @click="regenerateResponse(message.id)">
                  <i class="fas fa-sync-alt"></i>
                  重新生成
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input-section">
          <!-- 快捷问题 -->
          <div v-if="messages.length === 0" class="quick-questions">
            <h4>常见问题：</h4>
            <div class="question-grid">
              <button
                v-for="question in quickQuestions"
                :key="question.id"
                class="question-card"
                @click="askQuestion(question.text)"
              >
                <i :class="question.icon"></i>
                <span>{{ question.text }}</span>
              </button>
            </div>
          </div>

          <!-- 输入框 -->
          <div class="input-container">
            <!-- 已上传文档标签 -->
            <div v-if="uploadedDocs.length > 0" class="doc-tags">
              <div v-for="doc in uploadedDocs" :key="doc.filename" class="doc-tag">
                <span class="doc-tag-icon">📄</span>
                <span class="doc-tag-name">{{ doc.filename }}（{{ doc.chunks }}片段）</span>
                <button
                  class="doc-tag-remove"
                  @click="removeUploadedDoc(doc.filename)"
                  :disabled="isUploading"
                  title="移除文档"
                >✕</button>
              </div>
            </div>

            <!-- 上传进度条 -->
            <div v-if="uploadProgress" class="upload-progress">
              <span class="upload-progress-label">⏳ 上传中：{{ uploadProgress.filename }}</span>
              <div class="upload-progress-track">
                <div class="upload-progress-fill" :style="{ width: uploadProgress.percent + '%' }"></div>
              </div>
              <span class="upload-progress-text">{{ uploadProgress.percent }}%</span>
            </div>

            <div class="input-wrapper">
              <textarea
                v-model="inputText"
                :placeholder="inputPlaceholder"
                :disabled="isLoading"
                @keydown="handleKeyDown"
                @input="handleInput"
                ref="inputTextarea"
                rows="1"
                class="chat-input"
              ></textarea>

              <div class="input-actions">
                <!-- 语音输入按钮：只负责录音转写，不自动发送消息。 -->
                <button
                  class="voice-btn"
                  :class="{ recording: isRecordingVoice }"
                  :disabled="isLoading || isTranscribingVoice"
                  :title="voiceButtonTitle"
                  type="button"
                  @click="toggleVoiceRecording"
                >
                  <el-icon class="button-icon" :class="{ spinning: isTranscribingVoice }">
                    <Loading v-if="isTranscribingVoice" />
                    <CircleCloseFilled v-else-if="isRecordingVoice" />
                    <Microphone v-else />
                  </el-icon>
                </button>
                <!-- 发送按钮：保持主操作样式，和语音按钮形成清晰区分。 -->
                <button
                  class="send-btn"
                  :disabled="!inputText.trim() || isLoading"
                  title="发送"
                  type="button"
                  @click="sendMessage"
                >
                  <el-icon class="button-icon" :class="{ spinning: isLoading }">
                    <Loading v-if="isLoading" />
                    <Promotion v-else />
                  </el-icon>
                </button>
              </div>
            </div>

            <div class="input-tips">
              <div class="composer-tools">
                <!-- 上传文档按钮 -->
                <label
                  class="upload-doc-btn"
                  :class="{ disabled: isUploading }"
                  title="上传文档（.docx / .txt，最大 10MB）"
                >
                  <span v-if="!isUploading">📎 上传文档</span>
                  <span v-else class="uploading-spinner">⏳ 上传中...</span>
                  <input
                    type="file"
                    accept=".docx,.txt"
                    hidden
                    @change="handleDocFileSelect"
                    :disabled="isUploading"
                  />
                </label>
                <el-dropdown
                  trigger="click"
                  placement="top-start"
                  popper-class="chat-type-dropdown-popper"
                  :disabled="isLoading"
                  @command="handleChatTypeChange"
                >
                  <button
                    type="button"
                    :class="['chat-type-trigger', `chat-type-${currentChatType}`, { disabled: isLoading }]"
                    :disabled="isLoading"
                    :title="currentChatTypeOption.description"
                    aria-label="对话模式"
                  >
                    <i class="fas fa-sliders-h"></i>
                    <span>{{ currentChatTypeOption.label }}</span>
                    <i class="fas fa-chevron-down selector-arrow"></i>
                  </button>
                  <template #dropdown>
                    <el-dropdown-menu class="chat-type-menu">
                      <el-dropdown-item
                        v-for="option in CHAT_TYPE_OPTIONS"
                        :key="option.value"
                        :command="option.value"
                        :class="{ active: currentChatType === option.value }"
                      >
                        <div class="chat-type-option-content">
                          <span class="chat-type-option-label">{{ option.label }}</span>
                          <span class="chat-type-option-desc">{{ option.description }}</span>
                        </div>
                        <i v-if="currentChatType === option.value" class="fas fa-check chat-type-check"></i>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <span v-if="isRecordingVoice" class="voice-status recording">录音中...</span>
                <span v-else-if="isTranscribingVoice" class="voice-status">语音转写中...</span>
                <span v-else class="tip">按 Enter 发送，Shift + Enter 换行</span>
              </div>
              <span class="char-count">{{ inputText.length }}/2000</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧信息面板 -->
      <div class="info-panel">
        <!-- 对话历史记录 -->
        <div class="history-section">
          <h3>历史对话</h3>
          <div class="history-list">
            <div
              v-for="session in chatSessions"
              :key="session.session_id"
              :class="['history-item', { active: currentSessionId === session.session_id }]"
              @click="loadSession(session.session_id)"
            >
              <div class="session-main">
                <!-- 历史卡片不展示底层模型名称，仅保留删除对话入口 -->
                <button class="session-delete-btn" @click.stop="deleteSession(session.session_id)" title="删除对话">
                  <svg class="session-delete-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M6 6l1 15h10l1-15" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
                </button>
                <h4 class="session-title">{{ session.title }}</h4>
                <p class="session-summary" v-if="session.summary">{{ session.summary }}</p>
                <div class="session-keywords" v-if="session.keywords && session.keywords.length">
                  <span
                    v-for="(kw, idx) in session.keywords.slice(0, 3)"
                    :key="idx"
                    class="keyword-tag"
                  >#{{ kw }}</span>
                </div>
                <div class="session-footer">
                  <span class="session-time">
                    <i class="fas fa-clock"></i>
                    {{ formatDate(new Date(session.updated_at).getTime()) }}
                  </span>
                  <span class="session-msg-count" v-if="session.message_count">
                    <i class="fas fa-comments"></i>
                    {{ session.message_count }} 条
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 知识库快捷入口 -->
        <div class="knowledge-shortcuts">
          <h3>知识库</h3>
          <div class="shortcut-list">
            <div v-for="category in knowledgeCategories" :key="category.id" class="shortcut-item">
              <i :class="category.icon"></i>
              <div class="shortcut-info">
                <h4>{{ category.name }}</h4>
                <p>{{ category.count }} 篇文档</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 使用统计 -->
        <div class="usage-stats">
          <h3>使用统计</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-number">{{ stats.totalVisits }}</span>
              <span class="stat-label">总访问数</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ stats.todayVisits }}</span>
              <span class="stat-label">今日访问</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ stats.totalQuestions }}</span>
              <span class="stat-label">总提问数</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ stats.todayQuestions }}</span>
              <span class="stat-label">今日提问</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch} from 'vue'
import { ElMessage } from 'element-plus'
import { CircleCloseFilled, Loading, Microphone, Promotion } from '@element-plus/icons-vue'
import {getAiResponse, newChatSessionId, getChatSessionList, getChatSessionMessages, deleteChatSession, getUsageSummary, uploadTempDocApi, removeTempDocApi, transcribeAudioApi} from '@/api/ai/index.ts'
import { getKbContentTypesApi } from '@/api/knowledgebase/index.ts'
import AiToolRenderer from '@/components/AiToolRenderer/index.vue'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import { buildHistoryMessages } from '@/utils/aiHistoryMessages'
import {
  CHAT_TYPE_OPTIONS,
  DEFAULT_CHAT_TYPE,
  normalizeChatType,
  shouldRestoreChatTypeFromSession,
} from '@/utils/chatType'
import {
  createToolDisplayData,
  getToolHeaderText,
  isAiToolCallPayload,
  isAiToolResultPayload,
  mergeToolResultData,
  parseSseJsonLine,
} from '@/utils/aiToolStream'
import {
  buildVoiceButtonTitle,
  extractTranscribeText,
  getSupportedRecorderMimeType,
} from '@/utils/voiceInput'
import type { AiToolDisplayData, AiToolResult, AiToolStatus } from '@/utils/aiToolStream'
import type { ChatType } from '@/utils/chatType'

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
})


// 定义组件名称
defineOptions({
  name: 'AiQnaPage'
})

// 定义消息类型
interface MessagePart {
  id: number
  session_id: string
  type: 'thinking' | 'tool' | 'response'
  content: string
  tool_calls?: toolDetail[]
  tool_call_id?:string
  parent_message_id?:number
  stepIndex?: number // 用于标识思考步骤顺序
  thinkTime?: string // 记录思考时间戳
  toolName?: string
  toolStatus?: AiToolStatus
  toolArguments?: Record<string, unknown>
  toolResult?: AiToolResult
}

interface toolDetail {
  index?: number,
  id: string,
  type?: string,
  function: {
    name: string,
    arguments?: string
  },
}

interface ToolStreamPayload {
  tool_call_id: string
  content: string
  session_id: string
  tool_calls?: toolDetail[]
  parent_message_id?: number
}

const isToolStreamPayload = (value: unknown): value is ToolStreamPayload => {
  if (!value || typeof value !== 'object') return false
  return (
    'tool_call_id' in value &&
    'content' in value &&
    'session_id' in value
  )
}

// 定义类型接口
interface Message {
  id: number,
  type: 'user' | 'assistant'
  content: string
  timestamp?: number
  loading?: boolean
  modelLoading?: boolean
  liked?: boolean
  parts?: MessagePart[]
}


interface QuickQuestion {
  id: number
  text: string
  icon: string
}

interface ChatSession {
  session_id: string
  title: string
  model_name: string
  chat_type?: ChatType
  status: number
  created_at: string
  updated_at: string
  summary?: string       // 对话摘要
  keywords?: string[]    // 关键词标签
  message_count?: number // 消息数量
}

interface KnowledgeCategory {
  id: number
  name: string
  icon: string
  count: number
}

// 响应式数据
const messages = ref<Message[]>([])
const inputText = ref<string>('')
const isLoading = ref<boolean>(false)
const isRecordingVoice = ref(false)
const isTranscribingVoice = ref(false)
const currentSessionId = ref<string | null>("-1") // 当前对话ID，null表示无对话
const currentChatType = ref<ChatType>(DEFAULT_CHAT_TYPE)
const messagesContainer = ref<HTMLDivElement | null>(null)
const inputTextarea = ref<HTMLTextAreaElement | null>(null)

const currentChatTypeOption = computed(() => {
  return CHAT_TYPE_OPTIONS.find((option) => option.value === currentChatType.value) || CHAT_TYPE_OPTIONS[0]
})

const voiceButtonTitle = computed(() => {
  return buildVoiceButtonTitle(isRecordingVoice.value, isTranscribingVoice.value)
})

const MAX_VOICE_RECORDING_MS = 60000
let voiceRecorder: MediaRecorder | null = null
let voiceStream: MediaStream | null = null
let voiceChunks: Blob[] = []
let voiceStopTimer: number | null = null
let ignoreNextVoiceStop = false

const handleChatTypeChange = (value: unknown) => {
  currentChatType.value = normalizeChatType(value)
}

// 快捷问题
const quickQuestions = ref<QuickQuestion[]>([
  {
    id: 2,
    text: '设备维护保养的标准流程是什么？',
    icon: 'fas fa-tools',
  },
  {
    id: 3,
    text: '如何判断设备是否需要更换零件？',
    icon: 'fas fa-cogs',
  },
  {
    id: 4,
    text: '安全操作规程有哪些要点？',
    icon: 'fas fa-shield-alt',
  },
  // {
  //   id: 5,
  //   text: '设备故障代码查询',
  //   icon: 'fas fa-code',
  // },
  // {
  //   id: 6,
  //   text: '温度异常的处理方法',
  //   icon: 'fas fa-thermometer-half',
  // },
])

// 对话历史
const chatSessions = ref<ChatSession[]>([])

// 知识库分类（从真实接口加载）
const knowledgeCategories = ref<KnowledgeCategory[]>([])

const getKnowledgeIcon = (name: string) => {
  if (name.includes('维修') || name.includes('检修')) return 'fas fa-book'
  if (name.includes('操作') || name.includes('规程')) return 'fas fa-list-alt'
  if (name.includes('故障') || name.includes('报警')) return 'fas fa-exclamation-triangle'
  if (name.includes('标准') || name.includes('规范')) return 'fas fa-certificate'
  return 'fas fa-folder-open'
}

// 使用统计
const stats = reactive({
  totalVisits: 0,
  todayVisits: 0,
  totalQuestions: 0,
  todayQuestions: 0,
})

const overThink = ref<boolean>(false)

// 在响应式数据中添加计时器相关状态



const startTime = ref<number>(0)
const currentTime = ref<number>(0)
let thinkingTimer: number

// 获取思考时间显示
const getThinkingTime = () => {
  const duration = (currentTime.value - startTime.value) / 1000
  return `${duration.toFixed(1)}s`
}

// 计算属性
const inputPlaceholder = ref<string>('请输入您的问题...')


// 添加展开状态管理
const expandedSections = ref<Record<string, Set<string>>>({})

// 文档上传相关状态
interface UploadedDoc {
  filename: string
  chunks: number
}
const uploadedDocs = ref<UploadedDoc[]>([])
const uploadProgress = ref<{ filename: string; percent: number } | null>(null)
const isUploading = ref(false)

// 允许的文件类型与大小限制
const ALLOWED_DOC_TYPES = ['.docx', '.txt']
const MAX_DOC_SIZE = 10 * 1024 * 1024 // 10MB

// 切换展开状态
const toggleSection = (messageId: number, sectionType: string) => {
  const key = `${messageId}`
  if (!expandedSections.value[key]) {
    expandedSections.value[key] = new Set()
  }

  if (expandedSections.value[key].has(sectionType)) {
    expandedSections.value[key].delete(sectionType)
  } else {
    expandedSections.value[key].add(sectionType)
  }
}

// 检查是否展开
const isExpanded = (messageId: number, sectionType: string) => {
  const key = `${messageId}`
  return expandedSections.value[key]?.has(sectionType) || false
}

const parseLegacyToolArguments = (argumentsText?: string) => {
  if (!argumentsText) return undefined
  try {
    return JSON.parse(argumentsText) as Record<string, unknown>
  } catch {
    return { arguments: argumentsText }
  }
}

const getToolDisplayData = (part: MessagePart): AiToolDisplayData => {
  const toolName = part.toolName || part.tool_calls?.[0]?.function.name || 'unknown'
  return {
    callId: part.tool_call_id || '',
    name: toolName,
    status: part.toolStatus || (part.toolResult?.success === false ? 'error' : 'success'),
    arguments: part.toolArguments || parseLegacyToolArguments(part.tool_calls?.[0]?.function.arguments),
    result: part.toolResult,
    legacyContent: part.content,
  }
}

const getToolHeader = (part: MessagePart) => getToolHeaderText(getToolDisplayData(part))

const upsertToolPart = (
  messageIndex: number,
  tool: AiToolDisplayData,
  stepIndex: number,
) => {
  const message = messages.value[messageIndex]
  if (!message) return

  if (!message.parts) {
    message.parts = []
  }

  const existingPart = message.parts.find((part) => (
    part.type === 'tool' && part.tool_call_id === tool.callId
  ))
  const content = tool.status === 'running'
    ? getToolHeaderText(tool)
    : tool.result?.content || tool.legacyContent || ''

  if (existingPart) {
    existingPart.content = content
    existingPart.toolName = tool.name
    existingPart.toolStatus = tool.status
    existingPart.toolArguments = tool.arguments || existingPart.toolArguments
    existingPart.toolResult = tool.result
    existingPart.stepIndex = existingPart.stepIndex || stepIndex
  } else {
    // 新协议的 tool_call 和 tool_result 通过 call_id 合并到同一个展示块。
    message.parts.push({
      id: Date.now() + Math.random(),
      session_id: currentSessionId.value || '',
      type: 'tool',
      content,
      stepIndex,
      tool_call_id: tool.callId,
      toolName: tool.name,
      toolStatus: tool.status,
      toolArguments: tool.arguments,
      toolResult: tool.result,
    })
  }

  scrollToBottom()
}



// 提问
const sendMessage = async () => {
  if (!inputText.value.trim() || isLoading.value) return
  // 锁定本次发送使用的对话模式，避免后续切换影响已经发出的消息。
  const sendingChatType = currentChatType.value

  const userMessage: Message = {
    id: Date.now(),
    type: 'user',
    content: inputText.value.trim(),
    timestamp: new Date().getTime(),
  }

  messages.value.push(userMessage)


  inputText.value = ''

  // 自动调整输入框高度
  nextTick(() => {
    autoResizeTextarea()
    scrollToBottom()
  })

  if (currentSessionId.value === "-1"){
    await newChatSessionId({model_name:"qwen3:32b",title:"新对话", chat_type: sendingChatType}).then((res) => {
      currentSessionId.value = res.data.session_id
      currentChatType.value = normalizeChatType(res.data.chat_type ?? sendingChatType)
    })
  }
  console.log(currentSessionId.value)
  // 显示AI正在输入
  const aiMessage: Message = {
    id: Date.now() + 1,
    type: 'assistant',
    content: '',
    timestamp: new Date().getTime(),
    loading: true,
    modelLoading: false,
    liked: false,
    parts: []
  }
  messages.value.push(aiMessage)
  isLoading.value = true

  // 如果首包迟迟不来（例如首次加载模型到显卡），显示“模型加载中”提示
  const warmupTimer = window.setTimeout(() => {
    const idx = messages.value.findIndex((msg) => msg.id === aiMessage.id)
    if (idx !== -1) {
      const msg = messages.value[idx]
      if (msg.loading && (msg.parts?.length || 0) === 0) {
        msg.modelLoading = true
      }
    }
  }, 300)

  let currentThinkStepIndex = 0 // 用于跟踪思考步骤

  nextTick(() => {
    scrollToBottom()
  })
  //TODO:没加历史

  console.log(userMessage.content)
  getAiResponse({
    session_id: currentSessionId.value || '',
    content: userMessage.content,
    chat_type: sendingChatType,
    // message: {
    //   session_id: currentSessionId.value || '',
    //   role: 'user',
    //   model_type: 'qwen3:8b',
    //   content: userMessage.content,
    //   is_first: true,
    // }
  }).then(async (response) => {
    if (!response.ok || !response.body) {
      throw new Error('Network response was not ok');
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const startThinking = () => {
      startTime.value = Date.now()
      currentTime.value = Date.now()
      thinkingTimer = window.setInterval(() => {
        currentTime.value = Date.now()
      }, 100)
      overThink.value = true
      currentThinkStepIndex++
      toggleSection(aiMessage.id, `thinking-${currentThinkStepIndex}`) // 默认展开思考部分
    }

    const finishThinking = (aiMessageIndex: number, sessionId?: string) => {
      if (!overThink.value) return
      const finalDuration = (Date.now() - startTime.value) / 1000
      const finalTime = `${finalDuration.toFixed(1)}s`
      // 仅更新计时，不追加内容
      addMessagePart(aiMessageIndex, 'thinking', '', sessionId || currentSessionId.value || '', currentThinkStepIndex, finalTime)
      clearInterval(thinkingTimer)
      overThink.value = false
    }

    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, {stream: true});
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? ''; // 保留未完整的一行
      let a=1
      for (const line of lines) {
        console.log(a)
        a++
        if (line.trim() === '') continue;
        try {
          const result = parseSseJsonLine(line);
          if (!result) continue
          const payload = result.data;
          console.log(payload)
          const aiMessageIndex = messages.value.findIndex((msg) => msg.id === aiMessage.id)
          if (aiMessageIndex !== -1) {
            // 一旦开始收到任何流式数据，就认为“模型加载”阶段结束
            clearTimeout(warmupTimer)
            if (messages.value[aiMessageIndex].modelLoading) {
              messages.value[aiMessageIndex].modelLoading = false
            }

            if (result.data_type === 'tool') {
              finishThinking(aiMessageIndex)

              if (isAiToolCallPayload(payload)) {
                currentThinkStepIndex++
                const tool = createToolDisplayData(payload)
                upsertToolPart(aiMessageIndex, tool, currentThinkStepIndex)
                toggleSection(aiMessage.id, `tool-${currentThinkStepIndex}`) // 默认展开新的工具部分
                continue
              }

              if (isAiToolResultPayload(payload)) {
                const existingPart = messages.value[aiMessageIndex].parts?.find((part) => (
                  part.type === 'tool' && part.tool_call_id === payload.call_id
                ))
                const stepIndex = existingPart?.stepIndex || ++currentThinkStepIndex
                const tool = mergeToolResultData(
                  existingPart ? getToolDisplayData(existingPart) : undefined,
                  payload,
                )
                upsertToolPart(aiMessageIndex, tool, stepIndex)
                if (!existingPart) {
                  toggleSection(aiMessage.id, `tool-${stepIndex}`)
                }
                continue
              }

              console.warn('未知工具事件:', payload)
              continue
            }

            // 1) 旧版工具调用：兼容后端曾经返回的 tool_call_id/content/session_id 结构
            if (isToolStreamPayload(payload)) {
              currentThinkStepIndex++
              // 处理工具响应
              addMessagePart(
                aiMessageIndex,
                'tool',
                payload.content,
                payload.session_id,
                currentThinkStepIndex,
                undefined,
                payload.tool_calls,
                payload.tool_call_id,
                payload.parent_message_id,
              )
              toggleSection(aiMessage.id, `tool-${currentThinkStepIndex}`) // 默认展开新的工具部分
            }
            else {
              // 2) 普通流式文本（字符串 token）
              const text = String(payload ?? '')
              if (!text || text === '\n\n') continue

              // 兼容后端“每个 token 都包一层 <think>...</think>”的情况：都追加到同一个思考块
              const isThinkWrapped = text.includes('<think>') && text.includes('</think>')
              const isThinkStartOnly = text.includes('<think>') && !text.includes('</think>')
              const isThinkEndOnly = !text.includes('<think>') && text.includes('</think>')

              if (isThinkWrapped) {
                if (!overThink.value) startThinking()
                const inner = text.replace('<think>', '').replace('</think>', '')
                if (inner) {
                  addMessagePart(aiMessageIndex, 'thinking', inner, currentSessionId.value || '', currentThinkStepIndex)
                }
                // 这里不结束思考：直到收到非 think 文本再结束
              } else if (isThinkStartOnly) {
                if (!overThink.value) startThinking()
                const inner = text.replace('<think>', '')
                if (inner.trim()) {
                  addMessagePart(aiMessageIndex, 'thinking', inner, currentSessionId.value || '', currentThinkStepIndex)
                }
              } else if (isThinkEndOnly) {
                const inner = text.replace('</think>', '')
                if (inner.trim()) {
                  addMessagePart(aiMessageIndex, 'thinking', inner, currentSessionId.value || '', currentThinkStepIndex)
                }
                finishThinking(aiMessageIndex)
              } else if (overThink.value) {
                // 只要收到非 think 文本，就认为思考结束并进入最终回答流
                finishThinking(aiMessageIndex)
                addMessagePart(aiMessageIndex, 'response', text)
              } else {
                addMessagePart(aiMessageIndex, 'response', text)
              }
            }
          }
        }catch (e) {
          console.error('JSON解析失败:', e, line);
        }
      }
    }

    // 流结束，结束加载状态
    const aiMessageIndex = messages.value.findIndex((msg) => msg.id === aiMessage.id)
    if (aiMessageIndex !== -1) {
      messages.value[aiMessageIndex].loading = false
      messages.value[aiMessageIndex].modelLoading = false
    }
    isLoading.value = false
    // 流结束后刷新会话列表，更新标题/摘要/关键词
    await refreshSessionList()
  })
}


// 添加消息部分（思考、工具调用、响应）
const addMessagePart = (
  messageIndex: number,
  type: 'thinking' | 'tool' | 'response',
  content: string,
  session_id: string = currentSessionId.value || '',
  stepIndex?: number,
  thinkTime?: string,
  tool_calls?: toolDetail[],
  tool_call_id?:string,
  parent_message_id?:number,
) => {
  if (messageIndex === -1) return

  const lastMessage = messages.value[messageIndex]
  const partId = Date.now() + Math.random() // 确保唯一性

  // 查找是否已存在相同类型和步骤的部分
  const existingPart = lastMessage.parts?.find(part => {
    if (type === 'thinking' || type === 'tool') {
      return part.type === type && part.stepIndex === stepIndex
    }
    return part.type === type
  })
  if (existingPart) {
    // 更新现有内容
    if (type === 'response') {
      // 对于响应内容，添加延迟实现流式效果
      setTimeout(() => {
        existingPart.content += content;
        if (thinkTime) {
          existingPart.thinkTime = thinkTime
        }
        scrollToBottom();
      }, 50); // 50ms延迟，可根据需要调整
    } else {
      // 其他类型内容正常处理
      existingPart.content += content
      if (thinkTime) {
        existingPart.thinkTime = thinkTime
      }
      scrollToBottom()
    }
  } else {
    // 创建新的部分
    lastMessage.parts?.push({
      id: partId,
      session_id,
      type,
      content,
      stepIndex,
      tool_calls,
      tool_call_id,
      parent_message_id,
      thinkTime
    })
  }
}






const simulateAIResponse = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(
      () => {
        // 模拟不同类型问题的回答
        if (question.includes('异响')) {
          resolve(`<think> 好的。 </think>

<tool_response> MCP服务器：retrieve_coal_mine_regulations {
</tool_response>

<think> 好的，用户问的是井下发现瓦斯超限怎么处理。首先我需要调用MCP_retrieve_coal_mine_regulations工具来查找相关条款。根据之前的工具描述，这个工具会在《煤矿安全规程》中检索相关内容。用户可能需要具体的条款和处理步骤，所以我要确保查询的关键词准确，比如“瓦斯超限”和“处理措施”。

在用户提供的工具结果里，有多个条款涉及瓦斯超限的处理。比如第一百九十六条提到当瓦斯超限达到断电浓度时，相关人员有权停止作业并撤离人员。还有第七百七十条处理瓦斯爆炸事故的步骤，虽然用户问的是超限，但可能相关。此外，第二百四十三条和第五百二十二条也提到了防瓦斯超限的措施，比如安全监测和断电开关的要求。

需要将这些信息整理成清晰的处理步骤，确保涵盖应急处理、安全措施和预防方法。同时要注意引用正确的条款，比如第一百九十六条和第七百七十条，可能还需要提到其他相关条款如第二百四十三条和第五百二十二条中的具体要求，比如防煤尘措施和锂电池的安全要求。最后，要提醒用户遵循这些规定，并在必要时联系专业人员，确保处理得当。<think>

根据《煤矿安全规程》相关条款，井下发现瓦斯超限应按以下程序处理：

**1. 紧急处置（依据第196条）**
- 立即停止作业，切断电源
- 瓦斯超限达到断电浓度时，班组长、瓦斯检查工等有权责令停电撤人
- 作业人员必须第一时间撤离至安全地点`)
        } else if (question.includes('维护') || question.includes('保养')) {
          resolve(`设备维护保养的标准流程如下：

**日常维护（每班次）**
- 检查设备运行状态指示灯
- 记录运行参数（温度、压力、电流等）
- 清洁设备表面，保持整洁
- 检查安全防护装置

**周期性保养**
- **周保养**：润滑点加油，紧固件检查
- **月保养**：更换滤芯，检查传动部件
- **季度保养**：更换润滑油，检修电气设备
- **年度保养**：大修检查，零部件更换

**保养要点**
1. 严格按照保养计划执行
2. 使用指定型号的润滑油和备件
3. 详细记录保养过程和发现的问题
4. 保养后进行试运行确认

需要具体设备的保养手册吗？我可以为您提供更详细的指导。`)
        } else if (question.includes('安全')) {
          resolve(`煤矿设备安全操作规程要点：

**操作前准备**
- 穿戴完整的个人防护设备
- 检查设备安全装置是否正常
- 确认操作区域无其他人员
- 核对操作票和工作任务

**操作中注意事项**
- 严格按照操作规程执行
- 密切监控设备运行状态
- 发现异常立即停机检查
- 禁止带故障运行

**特殊要求**
- 井下作业必须携带自救器
- 电气设备操作需验电确认
- 高空作业必须使用安全带
- 密闭空间作业需通风检测

**应急处置**
- 制定应急预案并定期演练
- 配备急救药品和救援设备
- 建立快速报警机制
- 掌握设备紧急停机程序

安全无小事，请严格遵守操作规程！`)
        } else {
          resolve(`感谢您的提问。基于我的知识库分析：

针对您的问题，我建议：

1. **问题分析**：请提供更多具体信息，如设备型号、故障现象、发生时间等
2. **初步建议**：可以先查看相关技术手册或联系专业技术人员
3. **预防措施**：建议加强设备日常巡检和维护保养

如果您能提供更详细的问题描述，我可以给出更精准的解答。您也可以通过以下方式获取帮助：
- 查阅设备维修手册
- 联系设备厂家技术支持
- 咨询现场技术专家

还有其他需要了解的吗？`)
        }
      },
      2000 + Math.random() * 2000,
    ) // 随机延迟2-4秒
  })
}

const askQuestion = (question: string) => {
  inputText.value = question
  sendMessage()
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const handleInput = () => {
  nextTick(() => {
    autoResizeTextarea()
  })
}

const toggleVoiceRecording = async () => {
  if (isLoading.value || isTranscribingVoice.value) return

  if (isRecordingVoice.value) {
    stopVoiceRecording()
    return
  }

  await startVoiceRecording()
}

const startVoiceRecording = async () => {
  if (!isVoiceInputSupported()) {
    ElMessage.warning('当前浏览器不支持语音输入')
    return
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    })
    const mimeType = getSupportedRecorderMimeType(MediaRecorder)
    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)

    voiceStream = stream
    voiceRecorder = recorder
    voiceChunks = []
    ignoreNextVoiceStop = false

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        voiceChunks.push(event.data)
      }
    }

    recorder.onstop = () => {
      void handleVoiceRecordingStop(recorder.mimeType || mimeType || 'audio/webm')
    }

    recorder.start()
    isRecordingVoice.value = true
    ElMessage.info('开始录音，再次点击麦克风停止')

    // 限制单次录音时长，避免长录音造成后端转写压力过大。
    voiceStopTimer = window.setTimeout(() => {
      ElMessage.info('录音已达到 60 秒，正在转写')
      stopVoiceRecording()
    }, MAX_VOICE_RECORDING_MS)
  } catch (error) {
    cleanupVoiceRecorder()
    console.error('启动语音录制失败:', error)
    ElMessage.error('无法访问麦克风，请检查浏览器权限')
  }
}

const stopVoiceRecording = () => {
  if (!voiceRecorder) return

  clearVoiceStopTimer()
  if (voiceRecorder.state !== 'inactive') {
    isRecordingVoice.value = false
    voiceRecorder.stop()
    return
  }

  cleanupVoiceRecorder()
  isRecordingVoice.value = false
}

const handleVoiceRecordingStop = async (mimeType: string) => {
  const chunks = voiceChunks
  const shouldIgnore = ignoreNextVoiceStop
  cleanupVoiceRecorder()
  isRecordingVoice.value = false
  ignoreNextVoiceStop = false

  if (shouldIgnore) return

  const audioBlob = new Blob(chunks, { type: mimeType })
  if (audioBlob.size === 0) {
    ElMessage.warning('未录到有效语音')
    return
  }

  isTranscribingVoice.value = true
  try {
    const response = await transcribeAudioApi(audioBlob, { language: 'zh' })
    const text = extractTranscribeText(response)
    fillVoiceText(text)
    ElMessage.success('语音转写完成')
  } catch (error) {
    console.error('语音转写失败:', error)
    const message = error instanceof Error ? error.message : '语音转写失败'
    ElMessage.error(message)
  } finally {
    isTranscribingVoice.value = false
  }
}

const fillVoiceText = (text: string) => {
  const currentText = inputText.value.trim()
  inputText.value = currentText ? `${currentText}\n${text}` : text
  handleInput()
  nextTick(() => inputTextarea.value?.focus())
}

const cleanupVoiceRecorder = () => {
  clearVoiceStopTimer()
  voiceRecorder = null
  voiceChunks = []
  voiceStream?.getTracks().forEach((track) => track.stop())
  voiceStream = null
}

const clearVoiceStopTimer = () => {
  if (voiceStopTimer !== null) {
    window.clearTimeout(voiceStopTimer)
    voiceStopTimer = null
  }
}

const isVoiceInputSupported = () => {
  return typeof navigator !== 'undefined'
    && Boolean(navigator.mediaDevices?.getUserMedia)
    && typeof MediaRecorder !== 'undefined'
}

const autoResizeTextarea = () => {
  if (inputTextarea.value) {
    inputTextarea.value.style.height = 'auto'
    inputTextarea.value.style.height = inputTextarea.value.scrollHeight + 'px'
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  }
}

// 处理文档文件选择上传
const handleDocFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // 前端校验：文件扩展名
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!ALLOWED_DOC_TYPES.includes(ext)) {
    ElMessage.error('文件格式不支持，仅支持 .docx / .txt')
    input.value = ''
    return
  }

  // 前端校验：文件大小
  if (file.size > MAX_DOC_SIZE) {
    ElMessage.error('文件大小超过 10MB 限制')
    input.value = ''
    return
  }

  // 如果还没有会话，先自动创建一个（和 sendMessage 逻辑一致）
  if (!currentSessionId.value || currentSessionId.value === '-1') {
    try {
      const res = await newChatSessionId({
        model_name: 'qwen3:32b',
        title: '文档问答',
        chat_type: currentChatType.value,
      })
      currentSessionId.value = res.data.session_id
    } catch {
      ElMessage.error('创建会话失败，请稍后重试')
      input.value = ''
      return
    }
  }

  isUploading.value = true
  uploadProgress.value = { filename: file.name, percent: 0 }

  try {
    const res = await uploadTempDocApi(
      currentSessionId.value,
      file,
      (e) => {
        if (e.lengthComputable && e.total) {
          const percent = Math.round((e.loaded / e.total) * 100)
          uploadProgress.value = { filename: file.name, percent }
        }
      }
    )

    if (res.code === 1 && res.data) {
      uploadedDocs.value.push({
        filename: res.data.filename,
        chunks: res.data.chunks,
      })
      ElMessage.success(res.message || `文档「${res.data.filename}」已索引（${res.data.chunks} 个片段）`)
    } else {
      ElMessage.error(res.message || '文档上传失败')
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    const msg = err?.response?.data?.message || err?.message || '文档上传失败，请重试'
    ElMessage.error(msg)
  } finally {
    isUploading.value = false
    uploadProgress.value = null
    input.value = ''
  }
}

// 移除已上传文档
const removeUploadedDoc = async (filename: string) => {
  if (!currentSessionId.value || currentSessionId.value === '-1') return

  try {
    const res = await removeTempDocApi(currentSessionId.value, filename)
    if (res.code === 1) {
      uploadedDocs.value = uploadedDocs.value.filter((d) => d.filename !== filename)
      ElMessage.success(`文档「${filename}」已移除`)
    } else {
      ElMessage.error(res.message || '移除文档失败')
    }
  } catch (error: unknown) {
    // 如果后端未实现 remove_doc 接口，仅从前端移除
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    const msg = err?.response?.data?.message || err?.message || ''
    if (msg.includes('404') || msg.includes('not found') || msg.includes('Not Found')) {
      uploadedDocs.value = uploadedDocs.value.filter((d) => d.filename !== filename)
    } else {
      ElMessage.error(msg || '移除文档失败')
    }
  }
}

const formatTime = (timestamp?: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatAIResponse = (content: string) => {
  // 将模型输出按 Markdown 渲染，并进行 XSS 清洗
  return DOMPurify.sanitize(md.render(content || ''))
}

const copyMessage = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    // 这里可以添加复制成功的提示
  } catch (error) {
    console.error('复制失败:', error)
  }
}

const likeMessage = (messageId: number) => {
  const message = messages.value.find((msg) => msg.id === messageId)
  if (message) {
    message.liked = !message.liked
  }
}

const regenerateResponse = async (messageId: number) => {
  const messageIndex = messages.value.findIndex((msg) => msg.id === messageId)
  if (messageIndex !== -1) {
    const message = messages.value[messageIndex]
    const userMessage = messages.value[messageIndex - 1]

    if (userMessage && userMessage.type === 'user') {
      // 重新生成回答
      message.loading = true
      message.content = ''

      try {
        const response = await simulateAIResponse(userMessage.content)
        message.content = response
        message.loading = false
      } catch {
        message.content = '重新生成失败，请稍后再试。'
        message.loading = false
      }
    }
  }
}

const clearHistory = () => {
  messages.value = []
}

// 新建对话
const newChat = () => {
  messages.value = []
  inputText.value = ''
  currentSessionId.value = '-1'
  uploadedDocs.value = []
  uploadProgress.value = null
  isUploading.value = false
  // 新建对话不重置模式，用户可以先选普通模式再发送第一条消息。
}



const exportChat = () => {
  // 导出对话记录
  const chatContent = messages.value
    .map((msg) => `${msg.type === 'user' ? '用户' : 'AI助手'}: ${msg.content}`)
    .join('\n\n')

  const blob = new Blob([chatContent], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `智能问答记录_${new Date().toLocaleDateString()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

const loadSession = async (sessionId: string) => {
  // 加载历史对话
  currentSessionId.value = sessionId
  uploadedDocs.value = []
  uploadProgress.value = null
  isUploading.value = false
  const selectedSession = chatSessions.value.find((session) => session.session_id === sessionId)
  if (shouldRestoreChatTypeFromSession('session-load')) {
    currentChatType.value = normalizeChatType(selectedSession?.chat_type)
  }
  messages.value = [] // 清空当前消息列表

  try {
    const response = await getChatSessionMessages(sessionId)
    if (response.code === 1 && Array.isArray(response.data)) {
      // 历史接口现在会返回 assistant.tool_calls 和 role=tool 的工具结果，
      // 这里转换成实时流相同的 messages.parts 结构，图表、查询表格等才能重新渲染。
      messages.value.push(...buildHistoryMessages(response.data))
    }

    // 滚动到底部
    await nextTick()
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  } catch (error) {
    console.error('加载会话消息失败:', error)
  }
}

const deleteSession = async (sessionId: string) => {
  // 显示确认对话框
  if (!confirm('确定要删除这个对话吗？删除后无法恢复。')) {
    return
  }

  try {
    // 调用后端API删除会话
    const response: IApiResponseData<null> = await deleteChatSession(sessionId)

    if (response.code === 1) {
      // 后端删除成功后，更新本地状态
      const index = chatSessions.value.findIndex((session) => session.session_id === sessionId)
      if (index !== -1) {
        chatSessions.value.splice(index, 1)
      }

      // 如果当前正在查看的是被删除的会话，清空当前消息
      if (currentSessionId.value === sessionId) {
        messages.value = []
        currentSessionId.value = '-1'
      }

      ElMessage.success('会话删除成功')
      await refreshSessionList()
    } else {
      ElMessage.error(response.message || '删除会话失败')
    }
  } catch (error) {
    console.error('删除会话失败:', error)
    ElMessage.error('网络错误，请稍后重试')
  }
}

// 刷新会话列表
const refreshSessionList = async () => {
  try {
    const response = await getChatSessionList()
    if (response && response.data && Array.isArray(response.data)) {
      chatSessions.value = response.data as ChatSession[]
      // 列表刷新只同步标题/摘要等展示信息，不能覆盖用户刚在输入框里切换的对话模式。
    }
  } catch (error) {
    console.error('获取会话列表失败:', error)
  }
}

// 刷新知识库分类（真实接口）
const refreshKnowledgeCategories = async () => {
  try {
    const response = await getKbContentTypesApi()
    if (response.code === 1 && Array.isArray(response.data)) {
      knowledgeCategories.value = response.data.map((item, index) => ({
        id: item.id ?? index + 1,
        name: item.name,
        icon: getKnowledgeIcon(item.name),
        count: item.fileCnt ?? 0,
      }))
    }
  } catch (error) {
    console.error('获取知识库分类失败:', error)
  }
}

// 刷新使用统计（真实接口）
const refreshUsageStats = async () => {
  try {
    const response = await getUsageSummary()
    if (response.code === 1 && response.data) {
      stats.totalVisits = response.data.total_visits ?? 0
      stats.todayVisits = response.data.today_visits ?? 0
      stats.totalQuestions = response.data.total_questions ?? 0
      stats.todayQuestions = response.data.today_questions ?? 0
    }
  } catch (error) {
    console.error('获取使用统计失败:', error)
  }
}

// 生命周期
onMounted(async () => {
  await Promise.all([refreshSessionList(), refreshKnowledgeCategories(), refreshUsageStats()])
})

onBeforeUnmount(() => {
  ignoreNextVoiceStop = true
  if (voiceRecorder && voiceRecorder.state !== 'inactive') {
    voiceRecorder.stop()
  }
  cleanupVoiceRecorder()
})

// 监听输入文本变化
watch(inputText, () => {
  if (inputText.value.length > 2000) {
    inputText.value = inputText.value.substring(0, 2000)
  }
})
</script>

<style scoped>
.ai-qna-page {
  --brand-primary: #1677ff;
  --brand-secondary: #2f54eb;
  --brand-accent: #13c2c2;
  --text-main: #1f2a44;
  --text-sub: #5d6b8a;
  --border-soft: #dfe7f6;
  --bg-soft: #f3f7ff;
  --panel-bg: rgba(255, 255, 255, 0.92);
  --shadow-soft: 0 10px 30px rgba(22, 119, 255, 0.08);
  background:
    radial-gradient(circle at 85% 10%, rgba(22, 119, 255, 0.12), transparent 36%),
    radial-gradient(circle at 10% 90%, rgba(19, 194, 194, 0.08), transparent 32%),
    linear-gradient(165deg, #f7faff 0%, #eef4ff 55%, #f9fbff 100%);
  height: 100%;
  padding: 8px 12px 10px;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding: 16px 22px;
  background: var(--panel-bg);
  border: 1px solid var(--border-soft);
  border-radius: 14px;
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(4px);
}

.header-left h1 {
  margin: 0 0 6px 0;
  color: var(--text-main);
  font-size: 25px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.header-left p {
  margin: 0;
  color: var(--text-sub);
  font-size: 13px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 9px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid transparent;
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(22, 119, 255, 0.28);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.82);
  color: var(--text-main);
  border-color: #cedaf3;
}

.action-btn.small {
  padding: 5px 10px;
  font-size: 12px;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.action-btn.primary:hover {
  box-shadow: 0 10px 22px rgba(22, 119, 255, 0.34);
}

.action-btn.secondary:hover {
  border-color: #9fb9eb;
  background: #ffffff;
  color: var(--brand-primary);
}

.qna-container {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 16px;
  height: calc(100vh - 204px);
}

.chat-section {
  display: flex;
  flex-direction: column;
  background: var(--panel-bg);
  border: 1px solid var(--border-soft);
  border-radius: 14px;
  box-shadow: var(--shadow-soft);
  overflow: hidden;
  min-height: 0;
  margin-bottom: 8px;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background:
    linear-gradient(180deg, rgba(243, 247, 255, 0.85) 0%, rgba(255, 255, 255, 0.9) 80%),
    repeating-linear-gradient(
      0deg,
      rgba(99, 126, 201, 0.04) 0,
      rgba(99, 126, 201, 0.04) 1px,
      transparent 1px,
      transparent 22px
    );
}

.welcome-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
}

.welcome-content {
  max-width: 500px;
  overflow: auto;
}

/* ---- AI Hero Orb ---- */
.ai-hero-orb {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 16px auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 旋转光环 */
.orb-rings {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid transparent;
}

.ring-1 {
  width: 120px;
  height: 120px;
  border-color: rgba(24, 144, 255, 0.35);
  border-top-color: rgba(24, 144, 255, 0.9);
  animation: orb-spin 3s linear infinite;
}

.ring-2 {
  width: 96px;
  height: 96px;
  border-color: rgba(64, 169, 255, 0.25);
  border-right-color: rgba(64, 169, 255, 0.8);
  animation: orb-spin 2s linear infinite reverse;
}

.ring-3 {
  width: 72px;
  height: 72px;
  border-color: rgba(0, 209, 255, 0.2);
  border-bottom-color: rgba(0, 209, 255, 0.7);
  animation: orb-spin 4s linear infinite;
}

@keyframes orb-spin {
  to { transform: rotate(360deg); }
}

/* 核心球体 */
.orb-core {
  position: relative;
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.orb-glow {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(24, 144, 255, 0.4) 0%, rgba(24, 144, 255, 0.1) 50%, transparent 70%);
  animation: orb-pulse 2.5s ease-in-out infinite;
}

@keyframes orb-pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50%       { transform: scale(1.18); opacity: 1; }
}

.orb-inner {
  position: relative;
  z-index: 2;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: linear-gradient(145deg, #1677ff 0%, #0958d9 40%, #003eb3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 0 0 2px rgba(24, 144, 255, 0.3),
    0 8px 32px rgba(24, 144, 255, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2);
}

.orb-inner i {
  font-size: 24px;
  color: #ffffff;
  filter: drop-shadow(0 0 6px rgba(255,255,255,0.6));
}

/* 粒子 */
.orb-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #40a9ff;
  transform-origin: 0 0;
  animation: particle-orbit 3s linear infinite;
  animation-delay: calc(var(--i) * -0.5s);
}

@keyframes particle-orbit {
  0%   { transform: rotate(calc(var(--i) * 60deg)) translateX(38px) scale(1);   opacity: 1; }
  50%  { opacity: 0.4; }
  100% { transform: rotate(calc(var(--i) * 60deg + 360deg)) translateX(38px) scale(0.6); opacity: 1; }
}

.welcome-content h3 {
  margin: 0 0 14px 0;
  color: var(--text-main);
  font-size: 25px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.welcome-content p {
  color: var(--text-sub);
  line-height: 1.7;
  margin-bottom: 20px;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
  animation: fadeInUp 0.28s ease;
}

.message-avatar {
  flex-shrink: 0;
}

.user-avatar,
.ai-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar i,
.ai-avatar i {
  color: #ffffff;
  font-size: 18px;
}

.user-avatar {
  background: linear-gradient(145deg, #36cfc9, #08979c);
  box-shadow: 0 6px 16px rgba(8, 151, 156, 0.28);
}

.ai-avatar {
  background: linear-gradient(145deg, var(--brand-primary), var(--brand-secondary));
  box-shadow: 0 6px 16px rgba(22, 119, 255, 0.26);
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.sender-name {
  font-weight: 600;
  color: var(--text-main);
  font-size: 14px;
}

.message-time {
  color: #90a0c3;
  font-size: 12px;
}

.message-body {
  margin-bottom: 8px;
}

.user-message {
  background: rgba(255, 255, 255, 0.88);
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #dfe7f6;
  color: var(--text-main);
  line-height: 1.6;
  box-shadow: 0 6px 16px rgba(31, 42, 68, 0.04);
}

.ai-message {
  background: linear-gradient(145deg, #f2f8ff, #eef5ff);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #d5e5ff;
  color: var(--text-main);
  line-height: 1.65;
  box-shadow: 0 6px 18px rgba(22, 119, 255, 0.08);
}

.model-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 12px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
}

.model-loading-text {
  font-size: 13px;
  color: #666666;
}

.ai-message :deep(h1),
.ai-message :deep(h2),
.ai-message :deep(h3),
.ai-message :deep(h4),
.ai-message :deep(h5),
.ai-message :deep(h6) {
  margin: 10px 0 6px;
  font-weight: 600;
  color: #333333;
}

.ai-message :deep(h3) {
  color: #1890ff;
}

.ai-message :deep(p) {
  margin: 6px 0;
}

.ai-message :deep(ul),
.ai-message :deep(ol) {
  margin: 6px 0;
  padding-left: 20px;
}

.ai-message :deep(li) {
  margin: 4px 0;
}

.ai-message :deep(hr) {
  border: none;
  border-top: 1px solid #e8e8e8;
  margin: 12px 0;
}

.ai-message :deep(code) {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 0 4px;
  font-size: 12px;
}

.ai-message :deep(pre) {
  margin: 8px 0;
  padding: 10px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: auto;
}

.ai-message :deep(pre code) {
  background: transparent;
  border: none;
  padding: 0;
}

.ai-message :deep(strong) {
  color: #1890ff;
  font-weight: 600;
}

.ai-message :deep(em) {
  color: #52c41a;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1890ff;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.chat-input-section {
  border-top: 1px solid #d9e5fb;
  background: rgba(255, 255, 255, 0.96);
}

.quick-questions {
  padding: 16px 20px;
  border-bottom: 1px solid #e2ebfb;
}

.quick-questions h4 {
  margin: 0 0 14px 0;
  color: var(--text-main);
  font-size: 15px;
  font-weight: 700;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.question-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #dce7fb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.24s ease;
  text-align: left;
}

.question-card i {
  color: var(--brand-primary);
  font-size: 15px;
  flex-shrink: 0;
}

.question-card span {
  color: #4c5f87;
  font-size: 13px;
  line-height: 1.35;
}

.question-card:hover {
  border-color: #8fb2f2;
  background: #f6faff;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(47, 84, 235, 0.08);
}

.input-container {
  padding: 16px 20px;
}

.input-wrapper {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  background: #f6faff;
  border: 1px solid #d5e5ff;
  border-radius: 12px;
  padding: 10px 12px;
  transition: border-color 0.25s ease;
}

.input-wrapper:focus-within {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.16);
}

.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-main);
  font-size: 14px;
  line-height: 1.55;
  resize: none;
  min-height: 20px;
  max-height: 120px;
  overflow-y: auto;
}

.chat-input::placeholder {
  color: #98a5c5;
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.voice-btn,
.send-btn {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.voice-btn {
  border: 1px solid rgba(19, 194, 194, 0.35);
  background: #ffffff;
  color: #0d8f99;
  box-shadow: 0 6px 16px rgba(13, 143, 153, 0.12);
}

.voice-btn.recording {
  border-color: rgba(245, 108, 108, 0.55);
  background: #fff1f0;
  color: #cf1322;
  box-shadow: 0 0 0 4px rgba(245, 108, 108, 0.16);
}

.send-btn {
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(22, 119, 255, 0.24);
}

.voice-btn:disabled,
.send-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.voice-btn:not(:disabled):hover,
.send-btn:not(:disabled):hover {
  transform: translateY(-1px);
}

.voice-btn:not(:disabled):hover {
  border-color: rgba(19, 194, 194, 0.65);
  background: #f0fdff;
  box-shadow: 0 10px 22px rgba(13, 143, 153, 0.18);
}

.send-btn:not(:disabled):hover {
  box-shadow: 0 10px 22px rgba(22, 119, 255, 0.32);
}

.button-icon {
  font-size: 20px;
}

.send-btn .button-icon {
  transform: translateX(1px);
}

.spinning {
  animation: spin 1s linear infinite;
}

.input-tips {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  font-size: 12px;
  color: #8d9abc;
}

.composer-tools {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.voice-status {
  color: #1f63d7;
  font-weight: 600;
  white-space: nowrap;
}

.voice-status.recording {
  color: #cf1322;
}

/* 上传文档按钮 */
.upload-doc-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding: 0 11px;
  border: 1px solid #c8ddff;
  border-radius: 999px;
  background: #edf5ff;
  color: #1f63d7;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
  transition: all 0.2s ease;
  user-select: none;
}

.upload-doc-btn:hover:not(.disabled) {
  border-color: #8fb2f2;
  background: #f5f9ff;
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.12);
}

.upload-doc-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.uploading-spinner {
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 文档标签 */
.doc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.doc-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 12px;
  color: #096dd9;
}

.doc-tag-icon {
  font-size: 13px;
}

.doc-tag-name {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc-tag-remove {
  background: none;
  border: none;
  color: rgba(0, 0, 0, 0.35);
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  padding: 0 2px;
  transition: color 0.15s;
}

.doc-tag-remove:hover {
  color: #ff4d4f;
}

.doc-tag-remove:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

/* 上传进度条 */
.upload-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 6px 10px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 6px;
}

.upload-progress-label {
  font-size: 12px;
  color: #d48806;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.upload-progress-track {
  flex: 1;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.upload-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1677ff, #69b1ff);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.upload-progress-text {
  font-size: 11px;
  color: #d48806;
  min-width: 32px;
  text-align: right;
}

.chat-type-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 11px;
  border: 1px solid #c8ddff;
  border-radius: 999px;
  background: #edf5ff;
  color: #1f63d7;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.chat-type-trigger.chat-type-normal {
  background: #f4fbf7;
  border-color: #caead8;
  color: #16804d;
}

.chat-type-trigger:hover {
  border-color: #8fb2f2;
  background: #f5f9ff;
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.12);
}

.chat-type-trigger.chat-type-normal:hover {
  border-color: #8dd9b1;
  background: #f9fffb;
  box-shadow: 0 4px 12px rgba(22, 128, 77, 0.1);
}

.chat-type-trigger.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.chat-type-trigger i:first-child {
  font-size: 12px;
}

.selector-arrow {
  font-size: 10px;
  color: currentColor;
  pointer-events: none;
  opacity: 0.72;
}

:global(.chat-type-dropdown-popper) {
  border: 1px solid #dbe7fc !important;
  border-radius: 12px !important;
  box-shadow: 0 12px 30px rgba(31, 42, 68, 0.14) !important;
  overflow: hidden;
}

:global(.chat-type-dropdown-popper .el-dropdown-menu) {
  padding: 6px;
}

:global(.chat-type-dropdown-popper .el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-width: 176px;
  padding: 9px 10px;
  border-radius: 8px;
  line-height: 1.25;
  color: var(--text-main);
}

:global(.chat-type-dropdown-popper .el-dropdown-menu__item:not(.is-disabled):hover),
:global(.chat-type-dropdown-popper .el-dropdown-menu__item.active) {
  background: #eef6ff;
  color: #1f63d7;
}

:global(.chat-type-dropdown-popper .chat-type-option-content) {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

:global(.chat-type-dropdown-popper .chat-type-option-label) {
  font-size: 13px;
  font-weight: 700;
}

:global(.chat-type-dropdown-popper .chat-type-option-desc) {
  color: #7b89aa;
  font-size: 11px;
  font-weight: 500;
}

:global(.chat-type-dropdown-popper .chat-type-check) {
  color: #1f63d7;
  font-size: 12px;
}

.info-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
}

.history-section,
.knowledge-shortcuts,
.usage-stats {
  background: var(--panel-bg);
  border: 1px solid var(--border-soft);
  border-radius: 14px;
  padding: 16px;
  box-shadow: var(--shadow-soft);
}

.history-section h3,
.knowledge-shortcuts h3,
.usage-stats h3 {
  margin: 0 0 12px 0;
  color: var(--text-main);
  font-size: 17px;
  font-weight: 700;
}

.history-list {
  max-height: 470px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 2px;
}

.history-item {
  padding: 0;
  background: #ffffff;
  border: 1px solid #dbe7fc;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.history-item:hover {
  border-color: #99baf2;
  box-shadow: 0 8px 20px rgba(22, 119, 255, 0.14);
  transform: translateY(-1px);
}

.history-item.active {
  border-color: #77a4f2;
  background: linear-gradient(145deg, rgba(230, 240, 255, 0.9), rgba(240, 249, 255, 0.95));
  box-shadow: 0 8px 20px rgba(22, 119, 255, 0.18);
}

.session-main {
  position: relative;
  padding: 10px 36px 10px 11px;
}

.history-list > * + * {
  margin-top: 8px;
}

.session-delete-btn {
  position: absolute;
  top: 9px;
  right: 9px;
  width: 22px;
  height: 22px;
  border: 1px solid #d8dee8;
  border-radius: 50%;
  background: #f3f5f8;
  color: #7b8798;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  line-height: 1;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
  transition: all 0.2s ease;
}

.session-delete-btn:hover {
  /* 删除入口改为灰色弱提示，避免在历史卡片里过于突兀。 */
  border-color: #aeb8c7;
  background: #e5e9ef;
  color: #4b5563;
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.12);
}

.session-delete-icon {
  width: 13px;
  height: 13px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  pointer-events: none;
}

.session-title {
  margin: 0 0 4px 0;
  color: var(--text-main);
  font-size: 12.5px;
  font-weight: 700;
}

.session-summary {
  margin: 0 0 6px 0;
  color: #586685;
  font-size: 11.5px;
}

.keyword-tag {
  display: inline-block;
  padding: 1px 8px;
  background: #edf4ff;
  border: 1px solid #c8dafc;
  border-radius: 999px;
  font-size: 10px;
  color: #345ab4;
  font-weight: 600;
}

.history-item:hover .keyword-tag,
.history-item.active .keyword-tag {
  background: #d6e4ff;
  border-color: #85a5ff;
}

.session-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px dashed #f0f0f0;
  padding-top: 6px;
}

.session-time,
.session-msg-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  color: #8c8c8c;
}

.session-time i,
.session-msg-count i {
  font-size: 9px;
  color: #bfbfbf;
}

.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.shortcut-item:hover {
  border-color: #1890ff;
  background: #f0f8ff;
}

.shortcut-item i {
  color: #1890ff;
  font-size: 16px;
  flex-shrink: 0;
}

.shortcut-info h4 {
  margin: 0 0 4px 0;
  color: #333333;
  font-size: 14px;
  font-weight: 500;
}

.shortcut-info p {
  margin: 0;
  color: #999999;
  font-size: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
}

.stat-number {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #999999;
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar,
.history-list::-webkit-scrollbar,
.info-panel::-webkit-scrollbar {
  width: 7px;
}

.chat-messages::-webkit-scrollbar-track,
.history-list::-webkit-scrollbar-track,
.info-panel::-webkit-scrollbar-track {
  background: rgba(214, 226, 248, 0.5);
  border-radius: 8px;
}

.chat-messages::-webkit-scrollbar-thumb,
.history-list::-webkit-scrollbar-thumb,
.info-panel::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #84a9ec, #4d7fda);
  border-radius: 8px;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .qna-container {
    grid-template-columns: 1fr;
    height: auto;
  }

  .info-panel {
    order: -1;
  }

  .question-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
  }
}

.expandable-section {
  margin-bottom: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s ease;
  user-select: none;
}

.section-header:hover {
  background: #f0f0f0;
}

.tool-section {
  border-color: #b7eb8f;
  background: #fbfff7;
}

.tool-section .section-header {
  background: #f6ffed;
  border-left: 4px solid #52c41a;
}

.tool-section .section-header:hover {
  background: #edffe2;
}

.tool-section .section-header i:first-child,
.tool-section .section-header > span:first-of-type {
  color: #237804;
}

.tool-section .section-header i:last-child {
  color: #52c41a;
}

.section-header i:first-child {
  color: #1890ff;
  width: 16px;
}

.section-header > span:first-of-type {
  font-weight: 500;
  color: #333;
  font-size: 13px;
}

.thinking-timer {
  font-size: 12px;
  font-weight: normal;
  margin-left: 4px;
}

.section-header i:last-child {
  color: #666;
  font-size: 12px;
  transition: transform 0.2s ease;
  margin-left: auto;
}
.section-content {
  padding: 12px;
  background: #fafafa;
  border-top: 1px solid #e8e8e8;
}

.thinking-content {
  background: #f8f9ff;
}

.thinking-step {
  margin-bottom: 12px;
}

.thinking-step:last-child {
  margin-bottom: 0;
}

.step-header {
  font-size: 12px;
  color: #1890ff;
  font-weight: 500;
  margin-bottom: 6px;
}

.step-content {
  color: #666;
  font-size: 13px;
  line-height: 1.5;
  padding-left: 12px;
  border-left: 3px solid #1890ff;
}

.tool-content {
  background: #fbfff7;
  border-top-color: #d9f7be;
}

.tool-call pre {
  margin: 0;
  padding: 8px;
  background: #fff;
  border: 1px solid #d9f7be;
  border-radius: 4px;
  font-size: 12px;
  color: #52c41a;
  white-space: pre-wrap;
  word-break: break-all;
}

.response-content {
  color: #333;
  line-height: 1.6;
}

</style>
