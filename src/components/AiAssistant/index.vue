<template>
  <div v-if="visible" class="ai-dialog-overlay" @click.self="handleClose">
    <div class="ai-dialog">
      <div class="ai-header">
        <div class="ai-title">🤖 智能运维助手</div>
        <button class="close-btn" @click="handleClose">×</button>
      </div>

      <div class="ai-body" ref="msgContainer">
        <div v-for="(msg, index) in messages" :key="index" class="message-row" :class="msg.role">
          <div class="avatar">{{ msg.role === 'ai' ? '🤖' : '👨‍💻' }}</div>
          <div class="message-bubble">
            <!-- 用户消息：直接显示 -->
            <div v-if="msg.role === 'user'">{{ msg.content }}</div>

            <!-- AI消息：分块渲染 -->
            <div v-else class="ai-message-content">
              <!-- 模型加载提示 -->
              <div v-if="msg.modelLoading" class="model-loading">
                <span class="model-loading-text">模型加载中（首次可能需要 1–2 秒）</span>
                <div class="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>

              <!-- 如果没有任何内容（包括parts），显示loading -->
              <div v-else-if="(!msg.parts || msg.parts.length === 0) && !msg.content" class="loading-indicator">
                <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
              </div>

              <!-- 兼容旧内容格式 -->
              <div v-if="(!msg.parts || msg.parts.length === 0) && msg.content">{{ msg.content }}</div>

              <!-- 分块内容渲染 -->
              <div v-else v-for="part in msg.parts" :key="part.id" class="content-part">
                <!-- 思考部分 -->
                <div v-if="part.type === 'thinking'" class="expandable-section thinking-section">
                  <div
                    class="section-header"
                    @click="toggleSection(msg.id, `thinking-${part.stepIndex}`)"
                  >
                    <span class="header-title">🧠 深度思考</span>
                    <span class="thinking-timer">({{ part.thinkTime || getThinkingTime() }})</span>
                    <span class="toggle-icon">{{ isExpanded(msg.id, `thinking-${part.stepIndex}`) ? '▼' : '▶' }}</span>
                  </div>
                  <div v-if="isExpanded(msg.id, `thinking-${part.stepIndex}`)" class="section-content thinking-content">
                     {{ part.content }}
                  </div>
                </div>

                <!-- 工具调用部分 -->
                <div v-else-if="part.type === 'tool'" class="expandable-section tool-section">
                  <div
                    class="section-header"
                    @click="toggleSection(msg.id, `tool-${part.stepIndex}`)"
                  >
                    <span class="header-title">🔧 工具调用: {{ part.tool_calls?.[0]?.function.name || 'Unknown' }}</span>
                    <span class="toggle-icon">{{ isExpanded(msg.id, `tool-${part.stepIndex}`) ? '▼' : '▶' }}</span>
                  </div>
                  <div v-if="isExpanded(msg.id, `tool-${part.stepIndex}`)" class="section-content tool-content">
                    <pre class="code-block">{{ part.content }}</pre>
                  </div>
                </div>

                <!-- 最终响应 -->
                <div v-else-if="part.type === 'response'" class="markdown-body" v-html="renderMarkdown(part.content)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="ai-footer">
        <div class="input-wrapper">
          <input
            v-model="inputText"
            @keyup.enter="sendMessage"
            type="text"
            placeholder="请输入您的问题... (Enter发送)"
            class="ai-input"
          />
          <button class="send-btn" @click="sendMessage">
            <span v-if="!loading">发送</span>
            <span v-else>...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, reactive } from 'vue'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import { getAiResponse, newChatSessionId } from '@/api/ai'

const props = defineProps<{
  visible: boolean
  initialContext?: string
}>()

const emit = defineEmits(['update:visible', 'close'])

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
})
const renderMarkdown = (text: string) => DOMPurify.sanitize(md.render(text || ''))

// 类型定义
interface ToolDetail {
  index: number
  id: string
  function: {
    name: string
    arguments: string
  }
}

interface MessagePart {
  id: number
  type: 'thinking' | 'tool' | 'response'
  content: string
  stepIndex?: number
  thinkTime?: string
  tool_calls?: ToolDetail[]
  tool_call_id?: string
}

interface Message {
  id: number
  role: 'user' | 'ai'
  content: string // 用于兼容或作为fallback
  parts?: MessagePart[]
  loading?: boolean
  modelLoading?: boolean
}

