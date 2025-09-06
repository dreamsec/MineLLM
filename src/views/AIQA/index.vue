<template>
  <div class="ai-qna-page">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <div class="header-left">
        <h1>大模型智能问答</h1>
        <p>基于大模型的智能问答与历史记录管理</p>
      </div>
      <div class="header-actions">
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
              <div class="ai-avatar">
                <i class="fas fa-robot"></i>
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
                    <!-- 按照parts数组顺序直接渲染 -->
                    <div v-for="part in message.parts" :key="`part-${part.id}`" class="content-part">
                      <!-- 思考部分 -->
                      <div v-if="part.type === 'thinking'" class="expandable-section">
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
                      <div v-else-if="part.type === 'tool'" class="expandable-section">
                        <div
                          class="section-header"
                          @click="toggleSection(message.id, `tool-${part.stepIndex}`)"
                        >
                          <i class="fas fa-server"></i>
                          <span>{{part.toolName}}</span>
                          <i :class="['fas', isExpanded(message.id, `tool-${part.stepIndex}`) ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
                        </div>
                        <div v-if="isExpanded(message.id, `tool-${part.stepIndex}`)" class="section-content tool-content">
                          <div class="tool-call">
                            <pre>{{ part.content }}</pre>
                          </div>
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
                <button
                  class="send-btn"
                  :disabled="!inputText.trim() || isLoading"
                  @click="sendMessage"
                >
                  <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>

            <div class="input-tips">
              <span class="tip">按 Enter 发送，Shift + Enter 换行</span>
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
              :key="session.id"
              :class="['history-item', { active: currentSessionId === session.id }]"
              @click="loadSession(session.id)"
            >
              <div class="session-info">
                <h4>{{ session.title }}</h4>
                <p>{{ formatDate(session.lastMessage) }}</p>
                <span class="message-count">{{ session.messageCount }} 条消息</span>
              </div>
              <div class="session-actions">
                <button class="action-btn small" @click.stop="deleteSession(session.id)">
                  <i class="fas fa-trash"></i>
                </button>
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
              <span class="stat-number">{{ stats.totalQuestions }}</span>
              <span class="stat-label">总提问数</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ stats.todayQuestions }}</span>
              <span class="stat-label">今日提问</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ stats.avgResponseTime }}s</span>
              <span class="stat-label">平均响应时间</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ stats.satisfactionRate }}%</span>
              <span class="stat-label">满意度</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, watch } from 'vue'

// 定义组件名称
defineOptions({
  name: 'AiQnaPage'
})

// 定义消息类型
interface MessagePart {
  id: number
  type: 'thinking' | 'tool' | 'response' | 'error'
  content: string
  toolName?: string // 用于tool_response类型
  stepIndex?: number // 用于标识思考步骤顺序
  thinkTime?: string // 记录思考时间戳
}

// 定义类型接口
interface Message {
  id: number
  type: 'user' | 'assistant'
  content: string
  timestamp: number
  loading?: boolean
  liked?: boolean
  parts?: MessagePart[]
}


interface QuickQuestion {
  id: number
  text: string
  icon: string
}