interface ToolStreamPayload {
  tool_call_id: string
  content: string
  session_id: string
  tool_calls?: ToolDetail[]
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

const inputText = ref('')
const messages = ref<Message[]>([])
const loading = ref(false)
const msgContainer = ref<HTMLElement | null>(null)
const currentSessionId = ref('')
const expandedSections = ref<Record<string, Set<string>>>({})

// 思考计时相关
const startTime = ref<number>(0)
const currentTime = ref<number>(0)
const overThink = ref<boolean>(false)
let thinkingTimer: number

const getThinkingTime = () => {
  const duration = (currentTime.value - startTime.value) / 1000
  return `${duration.toFixed(1)}s`
}

// 监控可见性变化，初始化
watch(() => props.visible, async (newVal) => {
  if (newVal) {
    messages.value = []
    loading.value = false

    try {
      // 1. 获取新会话ID
      const res = await newChatSessionId({
        model_name: 'qwen3:32b',
        title: props.initialContext ? '报警分析' : '智能助手会话'
      })

      if (res.data && res.data.session_id) {
        currentSessionId.value = res.data.session_id

        if (props.initialContext) {
           await sendMessageInternal(props.initialContext)
        } else {
           messages.value = [
            { id: Date.now(), role: 'ai', content: '👋 您好，我是您的智能运维助手。有什么可以帮您？' }
           ]
        }
      } else {
        messages.value = [{ id: Date.now(), role: 'ai', content: '❌ 会话初始化失败，请重试。' }]
      }
    } catch (error) {
      console.error('初始化会话失败', error)
      messages.value = [{ id: Date.now(), role: 'ai', content: '❌ 连接服务器失败。' }]
    }

    scrollToBottom()
  }
})

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const scrollToBottom = () => {
  nextTick(() => {
    if (msgContainer.value) {
      msgContainer.value.scrollTop = msgContainer.value.scrollHeight
    }
  })
}

// 展开/收起逻辑
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

const isExpanded = (messageId: number, sectionType: string) => {
  const key = `${messageId}`
  return expandedSections.value[key]?.has(sectionType) || false
}

// 添加消息部分（思考、工具调用、响应）
const addMessagePart = (
  messageIndex: number,
  type: 'thinking' | 'tool' | 'response',
  content: string,
  stepIndex?: number,
  thinkTime?: string,
  tool_calls?: ToolDetail[],
  tool_call_id?: string
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
    // 更新现有内容 - 直接追加，不使用setTimeout
    existingPart.content += content
    if (thinkTime) {
      existingPart.thinkTime = thinkTime
    }
    scrollToBottom()
  } else {
    // 创建新的部分
    lastMessage.parts?.push({
      id: partId,
      type,
      content,
      stepIndex,
      tool_calls,
      tool_call_id,
      thinkTime
    })
    scrollToBottom()
  }
}

// 统一发送逻辑
const sendMessage = () => {
  if (!inputText.value.trim() || loading.value) return
  sendMessageInternal(inputText.value)
  inputText.value = ''
}

const sendMessageInternal = async (content: string) => {
  if (!currentSessionId.value) return

  const userMessage = { id: Date.now(), role: 'user' as const, content: content }
  messages.value.push(userMessage)

  inputText.value = ''

  // 自动滚动
  nextTick(() => {
    scrollToBottom()
  })

  console.log(currentSessionId.value)
  // 显示AI正在输入
  const aiMessage: Message = {
    id: Date.now() + 1,
    role: 'ai',
    content: '',
    loading: true,
    modelLoading: false,
    parts: []
  }
  messages.value.push(aiMessage)
  loading.value = true

  // 如果首包迟迟不来（例如首次加载模型到显卡），显示"模型加载中"提示
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

  console.log(userMessage.content)
  getAiResponse({
    session_id: currentSessionId.value || '',
    content: userMessage.content,
  }).then(async (response) => {
    if (!response.ok || !response.body) {
      throw new Error('Network response was not ok')
    }
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

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

    const finishThinking = (aiMessageIndex: number) => {
      if (!overThink.value) return
      const finalDuration = (Date.now() - startTime.value) / 1000
      const finalTime = `${finalDuration.toFixed(1)}s`
      // 仅更新计时，不追加内容
      addMessagePart(aiMessageIndex, 'thinking', '', currentThinkStepIndex, finalTime)
      clearInterval(thinkingTimer)
      overThink.value = false
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? '' // 保留未完整的一行

      for (const line of lines) {
        console.log('收到行:', line)
        if (line.trim() === '') continue
        try {
          const result = JSON.parse(line)
          const payload = result.data
          console.log('payload:', payload)
          const aiMessageIndex = messages.value.findIndex((msg) => msg.id === aiMessage.id)
          if (aiMessageIndex !== -1) {
            // 一旦开始收到任何流式数据，就认为"模型加载"阶段结束
            clearTimeout(warmupTimer)
            if (messages.value[aiMessageIndex].modelLoading) {
              messages.value[aiMessageIndex].modelLoading = false
            }

            // 1) 工具调用：后端可能返回对象结构
            if (isToolStreamPayload(payload)) {
              currentThinkStepIndex++
              // 处理工具响应
              addMessagePart(
                aiMessageIndex,
                'tool',
                payload.content,
                currentThinkStepIndex,
                undefined,
                payload.tool_calls,
                payload.tool_call_id
              )
              toggleSection(aiMessage.id, `tool-${currentThinkStepIndex}`) // 默认展开新的工具部分
            }
            else {
              // 2) 普通流式文本（字符串 token）
              const text = String(payload ?? '')
              if (!text || text === '\n\n') continue

              // 兼容后端"每个 token 都包一层 <think>...</think>"的情况：都追加到同一个思考块
              const isThinkWrapped = text.includes('<think>') && text.includes('</think>')
              const isThinkStartOnly = text.includes('<think>') && !text.includes('</think>')
              const isThinkEndOnly = !text.includes('<think>') && text.includes('</think>')

              if (isThinkWrapped) {
                if (!overThink.value) startThinking()
                const inner = text.replace('<think>', '').replace('</think>', '')
                if (inner) {
                  addMessagePart(aiMessageIndex, 'thinking', inner, currentThinkStepIndex)
                }
                // 这里不结束思考：直到收到非 think 文本再结束
              } else if (isThinkStartOnly) {
                if (!overThink.value) startThinking()
                const inner = text.replace('<think>', '')
                if (inner.trim()) {
                  addMessagePart(aiMessageIndex, 'thinking', inner, currentThinkStepIndex)
                }
              } else if (isThinkEndOnly) {
                const inner = text.replace('</think>', '')
                if (inner.trim()) {
                  addMessagePart(aiMessageIndex, 'thinking', inner, currentThinkStepIndex)
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
        } catch (e) {
          console.error('JSON解析失败:', e, line)
        }
      }
    }

    // 流结束，结束加载状态
    const aiMessageIndex = messages.value.findIndex((msg) => msg.id === aiMessage.id)
    if (aiMessageIndex !== -1) {
      messages.value[aiMessageIndex].loading = false
      messages.value[aiMessageIndex].modelLoading = false
    }
    loading.value = false
  }).catch((error) => {
    console.error('AI请求失败:', error)
    const aiMessageIndex = messages.value.findIndex((msg) => msg.id === aiMessage.id)
    if (aiMessageIndex !== -1) {
      messages.value[aiMessageIndex].parts?.push({
        id: Date.now(), type: 'response', content: '**[请求出错]**'
      })
      messages.value[aiMessageIndex].loading = false
      messages.value[aiMessageIndex].modelLoading = false
    }
    loading.value = false
  })
}

</script>

<style scoped>
.ai-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 20, 40, 0.7);
  backdrop-filter: blur(5px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-dialog {
  width: 600px;
  max-width: 90vw;
  height: 80vh;
  max-height: 800px;
  background: #0f1c2e; /* 深色背景 */
  border: 1px solid #00bcd4;
  box-shadow: 0 0 30px rgba(0, 188, 212, 0.3);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.ai-header {
  height: 60px;
  background: linear-gradient(90deg, rgba(0, 188, 212, 0.2), rgba(0, 20, 60, 0.8));
  border-bottom: 1px solid rgba(0, 188, 212, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.ai-title {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 28px;
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: #fff;
}

.ai-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: rgba(15, 28, 46, 0.95);
  scrollbar-width: thin;
  scrollbar-color: #00bcd4 #0f1c2e;
}

.ai-body::-webkit-scrollbar {
  width: 6px;
}
.ai-body::-webkit-scrollbar-thumb {
  background-color: #00bcd4;
  border-radius: 3px;
}

.message-row {
  display: flex;
  gap: 12px;
  max-width: 85%;
}

.message-row.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-row.ai {
  align-self: flex-start;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: #e0e0e0;
  position: relative;
  word-wrap: break-word;
}

.ai .message-bubble {
  background: transparent;
  border: none;
  padding: 0;
  border-top-left-radius: 2px;
}

.user .message-bubble {
  background: #00bcd4;
  color: #0f1c2e;
  font-weight: 500;
  border-top-right-radius: 2px;
}

/* AI消息内容分块 */
.ai-message-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 扩展区块（思考和工具调用）样式 */
.expandable-section {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(0, 188, 212, 0.2);
}

.section-header {
  padding: 8px 12px;
  background: rgba(0, 188, 212, 0.1);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #00bcd4;
  user-select: none;
}

.section-header:hover {
  background: rgba(0, 188, 212, 0.2);
}

.header-title {
  font-weight: bold;
}

.thinking-timer {
  margin-left: 8px;
  color: #aaa;
}

.section-content {
  padding: 10px;
  font-size: 13px;
  color: #ddd;
  border-top: 1px solid rgba(0, 188, 212, 0.1);
}

.thinking-content {
  color: #aaa;
  font-style: italic;
  white-space: pre-wrap;
}

.tool-content {
  background: #111;
}

.code-block {
  margin: 0;
  white-space: pre-wrap;
  font-family: monospace;
  color: #a5d6ff;
  font-size: 12px;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
}

.loading-indicator .dot {
  display: inline-block;
  animation: bounce 1.4s infinite ease-in-out both;
  color: #00bcd4;
  font-weight: bold;
  font-size: 18px;
}

.loading-indicator .dot:nth-child(1) { animation-delay: -0.32s; }
.loading-indicator .dot:nth-child(2) { animation-delay: -0.16s; }

/* 模型加载提示 */
.model-loading {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 165, 0, 0.1);
  border-left: 3px solid #ff9800;
  border-radius: 4px;
}

.model-loading-text {
  color: #ff9800;
  font-size: 13px;
  font-weight: 500;
}

.typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #ff9800;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
.typing-indicator span:nth-child(3) { animation-delay: 0s; }

/* 最终回复样式 */
.markdown-body {
  background: rgba(0, 188, 212, 0.15); /* 给回复内容加个底色 */
  border: 1px solid rgba(0, 188, 212, 0.3);
  padding: 12px 16px;
  border-radius: 2px 12px 12px 12px;
}

.ai-footer {
  padding: 15px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: #0b1421;
}

.input-wrapper {
  display: flex;
  gap: 10px;
}

.ai-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(136, 136, 136, 0.3);
  border-radius: 8px;
  padding: 12px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.ai-input:focus {
  border-color: #00bcd4;
  background: rgba(255, 255, 255, 0.1);
}

.send-btn {
  padding: 0 24px;
  background: #00bcd4;
  color: #0f1c2e;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.send-btn:hover {
  background: #26d0e8;
  transform: translateY(-1px);
}

.send-btn:active {
  transform: translateY(1px);
}

/* Loading animation dots */
.loading .dot {
  display: inline-block;
  animation: bounce 1.4s infinite ease-in-out both;
  margin: 0 2px;
  font-size: 20px;
  line-height: 10px;
}

.loading .dot:nth-child(1) { animation-delay: -0.32s; }
.loading .dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Markdown Styles override */
.markdown-body :deep(h1), .markdown-body :deep(h2), .markdown-body :deep(h3) {
  color: #00bcd4;
  margin-top: 12px;
  margin-bottom: 8px;
  font-weight: bold;
}
.markdown-body :deep(h1) { font-size: 1.5em; border-bottom: 1px solid rgba(0,188,212,0.3); padding-bottom: 4px; }
.markdown-body :deep(h2) { font-size: 1.3em; }
.markdown-body :deep(h3) { font-size: 1.1em; }

.markdown-body :deep(code) {
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 4px;
  border-radius: 3px;
  color: #ff9800;
  font-family: monospace;
}
.markdown-body :deep(pre) {
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 10px 0;
}
.markdown-body :deep(pre code) {
  background: transparent;
  color: #e0e0e0;
  padding: 0;
}

.markdown-body :deep(p) {
  margin-bottom: 10px;
  line-height: 1.6;
}
.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}
.markdown-body :deep(ul), .markdown-body :deep(ol) {
  margin-left: 20px;
  margin-bottom: 10px;
}
.markdown-body :deep(li) {
  margin-bottom: 4px;
}
.markdown-body :deep(strong) {
  color: #fff;
  font-weight: bold;
}
.markdown-body :deep(blockquote) {
  border-left: 3px solid #00bcd4;
  padding-left: 10px;
  margin: 10px 0;
  color: #8daab1;
  background: rgba(0, 188, 212, 0.1);
  padding: 8px;
  border-radius: 4px;
}
</style>