interface ChatSession {
  id: string
  title: string
  lastMessage: number
  messageCount: number
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
const currentSessionId = ref<string | null>(null)
const messagesContainer = ref<HTMLDivElement | null>(null)
const inputTextarea = ref<HTMLTextAreaElement | null>(null)

// 快捷问题
const quickQuestions = ref<QuickQuestion[]>([
  {
    id: 1,
    text: '主提升机异响怎么处理？',
    icon: 'fas fa-volume-up',
  },
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
const chatSessions = ref<ChatSession[]>([
  {
    id: '1',
    title: '主提升机维护咨询',
    lastMessage: new Date().getTime() - 86400000,
    messageCount: 12,
  },
  {
    id: '2',
    title: '安全操作规程询问',
    lastMessage: new Date().getTime() - 172800000,
    messageCount: 8,
  },
  // {
  //   id: '3',
  //   title: '故障诊断方法',
  //   lastMessage: new Date().getTime() - 259200000,
  //   messageCount: 15,
  // },
])

// 知识库分类
const knowledgeCategories = ref<KnowledgeCategory[]>([
  {
    id: 1,
    name: '维修手册',
    icon: 'fas fa-book',
    count: 156,
  },
  {
    id: 2,
    name: '操作规程',
    icon: 'fas fa-list-alt',
    count: 89,
  },
  {
    id: 3,
    name: '故障案例',
    icon: 'fas fa-exclamation-triangle',
    count: 234,
  },
  // {
  //   id: 4,
  //   name: '技术标准',
  //   icon: 'fas fa-certificate',
  //   count: 67,
  // },
])

// 使用统计
const stats = reactive({
  totalQuestions: 1268,
  todayQuestions: 23,
  avgResponseTime: 2.3,
  satisfactionRate: 94,
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


// 方法
const sendMessage = async () => {
  if (!inputText.value.trim() || isLoading.value) return

  const userMessage: Message = {
    id: Date.now(),
    type: 'user',
    content: inputText.value.trim(),
    timestamp: new Date().getTime(),
  }

  messages.value.push(userMessage)

  inputText.value.trim()
  inputText.value = ''

  // 自动调整输入框高度
  nextTick(() => {
    autoResizeTextarea()
    scrollToBottom()
  })

  // 显示AI正在输入
  const aiMessage: Message = {
    id: Date.now() + 1,
    type: 'assistant',
    content: '',
    timestamp: new Date().getTime(),
    loading: true,
    liked: false,
    parts: []
  }

  messages.value.push(aiMessage)
  isLoading.value = true

  let currentThinkStepIndex = 0 // 用于跟踪思考步骤

  nextTick(() => {
    scrollToBottom()
  })
  // 模拟AI回答
  try {
    for (const response of res){
      await new Promise(resolve => setTimeout(resolve, 500))
      // 更新AI消息
      const aiMessageIndex = messages.value.findIndex((msg) => msg.id === aiMessage.id)


      if (aiMessageIndex !== -1) {
        if (response.includes('<think>')) {
          startTime.value = Date.now()
          currentTime.value = Date.now()
          thinkingTimer =  setInterval(() => {
            currentTime.value = Date.now()
          }, 100)
          // 处理开始标签
          overThink.value = true
          currentThinkStepIndex++
          const thinkingContent = response.replace('<think>', '').trim()

          if (thinkingContent) {
            addMessagePart(aiMessageIndex, 'thinking', thinkingContent, currentThinkStepIndex)
          }
          // const lastPart = messages.value[aiMessageIndex]
          // const existingThinkPart = lastPart.parts?.find(part =>
          //   part.type === 'thinking' && part.stepIndex === currentThinkStepIndex
          // )
          // if (existingThinkPart) {
          //   // 更新现有的思考内容
          //   existingThinkPart.content += response
          // } else {
          //   // 创建新的思考部分
          //   lastPart.parts?.push({
          //     id: Date.now(),
          //     type: 'thinking',
          //     content: response,
          //     stepIndex: currentThinkStepIndex
          //   })
          // }
          toggleSection(aiMessage.id, `thinking-${currentThinkStepIndex}`) // 默认展开新的思考部分
        }
        else if (response.includes('</think>')) {
          // 处理结束标签前的思考内容
          if (overThink.value) {
            // const existingThinkPart = lastPart.parts?.find(part =>
            //   part.type === 'thinking' && part.stepIndex === currentThinkStepIndex
            // )
            const contentBeforeEndTag = response.split('</think>')[0].trim()
            const finalDuration = (Date.now() - startTime.value) / 1000
            const finalTime = `${finalDuration.toFixed(1)}s`
            if (contentBeforeEndTag && overThink.value) {
              addMessagePart(aiMessageIndex, 'thinking', contentBeforeEndTag, currentThinkStepIndex, undefined, finalTime)
            }
            // if (contentBeforeEndTag && existingThinkPart) {
            //   existingThinkPart.content += contentBeforeEndTag
            // }
          }
          clearInterval(thinkingTimer)
          overThink.value = false
          // 处理 </think> 后的回复内容
          const contentAfterEndTag = response.split('</think>')[1]
          if (contentAfterEndTag && contentAfterEndTag.trim()) {
            addMessagePart(aiMessageIndex, 'response', contentAfterEndTag.trim())
          }
          // if (contentAfterEndTag && contentAfterEndTag.trim()) {
          //   const existingResponsePart = lastPart.parts?.find(part => part.type === 'response')
          //   if (existingResponsePart) {
          //     existingResponsePart.content += contentAfterEndTag
          //   } else {
          //     lastPart.parts?.push({
          //       id: Date.now(),
          //       type: 'response',
          //       content: contentAfterEndTag,
          //     })
          //   }
          // }
        }
        else if (response.includes('<tool_response>')) {
          currentThinkStepIndex++
          // 处理工具响应
          const toolName = response.split('{')[0].replace('<tool_response>','').trim()
          console.log(toolName)
          const toolContent = response.substring(response.indexOf('{') + 1).replace('</tool_response>','').trim()
          addMessagePart(aiMessageIndex, 'tool', toolContent, currentThinkStepIndex, toolName)
          // const existingThinkPart = lastPart.parts?.find(part =>
          //   part.type === 'tool'
          // )
          // if (existingThinkPart) {
          //   // 更新现有的思考内容
          //   existingThinkPart.content += response
          // } else {
          //   // 创建新的思考部分
          //   lastPart.parts?.push({
          //     id: Date.now(),
          //     type: 'tool',
          //     content: response,
          //     stepIndex: currentThinkStepIndex
          //   })
          // }
          toggleSection(aiMessage.id, `tool-${currentThinkStepIndex}`) // 默认展开新的工具部分
        }
        else if (overThink.value) {
          // 处理思考中的内容
          // const lastPart = messages.value[aiMessageIndex]
          // const existingThinkPart = lastPart.parts?.find(part =>
          //   part.type === 'thinking' && part.stepIndex === currentThinkStepIndex
          // )
          // if (existingThinkPart) {
          //   // 更新现有的思考内容
          //   existingThinkPart.content += response
          // } else {
          //   // 创建新的思考部分
          //   lastPart.parts?.push({
          //     id: Date.now(),
          //     type: 'thinking',
          //     content: response,
          //     stepIndex: currentThinkStepIndex
          //   })
          // }
          addMessagePart(aiMessageIndex, 'thinking', response, currentThinkStepIndex)
        }
        else {
          // const lastPart = messages.value[aiMessageIndex]
          // const existingThinkPart = lastPart.parts?.find(part =>
          //   part.type === 'response'
          // )
          // if (existingThinkPart) {
          //   // 更新现有的思考内容
          //   existingThinkPart.content += response
          // } else {
          //   // 创建新的思考部分
          //   lastPart.parts?.push({
          //     id: Date.now(),
          //     type: 'response',
          //     content: response,
          //     stepIndex: currentThinkStepIndex
          //   })
          // }
          addMessagePart(aiMessageIndex, 'response', response)
        }


        // if (response.includes('<think>')){
        //   overThink.value = true
        //   currentThinkStepIndex++ // 用于跟踪思考步骤]
        // }
        // if (response.includes('</think>')){
        //   // 处理结束标签前的思考内容
        //   if (overThink.value) {
        //
        //     const existingThinkPart = lastPart.parts?.find(part =>
        //       part.type === 'thinking' && part.stepIndex === currentThinkStepIndex
        //     )
        //
        //     const contentBeforeEndTag = response.split('</think>')[0].trim()
        //     if (contentBeforeEndTag && existingThinkPart) {
        //       existingThinkPart.content += contentBeforeEndTag
        //     }
        //   }
        //
        //   overThink.value = false
        //
        //   // 处理 </think> 后的回复内容
        //   const contentAfterEndTag = response.split('</think>')[1]
        //   if (contentAfterEndTag && contentAfterEndTag.trim()) {
        //     const existingResponsePart = lastPart.parts?.find(part => part.type === 'response')
        //     if (existingResponsePart) {
        //       existingResponsePart.content += contentAfterEndTag
        //     } else {
        //       lastPart.parts?.push({
        //         id: Date.now(),
        //         type: 'response',
        //         content: contentAfterEndTag,
        //       })
        //     }
        //   }
        // }
        // if (response.includes('<tool_response>')){
        //   currentThinkStepIndex++
        // }
        // //思考
        // if (overThink.value){
        //   const lastPart = messages.value[aiMessageIndex]
        //   const existingThinkPart = lastPart.parts?.find(part =>
        //     part.type === 'thinking' && part.stepIndex === currentThinkStepIndex
        //   )
        //   if (existingThinkPart) {
        //     // 更新现有的思考内容
        //     existingThinkPart.content += response
        //   } else {
        //     // 创建新的思考部分
        //     lastPart.parts?.push({
        //       id: Date.now(),
        //       type: 'thinking',
        //       content: response,
        //       stepIndex: currentThinkStepIndex
        //     })
        //   }
        // }
        // //工具
        // if (response.includes('<tool_response>')){
        //   const lastPart = messages.value[aiMessageIndex]
        //   const existingThinkPart = lastPart.parts?.find(part =>
        //     part.type === 'tool'
        //   )
        //   if (existingThinkPart) {
        //     // 更新现有的思考内容
        //     existingThinkPart.content += response
        //   } else {
        //     // 创建新的思考部分
        //     lastPart.parts?.push({
        //       id: Date.now(),
        //       type: 'tool',
        //       content: response,
        //     })
        //   }
        // }
        // //回复
        // if (overThink.value && !response.includes('<tool_response>')){
        //   const lastPart = messages.value[aiMessageIndex]
        //   const existingThinkPart = lastPart.parts?.find(part =>
        //     part.type === 'response'
        //   )
        //   console.log(123)
        //   console.log(existingThinkPart)
        //   if (existingThinkPart) {
        //     // 更新现有的思考内容
        //     existingThinkPart.content += response
        //   } else {
        //     // 创建新的思考部分
        //     lastPart.parts?.push({
        //       id: Date.now(),
        //       type: 'response',
        //       content: response,
        //     })
        //   }
        // }
      }
      console.log(messages.value)
    }
  } catch (error) {
    console.error('AI回答失败:', error)
    const aiMessageIndex = messages.value.findIndex((msg) => msg.id === aiMessage.id)
    if (aiMessageIndex !== -1) {
      messages.value[aiMessageIndex] = {
        ...aiMessage,
        content: '抱歉，我暂时无法回答您的问题，请稍后再试。',
        loading: false,
      }
    }
  } finally {
    isLoading.value = false
    nextTick(() => {
      scrollToBottom()
    })
  }
}

const addMessagePart = (
  messageIndex: number,
  type: 'thinking' | 'tool' | 'response',
  content: string,
  stepIndex?: number,
  toolName?: string,
  thinkTime?: string
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
    existingPart.content += content
    if (thinkTime) {
      existingPart.thinkTime = thinkTime
    }
  } else {
    // 创建新的部分
    lastMessage.parts?.push({
      id: partId,
      type,
      content,
      stepIndex,
      toolName,
      thinkTime
    })
  }
}

const res = [`<think> 好的，用户问的是井下发现瓦斯超限怎么处理。首先，我需要回忆相关的煤矿安全规程条款。根据之前学过的知识，瓦斯超限属于重大安全隐患，处理措施应该包括立即停止作业、撤出人员、汇报调度室等步骤。`,

`或者是相关领域的学生，需要准确的处理流程来确保安全。他们可能已经知道一些基本措施，但希望确认正确的程序，或者想了解更详细的步骤。`,

`接下来，我需要调用工具来获取《煤矿安全规程》中的具体条款。首先使用MCP_retrieve_coal_mine_regulations工具，查询“瓦斯超限”相关的条款。然后，根据返回的条款内容，提取具体的处理步骤，比如停止作业、切断电源、撤离人员、报告调度室等。如果有需要，再调用MCP_get_coal_mine_regulation_by_id工具，如果条款有具体条目号的话，比如第三百三十八条，获取更详细的信息。`,

`确保回答符合规程，同时提醒用户严格按照规程操作，避免违规。如果工具返回的信息不够详细，可能需要结合多个条款，或者指出具体条目号，让用户知道去哪里查找详细内容。最后，用简洁明了的语言组织回答，确保用户能快速理解并采取正确措施。`,
  `</think>`,
  `<tool_response>MCP服务器：retrieve_coal_mine_regulations {
  "params": {
    "query": "瓦斯超限处置措施"
  },
  "response": {
    "content": [
      {
        "type": "text",
        "text": "['第一百九十六条 矿井必须从设计和采掘生产管理上采取措施,防止瓦斯积聚;当发生瓦斯积聚时,必须及时处理.当瓦斯超限达到断电浓度时,班组长、瓦斯检查工、安全检查工、矿调度员有权责令现场作业人员停止作业,停电撤人.\\\\n\\\\n矿井必须有因停电和检修主要通风机停止运转或者通风系统遭到破坏以后恢复通风、排除瓦斯和送电的安全措施.恢复正常通风后,所有受到停风影响的地点,都必须经过通风、瓦斯检查人员检查,证实无危险后,方可恢复工作.所有安装电动机及其开关的地点附近 $2 0 \\\\\\\\mathrm { m }$ 的巷道内,都必须检查瓦斯,只有甲烷浓度符合本规程规定时,方可开启.\\\\n\\\\n临时停工的地点,不得停风;否则必须切断非本质安全型电气设备的电源,设置栅栏、警标,禁止人员进入,并向矿调度室报告.停工区内甲烷或者二氧化碳浓度达到 $3 . 0 \\\\\\\\%$ 或者其他有害气体浓度超过本规程第156条的规定不能立即处理时,必须在内封闭完毕.\\\\n\\\\n恢复已封闭的停工区或者采掘工作接近这些地点时,必须事先排除其中积聚的瓦斯.排除瓦斯工作必须制定安全技术措施.\\\\n\\\\n严禁在停风或者瓦斯超限的区域内作业.', '第二百四十三条 清理突出的煤(岩)时,必须制定防煤尘、片帮、冒顶、瓦斯超限、出现火源,以及防止再次发生突出事故的安全措施.\\\\n\\\\n# 第七章 防灭火\\\\n\\\\n# 第一节 一般规定', '第五百二十二条 电量超过 $2 \\\\\\\\mathbf { k } \\\\\\\\mathbf { W } \\\\\\\\cdot \\\\\\\\mathbf { h }$ 的锂电池动力装置应当符合下列要求:\\\\n\\\\n(一)电池之间具有防止热扩散的措施.\\\\n\\\\n(二)输入、输出端设置断电开关,瓦斯超限应当切断所有非本质安全输出.\\\\n\\\\n(三)具有远程连续监测与安全预警功能.', '第一百九十条 低瓦斯矿井必须建立防止瓦斯异常的制度,并遵守下列规定:\\\\n\\\\n(一)开拓新水平、新采区,揭露新煤层,以及采煤工作面绝对瓦斯涌出量超过 $3 \\\\\\\\mathrm { m } ^ { 3 } / \\\\\\\\mathrm { m i n }$ 或者掘进工作面绝对瓦斯涌出量超过$1 \\\\\\\\mathrm { m } ^ { 3 } / \\\\\\\\mathrm { m i n }$ 时,应当测定煤层瓦斯含量或者瓦斯压力.\\\\n\\\\n(二)启用密闭区、盲巷等区域时,必须制定安全排放 瓦 斯\\\\n\\\\n措施.\\\\n\\\\n(三)开采容易自燃和自燃煤层时,必须加强对采空区瓦斯爆炸风险的分析、制定安全措施.\\\\n\\\\n(四)必须建立健全并实施通风瓦斯定期分析制度、制定防范措施.\\\\n\\\\n(五)瓦斯排放、巷道贯通、揭露煤层、清理煤仓、强制放顶、火 区封闭和启封等重点作业环节必须做好瓦斯监测,强化瓦斯防治.', '第二百二十一条 煤与二氧化碳突出、岩石与二氧化碳突出、岩石与瓦斯突出的管理和防治措施参照本章规定执行.\\\\n\\\\n# 第二节 区域综合防突措施', '第一百九十九条 有瓦斯或者二氧化碳喷出的煤(岩)层,采掘作业前必须采取下列措施:\\\\n\\\\n(一)施工前探钻孔或者瓦斯治理钻孔.(二)加大喷出危险区域的风量.(三)将喷出的瓦斯或者二氧化碳直接引入回风巷或者抽采瓦斯管路.', '第七百七十条 处理瓦斯(煤尘)爆炸事故时,应当遵守下列规定:\\\\n\\\\n(一)立即切断灾区电源.(二)检查灾区内有害气体的浓度、温度及通风设施破坏情况,发现有再次爆炸危险时,必须立即撤离至安全地点.(三)进入灾区行动要谨慎,防止碰撞产生火花,引起爆炸.(四)经探察确认或者分析认定人员已经遇难,并且没有火源时,必须先恢复灾区通风,再进行处理.', '第一百一十六条 采(盘)区结束后、回撤设备时,必须编制专门措施,加强通风、瓦斯、顶板、防火管理.\\\\n\\\\n# 第二节 回采和顶板控制']"
      }
    ],
    "structuredContent": {
      "result": "['第一百九十六条 矿井必须从设计和采掘生产管理上采取措施,防止瓦斯积聚;当发生瓦斯积聚时,必须及时处理.当瓦斯超限达到断电浓度时,班组长、瓦斯检查工、安全检查工、矿调度员有权责令现场作业人员停止作业,停电撤人.\\\\n\\\\n矿井必须有因停电和检修主要通风机停止运转或者通风系统遭到破坏以后恢复通风、排除瓦斯和送电的安全措施.恢复正常通风后,所有受到停风影响的地点,都必须经过通风、瓦斯检查人员检查,证实无危险后,方可恢复工作.所有安装电动机及其开关的地点附近 $2 0 \\\\\\\\mathrm { m }$ 的巷道内,都必须检查瓦斯,只有甲烷浓度符合本规程规定时,方可开启.\\\\n\\\\n临时停工的地点,不得停风;否则必须切断非本质安全型电气设备的电源,设置栅栏、警标,禁止人员进入,并向矿调度室报告.停工区内甲烷或者二氧化碳浓度达到 $3 . 0 \\\\\\\\%$ 或者其他有害气体浓度超过本规程第156条的规定不能立即处理时,必须在内封闭完毕.\\\\n\\\\n恢复已封闭的停工区或者采掘工作接近这些地点时,必须事先排除其中积聚的瓦斯.排除瓦斯工作必须制定安全技术措施.\\\\n\\\\n严禁在停风或者瓦斯超限的区域内作业.', '第二百四十三条 清理突出的煤(岩)时,必须制定防煤尘、片帮、冒顶、瓦斯超限、出现火源,以及防止再次发生突出事故的安全措施.\\\\n\\\\n# 第七章 防灭火\\\\n\\\\n# 第一节 一般规定', '第五百二十二条 电量超过 $2 \\\\\\\\mathbf { k } \\\\\\\\mathbf { W } \\\\\\\\cdot \\\\\\\\mathbf { h }$ 的锂电池动力装置应当符合下列要求:\\\\n\\\\n(一)电池之间具有防止热扩散的措施.\\\\n\\\\n(二)输入、输出端设置断电开关,瓦斯超限应当切断所有非本质安全输出.\\\\n\\\\n(三)具有远程连续监测与安全预警功能.', '第一百九十条 低瓦斯矿井必须建立防止瓦斯异常的制度,并遵守下列规定:\\\\n\\\\n(一)开拓新水平、新采区,揭露新煤层,以及采煤工作面绝对瓦斯涌出量超过 $3 \\\\\\\\mathrm { m } ^ { 3 } / \\\\\\\\mathrm { m i n }$ 或者掘进工作面绝对瓦斯涌出量超过$1 \\\\\\\\mathrm { m } ^ { 3 } / \\\\\\\\mathrm { m i n }$ 时,应当测定煤层瓦斯含量或者瓦斯压力.\\\\n\\\\n(二)启用密闭区、盲巷等区域时,必须制定安全排放 瓦 斯\\\\n\\\\n措施.\\\\n\\\\n(三)开采容易自燃和自燃煤层时,必须加强对采空区瓦斯爆炸风险的分析、制定安全措施.\\\\n\\\\n(四)必须建立健全并实施通风瓦斯定期分析制度、制定防范措施.\\\\n\\\\n(五)瓦斯排放、巷道贯通、揭露煤层、清理煤仓、强制放顶、火 区封闭和启封等重点作业环节必须做好瓦斯监测,强化瓦斯防治.', '第二百二十一条 煤与二氧化碳突出、岩石与二氧化碳突出、岩石与瓦斯突出的管理和防治措施参照本章规定执行.\\\\n\\\\n# 第二节 区域综合防突措施', '第一百九十九条 有瓦斯或者二氧化碳喷出的煤(岩)层,采掘作业前必须采取下列措施:\\\\n\\\\n(一)施工前探钻孔或者瓦斯治理钻孔.(二)加大喷出危险区域的风量.(三)将喷出的瓦斯或者二氧化碳直接引入回风巷或者抽采瓦斯管路.', '第七百七十条 处理瓦斯(煤尘)爆炸事故时,应当遵守下列规定:\\\\n\\\\n(一)立即切断灾区电源.(二)检查灾区内有害气体的浓度、温度及通风设施破坏情况,发现有再次爆炸危险时,必须立即撤离至安全地点.(三)进入灾区行动要谨慎,防止碰撞产生火花,引起爆炸.(四)经探察确认或者分析认定人员已经遇难,并且没有火源时,必须先恢复灾区通风,再进行处理.', '第一百一十六条 采(盘)区结束后、回撤设备时,必须编制专门措施,加强通风、瓦斯、顶板、防火管理.\\\\n\\\\n# 第二节 回采和顶板控制']"
    },
    "isError": false
  }
} </tool_response>`,
  `<think> 好的，用户问的是井下发现瓦斯超限怎么处理。首先我需要调用MCP_retrieve_coal_mine_regulations工具来查找相关条款。根据之前的工具描述，这个工具会在《煤矿安全规程》中检索相关内容。用户可能需要具体的条款和处理步骤，所以我要确保查询的关键词准确，比如“瓦斯超限”和“处理措施”。`,

`在用户提供的工具结果里，有多个条款涉及瓦斯超限的处理。比如第一百九十六条提到当瓦斯超限达到断电浓度时，相关人员有权停止作业并撤离人员。还有第七百七十条处理瓦斯爆炸事故的步骤，虽然用户问的是超限，但可能相关。此外，第二百四十三条和第五百二十二条也提到了防瓦斯超限的措施，比如安全监测和断电开关的要求。`,

`需要将这些信息整理成清晰的处理步骤，确保涵盖应急处理、安全措施和预防方法。同时要注意引用正确的条款，比如第一百九十六条和第七百七十条，可能还需要提到其他相关条款如第二百四十三条和第五百二十二条中的具体要求，比如防煤尘措施和锂电池的安全要求。最后，要提醒用户遵循这些规定，并在必要时联系专业人员，确保处理得当。`,

  `</think>`,
  `根据《煤矿安全规程》相关条款，井下发现瓦斯超限应按以下程序处理：`,

`**1. 紧急处置（依据第196条）**
- 立即停止作业，切断电源
- 瓦斯超限达到断电浓度时，班组长、瓦斯检查工等有权责令停电撤人
- 作业人员必须第一时间撤离至安全地点

**2. 系统处理要求**
- 停风区域必须切断非本质安全型电气设备电源，设置栅栏警标（第196条）`,
`- 恢复通风前需经通风、瓦斯检查人员检查确认安全（第196条）
- 电动机及开关附近20m巷道内必须检查瓦斯，甲烷浓度符合规程要求方可启动（第196条）

**3. 特殊场景处置**
- 临时停工地点停风时，必须封闭停工区并设置警标（第196条）
- 瓦斯浓度≥3.0%或有害气体超标无法立即处理时，必须在24小时内封闭（第196条）
- 排除停工区瓦斯时需制定专项安全技术措施（第196条）

**4. 防范措施（依据第243条、第522条）**
- 煤与瓦斯突出区域必须采取区域综合防突措施
- 锂电池动力装置需设置断电开关，瓦斯超限时切断非本质安全输出`,
`- 重点作业环节必须加强瓦斯监测，如瓦斯排放、巷道贯通等

**5. 事故处理（第770条）**
- 爆炸事故处理时应：
  ① 切断灾区电源
  ② 检查有害气体浓度及通风设施
  ③ 防止碰撞产生火花
  ④ 经确认无火源后恢复通风

**注意事项**：所有处理必须严格遵守《煤矿安全规程》相关条款，现场人员应优先执行第196条的紧急处置程序，特殊情况需联系专业技术人员制定专项措施。`]




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

const formatTime = (timestamp: number) => {
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
  // 格式化AI回答，支持markdown样式
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
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

const loadSession = (sessionId: string) => {
  // 加载历史对话
  currentSessionId.value = sessionId
  // 这里应该从后端加载对应的对话记录
}

const deleteSession = (sessionId: string) => {
  const index = chatSessions.value.findIndex((session) => session.id === sessionId)
  if (index !== -1) {
    chatSessions.value.splice(index, 1)
  }
}

// 生命周期
onMounted(() => {
  // 初始化
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
  background: #f5f5f5;
  height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px 20px 10px 20px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left h1 {
  margin: 0 0 8px 0;
  color: #333333;
  font-size: 24px;
  font-weight: 600;
}

.header-left p {
  margin: 0;
  color: #999999;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn.primary {
  background: #1890ff;
  color: #ffffff;
  border: 1px solid #1890ff;
}

.action-btn.secondary {
  background: #ffffff;
  color: #666666;
  border: 1px solid #d9d9d9;
}

.action-btn.small {
  padding: 6px 12px;
  font-size: 12px;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn.primary:hover {
  background: #40a9ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.action-btn.secondary:hover {
  border-color: #1890ff;
  color: #1890ff;
  background: #f0f8ff;
}

.qna-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  height: calc(100vh - 200px);
}

.chat-section {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 0;
  margin-bottom: 10px;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #fafafa;
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

.welcome-content .ai-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px auto 20px;
  box-shadow: 0 8px 24px rgba(24, 144, 255, 0.3);
}

.welcome-content .ai-avatar i {
  font-size: 32px;
  color: #ffffff;
}

.welcome-content h3 {
  margin: 0 0 16px 0;
  color: #333333;
  font-size: 24px;
}

.welcome-content p {
  color: #666666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.quick-start-tips {
  text-align: left;
  background: #ffffff;
  padding: 20px 10px 10px 20px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.quick-start-tips h4 {
  margin: 0 0 12px 0;
  color: #1890ff;
  font-size: 16px;
}

.quick-start-tips ul {
  margin: 0;
  padding-left: 20px;
  color: #666666;
}

.quick-start-tips li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  animation: fadeInUp 0.3s ease;
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

.user-avatar {
  background: #52c41a;
}

.ai-avatar {
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.user-avatar i,
.ai-avatar i {
  color: #ffffff;
  font-size: 18px;
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
  color: #333333;
  font-size: 14px;
}

.message-time {
  color: #999999;
  font-size: 12px;
}

.message-body {
  margin-bottom: 8px;
}

.user-message {
  background: #ffffff;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  color: #333333;
  line-height: 1.5;
}

.ai-message {
  background: #f0f8ff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e6f7ff;
  color: #333333;
  line-height: 1.6;
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
  border-top: 1px solid #e8e8e8;
  background: #ffffff;
}

.quick-questions {
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.quick-questions h4 {
  margin: 0 0 16px 0;
  color: #333333;
  font-size: 16px;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.question-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.question-card:hover {
  border-color: #1890ff;
  background: #f0f8ff;
  transform: translateY(-1px);
}
@media (max-height: 768px) {
  .question-card {
    gap: 6px;
    padding: 4px;
  }
  .quick-questions {
  padding: 10px;
 }

.quick-questions h4 {
  margin: 0 0 12px 0;
  color: #333333;
  font-size: 16px;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 7px;
}

}

.question-card i {
  color: #1890ff;
  font-size: 16px;
  flex-shrink: 0;
}

.question-card span {
  color: #666666;
  font-size: 14px;
  line-height: 1.4;
}

.input-container {
  padding: 20px;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px;
  transition: border-color 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #333333;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  min-height: 20px;
  max-height: 120px;
  overflow-y: auto;
}

.chat-input::placeholder {
  color: #999999;
}

.input-actions {
  display: flex;
  align-items: center;
}

.send-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn:not(:disabled):hover {
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  transform: scale(1.05);
}

.input-tips {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #999999;
}

.info-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.history-section,
.knowledge-shortcuts,
.usage-stats {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.history-section h3,
.knowledge-shortcuts h3,
.usage-stats h3 {
  margin: 0 0 16px 0;
  color: #333333;
  font-size: 16px;
  font-weight: 600;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-item:hover {
  border-color: #1890ff;
  background: #f0f8ff;
}

.history-item.active {
  border-color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
}

.session-info h4 {
  margin: 0 0 4px 0;
  color: #333333;
  font-size: 14px;
  font-weight: 500;
}

.session-info p {
  margin: 0 0 4px 0;
  color: #999999;
  font-size: 12px;
}

.message-count {
  color: #999999;
  font-size: 11px;
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
.history-list::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track,
.history-list::-webkit-scrollbar-track {
  background: #f0f0f0;
}

.chat-messages::-webkit-scrollbar-thumb,
.history-list::-webkit-scrollbar-thumb {
  background: #1890ff;
  border-radius: 3px;
  opacity: 0.7;
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
  background: #f6ffed;
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
