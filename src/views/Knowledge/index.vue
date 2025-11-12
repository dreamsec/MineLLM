<template>
  <div class="knowledge-base-page">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <div class="header-left">
        <h1>知识库管理</h1>
        <p>知识库条目管理、分类管理、搜索功能与权限控制</p>
      </div>
      <div class="header-actions">
        <button class="action-btn secondary" @click="showImportDialog = true">
          <i class="fas fa-upload"></i>
          批量导入
        </button>
        <button class="action-btn primary" @click="showAddDialog = true">
          <i class="fas fa-plus"></i>
          新增文档
        </button>
      </div>
    </div>

    <div class="knowledge-container">
      <!-- 左侧分类树和搜索 -->
      <div class="sidebar">
        <!-- 搜索区域 -->
        <div class="search-section">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input
              v-model="searchQuery"
              placeholder="搜索知识库内容..."
              @input="handleSearch"
              class="search-input"
            />
            <button v-if="searchQuery" @click="clearSearch" class="clear-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- 高级搜索 -->
          <div class="advanced-search" v-if="showAdvancedSearch">
            <div class="filter-group">
              <label>文档类型：</label>
              <select v-model="searchFilters.type" class="filter-select">
                <option value="">全部类型</option>
                <option value="manual">操作手册</option>
                <option value="procedure">操作规程</option>
                <option value="case">故障案例</option>
                <option value="standard">技术标准</option>
              </select>
            </div>

            <div class="filter-group">
              <label>创建时间：</label>
              <input type="date" v-model="searchFilters.startDate" class="filter-input" />
              <span>至</span>
              <input type="date" v-model="searchFilters.endDate" class="filter-input" />
            </div>

            <div class="filter-actions">
              <button class="action-btn small primary" @click="applyAdvancedSearch">
                应用筛选
              </button>
              <button class="action-btn small secondary" @click="resetFilters">重置</button>
            </div>
          </div>

          <button class="toggle-advanced-btn" @click="showAdvancedSearch = !showAdvancedSearch">
            <i :class="showAdvancedSearch ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
            {{ showAdvancedSearch ? '收起高级搜索' : '展开高级搜索' }}
          </button>
        </div>

        <!-- 分类树 -->
        <div class="category-section">
          <div class="section-header">
            <h3>知识分类</h3>
            <button class="action-btn small" @click="showCategoryDialog = true">
              <i class="fas fa-plus"></i>
              新增分类
            </button>
          </div>

          <div class="category-tree">
            <div
              v-for="category in categories"
              :key="category.id"
              :class="['category-item', { active: selectedCategory?.id === category.id }]"
              @click="selectCategory(category)"
            >
              <div class="category-content">
                <i :class="category.icon"></i>
                <span class="category-name">{{ category.name }}</span>
                <span class="doc-count">({{ category.docCount }})</span>
              </div>

              <div class="category-actions">
                <button class="action-btn tiny" @click.stop="editCategory(category)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn tiny" @click.stop="deleteCategory(category.id)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="stats-section">
          <h3>统计信息</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-number">{{ stats.totalDocs }}</span>
              <span class="stat-label">总文档数</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ stats.todayAdded }}</span>
              <span class="stat-label">今日新增</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ stats.weeklyViews }}</span>
              <span class="stat-label">本周阅读</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ stats.avgRating }}</span>
              <span class="stat-label">平均评分</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="content-area">
        <!-- 工具栏 -->
        <div class="toolbar">
          <div class="view-controls">
            <button
              :class="['view-btn', { active: viewMode === 'grid' }]"
              @click="viewMode = 'grid'"
            >
              <i class="fas fa-th"></i>
              网格视图
            </button>
            <button
              :class="['view-btn', { active: viewMode === 'list' }]"
              @click="viewMode = 'list'"
            >
              <i class="fas fa-list"></i>
              列表视图
            </button>
          </div>

          <div class="sort-controls">
            <select v-model="sortBy" class="sort-select">
              <option value="createTime">创建时间</option>
              <option value="updateTime">更新时间</option>
              <option value="viewCount">阅读次数</option>
              <option value="rating">评分</option>
              <option value="title">标题</option>
            </select>
            <button
              class="sort-order-btn"
              @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
            >
              <i :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
            </button>
          </div>
        </div>

        <!-- 文档列表 -->
        <div class="documents-container">
          <!-- 网格视图 -->
          <div v-if="viewMode === 'grid'" class="documents-grid">
            <div
              v-for="doc in filteredDocuments"
              :key="doc.id"
              class="document-card"
              @click="viewDocument(doc)"
            >
              <div class="doc-header">
                <div class="doc-type-badge" :class="doc.type">
                  {{ getTypeLabel(doc.type) }}
                </div>
                <div class="doc-actions">
                  <button class="action-btn tiny" @click.stop="editDocument(doc)">
                    <i class="fas fa-cog"></i>
                  </button>
                  <button class="action-btn tiny" @click.stop="deleteDocument(doc.id)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>

              <div class="doc-content">
                <h4 class="doc-title">{{ doc.title }}</h4>
                <p class="doc-summary">{{ doc.summary }}</p>

                <div class="doc-meta">
                  <div class="meta-item">
                    <i class="fas fa-user"></i>
                    <span>{{ doc.author }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="fas fa-clock"></i>
                    <span>{{ formatDate(doc.updateTime) }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="fas fa-eye"></i>
                    <span>{{ doc.viewCount }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="fas fa-star"></i>
                    <span>{{ doc.rating }}/5</span>
                  </div>
                </div>
              </div>

              <div class="doc-footer">
                <div class="doc-tags">
                  <span v-for="tag in doc.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 列表视图 -->
          <div v-else class="documents-list">
            <div class="list-header">
              <div class="col-title">标题</div>
              <div class="col-type">类型</div>
              <div class="col-author">作者</div>
              <div class="col-update">更新时间</div>
              <div class="col-views">阅读</div>
              <div class="col-rating">评分</div>
              <div class="col-actions">操作</div>
            </div>

            <div
              v-for="doc in filteredDocuments"
              :key="doc.id"
              class="list-item"
              @click="viewDocument(doc)"
            >
              <div class="col-title">
                <div class="doc-title-wrapper">
                  <h4>{{ doc.title }}</h4>
                  <p>{{ doc.summary }}</p>
                </div>
              </div>
              <div class="col-type">
                <span class="type-badge" :class="doc.type">{{ getTypeLabel(doc.type) }}</span>
              </div>
              <div class="col-author">{{ doc.author }}</div>
              <div class="col-update">{{ formatDate(doc.updateTime) }}</div>
              <div class="col-views">{{ doc.viewCount }}</div>
              <div class="col-rating">
                <div class="rating-display">
                  <span>{{ doc.rating }}/5</span>
                  <div class="stars">
                    <i
                      v-for="n in 5"
                      :key="n"
                      :class="n <= doc.rating ? 'fas fa-star' : 'far fa-star'"
                    ></i>
                  </div>
                </div>
              </div>
              <div class="col-actions">
                <button class="action-btn small" @click.stop="editDocument(doc)">编辑</button>
                <button class="action-btn small secondary" @click.stop="deleteDocument(doc.id)">
                  删除
                </button>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination">
            <button :disabled="currentPage === 1" @click="currentPage--" class="page-btn">
              上一页
            </button>

            <span class="page-info">
              第 {{ currentPage }} 页，共 {{ totalPages }} 页，共 {{ totalDocs }} 条记录
            </span>

            <button :disabled="currentPage === totalPages" @click="currentPage++" class="page-btn">
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑文档对话框 -->
    <div v-if="showAddDialog || showEditDialog" class="modal-overlay" @click="closeDialogs">
      <div class="modal-dialog" @click.stop>
        <div class="modal-header">
          <h3>{{ showAddDialog ? '新增文档' : '编辑文档' }}</h3>
          <button class="close-btn" @click="closeDialogs">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveDocument">
            <div class="form-group">
              <label>文档标题 *</label>
              <input v-model="documentForm.title" type="text" required class="form-input" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>文档类型 *</label>
                <select v-model="documentForm.type" required class="form-select">
                  <option value="manual">操作手册</option>
                  <option value="procedure">操作规程</option>
                  <option value="case">故障案例</option>
                  <option value="standard">技术标准</option>
                </select>
              </div>

              <div class="form-group">
                <label>所属分类 *</label>
                <select v-model="documentForm.categoryId" required class="form-select">
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>文档摘要</label>
              <textarea v-model="documentForm.summary" rows="3" class="form-textarea"></textarea>
            </div>

            <div class="form-group">
              <label>标签（用逗号分隔）</label>
              <input v-model="documentForm.tagsStr" type="text" class="form-input" />
            </div>

            <div class="form-group">
              <label>文档内容 *</label>
              <textarea
                v-model="documentForm.content"
                rows="10"
                required
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-group">
              <label>附件</label>
              <input type="file" multiple @change="handleFileUpload" class="form-file" />
              <div v-if="documentForm.attachments.length > 0" class="attachments-list">
                <div
                  v-for="(file, index) in documentForm.attachments"
                  :key="index"
                  class="attachment-item"
                >
                  <span>{{ file.name }}</span>
                  <button type="button" @click="removeAttachment(index)" class="remove-btn">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button type="button" @click="closeDialogs" class="action-btn secondary">取消</button>
          <button @click="saveDocument" class="action-btn primary">保存</button>
        </div>
      </div>
    </div>

    <!-- 分类管理对话框 -->
    <div v-if="showCategoryDialog" class="modal-overlay" @click="showCategoryDialog = false">
      <div class="modal-dialog small" @click.stop>
        <div class="modal-header">
          <h3>{{ editingCategory ? '编辑分类' : '新增分类' }}</h3>
          <button class="close-btn" @click="showCategoryDialog = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveCategory">
            <div class="form-group">
              <label>分类名称 *</label>
              <input v-model="categoryForm.name" type="text" required class="form-input" />
            </div>

            <div class="form-group">
              <label>分类图标</label>
              <select v-model="categoryForm.icon" class="form-select">
                <option value="fas fa-folder">📁 文件夹</option>
                <option value="fas fa-book">📚 书籍</option>
                <option value="fas fa-file-alt">📄 文档</option>
                <option value="fas fa-cog">⚙️ 设备</option>
                <option value="fas fa-exclamation-triangle">⚠️ 警告</option>
              </select>
            </div>

            <div class="form-group">
              <label>分类描述</label>
              <textarea
                v-model="categoryForm.description"
                rows="3"
                class="form-textarea"
              ></textarea>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button type="button" @click="showCategoryDialog = false" class="action-btn secondary">
            取消
          </button>
          <button @click="saveCategory" class="action-btn primary">保存</button>
        </div>
      </div>
    </div>

    <!-- 导入对话框 -->
    <div v-if="showImportDialog" class="modal-overlay" @click="showImportDialog = false">
      <div class="modal-dialog" @click.stop>
        <div class="modal-header">
          <h3>批量导入文档</h3>
          <button class="close-btn" @click="showImportDialog = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="import-section">
            <div class="upload-area" @drop="handleDrop" @dragover.prevent @dragenter.prevent>
              <i class="fas fa-upload"></i>
              <h4>拖拽文件到这里，或点击选择文件</h4>
              <p>支持 .doc, .docx, .pdf, .txt 格式</p>
              <input
                type="file"
                multiple
                accept=".doc,.docx,.pdf,.txt"
                @change="handleImportFiles"
              />
            </div>

            <div v-if="importFiles.length > 0" class="import-files-list">
              <h4>待导入文件：</h4>
              <div v-for="(file, index) in importFiles" :key="index" class="import-file-item">
                <span>{{ file.name }}</span>
                <select v-model="file.category" class="mini-select">
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
                <button @click="removeImportFile(index)" class="remove-btn">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" @click="showImportDialog = false" class="action-btn secondary">
            取消
          </button>
          <button
            @click="executeImport"
            :disabled="importFiles.length === 0"
            class="action-btn primary"
          >
            开始导入
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

// 定义组件名称
defineOptions({
  name: 'KnowledgeBasePage'
})

// 定义类型接口
interface Category {
  id: number
  name: string
  icon: string
  docCount: number
  description: string
}

interface Document {
  id: number
  title: string
  type: 'manual' | 'procedure' | 'case' | 'standard'
  categoryId: number
  summary: string
  content: string
  author: string
  createTime: number
  updateTime: number
  viewCount: number
  rating: number
  tags: string[]
}

interface ImportFile {
  file: File
  name: string
  category: number | string
}

interface DocumentForm {
  id: number | null
  title: string
  type: string
  categoryId: string | number
  summary: string
  content: string
  tagsStr: string
  attachments: File[]
}

interface CategoryForm {
  id: number | null
  name: string
  icon: string
  description: string
}

interface SearchFilters {
  type: string
  startDate: string
  endDate: string
}

// 响应式数据
const searchQuery = ref<string>('')
const showAdvancedSearch = ref<boolean>(false)
const selectedCategory = ref<Category | null>(null)
const viewMode = ref<'grid' | 'list'>('grid')
const sortBy = ref<string>('updateTime')
const sortOrder = ref<'asc' | 'desc'>('desc')
const currentPage = ref<number>(1)
const pageSize = ref<number>(12)

// 对话框状态
const showAddDialog = ref<boolean>(false)
const showEditDialog = ref<boolean>(false)
const showCategoryDialog = ref<boolean>(false)
const showImportDialog = ref<boolean>(false)

// 表单数据
const documentForm = reactive<DocumentForm>({
  id: null,
  title: '',
  type: 'manual',
  categoryId: '',
  summary: '',
  content: '',
  tagsStr: '',
  attachments: [],
})

const categoryForm = reactive<CategoryForm>({
  id: null,
  name: '',
  icon: 'fas fa-folder',
  description: '',
})

const searchFilters = reactive<SearchFilters>({
  type: '',
  startDate: '',
  endDate: '',
})

// 导入相关
const importFiles = ref<ImportFile[]>([])
const editingCategory = ref<Category | null>(null)

// 模拟数据
const categories = ref<Category[]>([
  {
    id: 1,
    name: '操作手册',
    icon: 'fas fa-book',
    docCount: 4,
    description: '设备操作相关手册',
  },
  {
    id: 2,
    name: '操作规程',
    icon: 'fas fa-file-alt',
    docCount: 4,
    description: '标准操作规程文档',
  },
  {
    id: 3,
    name: '故障案例',
    icon: 'fas fa-exclamation-triangle',
    docCount: 4,
    description: '设备故障处理案例',
  },
  {
    id: 4,
    name: '技术标准',
    icon: 'fas fa-cog',
    docCount: 6,
    description: '行业技术标准规范',
  },
])

const documents = ref<Document[]>([
  {
    id: 1,
    title: '主提升机操作手册',
    type: 'manual',
    categoryId: 1,
    summary: '详细介绍主提升机的操作流程、注意事项和维护要点',
    content: '主提升机操作手册详细内容包括设备启动前检查、运行中的监控要点、故障处理流程等关键内容。操作人员必须严格遵循操作规范，确保设备安全运行。',
    author: '张工程师',
    createTime: new Date().getTime() - 86400000 * 5,
    updateTime: new Date().getTime() - 86400000 * 2,
    viewCount: 156,
    rating: 4.5,
    tags: ['提升机', '操作', '安全'],
  },
  {
    id: 2,
    title: '安全操作规程',
    type: 'procedure',
    categoryId: 2,
    summary: '煤矿设备安全操作的标准流程和规范要求',
    content: '安全操作规程详细内容涵盖了煤矿各类设备的安全操作标准、风险防控措施、应急处置流程等，是保障煤矿生产安全的重要指导性文件。',
    author: '李主任',
    createTime: new Date().getTime() - 86400000 * 10,
    updateTime: new Date().getTime() - 86400000 * 1,
    viewCount: 234,
    rating: 4.8,
    tags: ['安全', '规程', '标准'],
  },
  {
    id: 3,
    title: '轴承故障诊断案例',
    type: 'case',
    categoryId: 3,
    summary: '主提升机轴承异响故障的诊断和处理过程',
    content: '轴承故障诊断案例详细记录了某次主提升机轴承异响故障的现象、原因分析、诊断方法和解决方案，为类似故障的快速处理提供了参考。',
    author: '王技师',
    createTime: new Date().getTime() - 86400000 * 3,
    updateTime: new Date().getTime() - 86400000 * 1,
    viewCount: 89,
    rating: 4.2,
    tags: ['轴承', '故障', '诊断'],
  },
  {
    id: 4,
    title: '通风机维护保养指南',
    type: 'manual',
    categoryId: 1,
    summary: '煤矿通风机的日常维护、定期保养和故障预防措施',
    content: '本指南详细说明了通风机的日常巡检项目、润滑维护周期、易损件更换标准以及常见问题的排查方法，帮助维护人员延长设备使用寿命。',
    author: '刘技术员',
    createTime: new Date().getTime() - 86400000 * 7,
    updateTime: new Date().getTime() - 86400000 * 3,
    viewCount: 128,
    rating: 4.6,
    tags: ['通风机', '维护', '保养'],
  },
  {
    id: 5,
    title: '电气安全操作规范',
    type: 'procedure',
    categoryId: 2,
    summary: '煤矿电气设备的安全操作流程和注意事项',
    content: '本规范涵盖了煤矿井下电气设备的安装、调试、运行和维护的安全操作要求，特别强调了触电防护、防爆措施和应急处理等关键环节。',
    author: '陈电工',
    createTime: new Date().getTime() - 86400000 * 15,
    updateTime: new Date().getTime() - 86400000 * 5,
    viewCount: 312,
    rating: 4.9,
    tags: ['电气', '安全', '操作'],
  },
  {
    id: 6,
    title: '液压系统泄漏故障分析',
    type: 'case',
    categoryId: 3,
    summary: '液压支架系统泄漏故障的诊断与修复案例',
    content: '本案例详细记录了一起液压支架系统泄漏故障的发现过程、原因分析和修复方案，包括密封件更换、压力测试等关键步骤和技术要点。',
    author: '周技师',
    createTime: new Date().getTime() - 86400000 * 2,
    updateTime: new Date().getTime() - 86400000 * 1,
    viewCount: 76,
    rating: 4.3,
    tags: ['液压系统', '泄漏', '维修'],
  },
  {
    id: 7,
    title: '掘进机操作与维护手册',
    type: 'manual',
    categoryId: 1,
    summary: '煤矿掘进机的基本构造、操作方法和维护保养知识',
    content: '本手册全面介绍了掘进机的主要组成部分、工作原理、安全操作流程和日常维护要点，适合操作人员和维护人员学习参考。',
    author: '吴工程师',
    createTime: new Date().getTime() - 86400000 * 8,
    updateTime: new Date().getTime() - 86400000 * 4,
    viewCount: 187,
    rating: 4.7,
    tags: ['掘进机', '操作', '维护'],
  },
  {
    id: 8,
    title: '煤尘爆炸预防规程',
    type: 'procedure',
    categoryId: 2,
    summary: '煤矿煤尘爆炸的危害及预防措施',
    content: '本规程详细说明了煤尘爆炸的条件、危害以及预防措施，包括通风管理、粉尘监测、喷雾降尘等关键技术和管理要求。',
    author: '黄安全主管',
    createTime: new Date().getTime() - 86400000 * 20,
    updateTime: new Date().getTime() - 86400000 * 2,
    viewCount: 421,
    rating: 4.9,
    tags: ['煤尘', '爆炸', '预防'],
  },
  {
    id: 9,
    title: '胶带输送机断带事故处理',
    type: 'case',
    categoryId: 3,
    summary: '井下胶带输送机断带事故的应急处理和预防',
    content: '本案例记录了一起胶带输送机断带事故的发生经过、应急处置过程、原因分析和防范措施，提供了类似事故的处理参考。',
    author: '郑技术员',
    createTime: new Date().getTime() - 86400000 * 6,
    updateTime: new Date().getTime() - 86400000 * 3,
    viewCount: 156,
    rating: 4.4,
    tags: ['胶带输送机', '断带', '应急'],
  },
  {
    id: 10,
    title: '瓦斯监测系统使用手册',
    type: 'manual',
    categoryId: 1,
    summary: '煤矿瓦斯监测系统的安装、调试、使用和维护',
    content: '本手册介绍了瓦斯监测系统的组成、工作原理、安装要求、日常使用方法和常见故障处理，是保障煤矿瓦斯安全的重要技术资料。',
    author: '赵工程师',
    createTime: new Date().getTime() - 86400000 * 4,
    updateTime: new Date().getTime() - 86400000 * 1,
    viewCount: 267,
    rating: 4.8,
    tags: ['瓦斯监测', '安全', '系统'],
  },
  {
    id: 11,
    title: '井下作业安全管理规定',
    type: 'procedure',
    categoryId: 2,
    summary: '煤矿井下各类作业的安全管理要求和操作规范',
    content: '本规定详细说明了井下各类作业的安全风险、管理要求、操作规范和应急处置流程，是井下作业人员必须遵守的安全准则。',
    author: '孙矿长',
    createTime: new Date().getTime() - 86400000 * 25,
    updateTime: new Date().getTime() - 86400000 * 10,
    viewCount: 532,
    rating: 5.0,
    tags: ['井下作业', '安全管理', '规定'],
  },
  {
    id: 12,
    title: '电机过热故障诊断与处理',
    type: 'case',
    categoryId: 3,
    summary: '煤矿设备电机过热故障的常见原因及处理方法',
    content: '本案例分析了电机过热的多种可能原因，包括负载过大、轴承损坏、通风不良等，并提供了相应的诊断方法和处理步骤。',
    author: '林电工',
    createTime: new Date().getTime() - 86400000 * 1,
    updateTime: new Date().getTime(),
    viewCount: 98,
    rating: 4.5,
    tags: ['电机', '过热', '故障'],
  },
  // 技术标准类文档
  {
    id: 13,
    title: '煤矿机电设备完好标准',
    type: 'standard',
    categoryId: 4,
    summary: '煤矿各类机电设备的技术参数、性能指标和完好判定标准',
    content: '本标准详细规定了煤矿主要机电设备的完好标准，包括提升设备、通风设备、排水设备、压风设备、运输设备等的技术参数、性能指标、维护要求和完好判定标准，是设备验收、检查和评级的重要依据。',
    author: '国家煤矿安全监察局',
    createTime: new Date().getTime() - 86400000 * 30,
    updateTime: new Date().getTime() - 86400000 * 15,
    viewCount: 892,
    rating: 4.9,
    tags: ['机电设备', '完好标准', '技术规范'],
  },
  {
    id: 14,
    title: '煤矿安全监控系统技术规范',
    type: 'standard',
    categoryId: 4,
    summary: '煤矿安全监控系统的设计、安装、使用和维护的技术要求',
    content: '本规范规定了煤矿安全监控系统的技术要求、系统组成、传感器布置、数据传输、中心站设置、软件功能、断电控制等内容，适用于各类煤矿安全监控系统的设计、安装、使用和维护。',
    author: '煤炭工业协会',
    createTime: new Date().getTime() - 86400000 * 45,
    updateTime: new Date().getTime() - 86400000 * 10,
    viewCount: 678,
    rating: 4.8,
    tags: ['安全监控', '技术规范', '系统设计'],
  },
  {
    id: 15,
    title: '煤矿井下电气设备防爆标准',
    type: 'standard',
    categoryId: 4,
    summary: '煤矿井下电气设备的防爆要求、测试方法和检验规则',
    content: '本标准详细规定了煤矿井下电气设备的防爆类型、防爆标志、结构要求、材料要求、试验方法和检验规则，确保电气设备在煤矿井下爆炸性环境中安全可靠运行。',
    author: '国家标准委员会',
    createTime: new Date().getTime() - 86400000 * 60,
    updateTime: new Date().getTime() - 86400000 * 20,
    viewCount: 543,
    rating: 4.7,
    tags: ['电气设备', '防爆标准', '安全要求'],
  },
  {
    id: 16,
    title: '煤矿液压支架技术条件',
    type: 'standard',
    categoryId: 4,
    summary: '煤矿液压支架的型号编制、技术参数和试验方法',
    content: '本技术条件规定了煤矿液压支架的型号编制方法、主要技术参数、结构要求、性能要求、试验方法、检验规则和标志、包装、运输、贮存等内容，适用于煤矿井下缓倾斜、急倾斜煤层使用的各类液压支架。',
    author: '煤炭科学研究院',
    createTime: new Date().getTime() - 86400000 * 35,
    updateTime: new Date().getTime() - 86400000 * 12,
    viewCount: 321,
    rating: 4.6,
    tags: ['液压支架', '技术条件', '试验方法'],
  },
  {
    id: 17,
    title: '煤矿通风系统评价标准',
    type: 'standard',
    categoryId: 4,
    summary: '煤矿通风系统的评价指标、评价方法和等级划分',
    content: '本标准规定了煤矿通风系统的评价指标体系、评价方法、等级划分及相应的改进要求，包括通风系统的可靠性、稳定性、经济性和安全性等方面的评价内容，适用于各类煤矿通风系统的评价和优化。',
    author: '煤矿安全技术中心',
    createTime: new Date().getTime() - 86400000 * 25,
    updateTime: new Date().getTime() - 86400000 * 8,
    viewCount: 456,
    rating: 4.5,
    tags: ['通风系统', '评价标准', '等级划分'],
  },
  {
    id: 18,
    title: '煤矿用钢丝绳检验规范',
    type: 'standard',
    categoryId: 4,
    summary: '煤矿用钢丝绳的质量要求、检验方法和报废标准',
    content: '本规范规定了煤矿用提升钢丝绳、运输钢丝绳的质量要求、检验项目、检验方法、检验周期和报废标准，包括外观检查、直径测量、断丝检查、锈蚀检查、磨损检查等内容，是确保钢丝绳安全使用的重要技术依据。',
    author: '国家安全生产监督管理总局',
    createTime: new Date().getTime() - 86400000 * 50,
    updateTime: new Date().getTime() - 86400000 * 15,
    viewCount: 289,
    rating: 4.7,
    tags: ['钢丝绳', '检验规范', '报废标准'],
  }
])

const stats = reactive({
  totalDocs: 18,
  todayAdded: 3,
  weeklyViews: 1245,
  avgRating: 4.3,
})

// 计算属性
const filteredDocuments = computed(() => {
  let filtered = [...documents.value]

  // 分类筛选
  if (selectedCategory.value) {
    filtered = filtered.filter((doc) => doc.categoryId === selectedCategory.value!.id)
  }

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (doc) =>
        doc.title.toLowerCase().includes(query) ||
        doc.summary.toLowerCase().includes(query) ||
        doc.author.toLowerCase().includes(query) ||
        doc.tags.some((tag) => tag.toLowerCase().includes(query)),
    )
  }

  // 高级筛选
  if (searchFilters.type) {
    filtered = filtered.filter((doc) => doc.type === searchFilters.type)
  }

  // 排序
  filtered.sort((a, b) => {
    let aVal = a[sortBy.value as keyof Document] as string | number
    let bVal = b[sortBy.value as keyof Document] as string | number

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (sortOrder.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return filtered
})

const totalDocs = computed(() => filteredDocuments.value.length)
const totalPages = computed(() => Math.ceil(totalDocs.value / pageSize.value))

// 方法
const handleSearch = () => {
  currentPage.value = 1
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

const selectCategory = (category: Category) => {
  selectedCategory.value = selectedCategory.value?.id === category.id ? null : category
  currentPage.value = 1
}

const applyAdvancedSearch = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  Object.assign(searchFilters, {
    type: '',
    startDate: '',
    endDate: '',
  })
  currentPage.value = 1
}

const viewDocument = (doc: Document) => {
  // 查看文档详情
  console.log('查看文档:', doc)
}

const editDocument = (doc: Document) => {
  Object.assign(documentForm, {
    ...doc,
    tagsStr: doc.tags.join(', '),
  })
  showEditDialog.value = true
}

const deleteDocument = (docId: number) => {
  if (confirm('确定要删除这个文档吗？')) {
    const index = documents.value.findIndex((doc) => doc.id === docId)
    if (index !== -1) {
      documents.value.splice(index, 1)
    }
  }
}

const editCategory = (category: Category) => {
  Object.assign(categoryForm, category)
  editingCategory.value = category
  showCategoryDialog.value = true
}

const deleteCategory = (categoryId: number) => {
  if (confirm('确定要删除这个分类吗？分类下的文档将移到未分类。')) {
    const index = categories.value.findIndex((cat) => cat.id === categoryId)
    if (index !== -1) {
      categories.value.splice(index, 1)
    }
  }
}

const saveDocument = () => {
  const tags = documentForm.tagsStr
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag)

  const docData = {
    title: documentForm.title,
    type: documentForm.type as Document['type'],
    categoryId: Number(documentForm.categoryId),
    summary: documentForm.summary,
    content: documentForm.content,
    tags,
    updateTime: new Date().getTime(),
  }

  if (showAddDialog.value) {
    const newDoc: Document = {
      ...docData,
      id: Date.now(),
      createTime: new Date().getTime(),
      author: '当前用户',
      viewCount: 0,
      rating: 0,
    }
    documents.value.unshift(newDoc)
  } else {
    const index = documents.value.findIndex((doc) => doc.id === documentForm.id)
    if (index !== -1) {
      documents.value[index] = { ...documents.value[index], ...docData }
    }
  }

  closeDialogs()
  resetDocumentForm()
}

const saveCategory = () => {
  if (editingCategory.value) {
    const index = categories.value.findIndex((cat) => cat.id === categoryForm.id)
    if (index !== -1) {
      const updatedCategory: Category = {
        ...categories.value[index],
        ...categoryForm,
        id: categories.value[index].id
      }
      categories.value[index] = updatedCategory
    }
  } else {
    const newCategory: Category = {
      ...categoryForm,
      id: Date.now(),
      docCount: 0,
    }
    categories.value.push(newCategory)
  }

  showCategoryDialog.value = false
  resetCategoryForm()
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const files = Array.from(target.files)
    documentForm.attachments.push(...files)
  }
}

const removeAttachment = (index: number) => {
  documentForm.attachments.splice(index, 1)
}

const handleImportFiles = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const files = Array.from(target.files)
    importFiles.value.push(
      ...files.map((file) => ({
        file,
        name: file.name,
        category: categories.value[0]?.id || '',
      })),
    )
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer?.files) {
    const files = Array.from(event.dataTransfer.files)
    importFiles.value.push(
      ...files.map((file) => ({
        file,
        name: file.name,
        category: categories.value[0]?.id || '',
      })),
    )
  }
}

const removeImportFile = (index: number) => {
  importFiles.value.splice(index, 1)
}

const executeImport = () => {
  // 执行批量导入
  console.log('批量导入文件:', importFiles.value)
  showImportDialog.value = false
  importFiles.value = []
}

const closeDialogs = () => {
  showAddDialog.value = false
  showEditDialog.value = false
  resetDocumentForm()
}

const resetDocumentForm = () => {
  Object.assign(documentForm, {
    id: null,
    title: '',
    type: 'manual',
    categoryId: '',
    summary: '',
    content: '',
    tagsStr: '',
    attachments: [],
  })
}

const resetCategoryForm = () => {
  Object.assign(categoryForm, {
    id: null,
    name: '',
    icon: 'fas fa-folder',
    description: '',
  })
  editingCategory.value = null
}

const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    manual: '操作手册',
    procedure: '操作规程',
    case: '故障案例',
    standard: '技术标准',
  }
  return typeMap[type] || type
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// 生命周期
onMounted(() => {
  // 初始化
})
</script>

<style scoped>
.knowledge-base-page {
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

.action-btn.tiny {
  padding: 4px 8px;
  font-size: 11px;
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

.knowledge-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  height: calc(100vh - 200px);
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-section,
.category-section,
.stats-section {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.search-box i {
  position: absolute;
  left: 12px;
  color: #999999;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  color: #333333;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.clear-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: #999999;
  cursor: pointer;
  padding: 4px;
}

.advanced-search {
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.filter-group {
  margin-bottom: 12px;
}

.filter-group label {
  display: block;
  margin-bottom: 4px;
  color: #666666;
  font-size: 12px;
}

.filter-select,
.filter-input {
  width: 100%;
  padding: 6px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  color: #333333;
  font-size: 12px;
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.toggle-advanced-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #1890ff;
  cursor: pointer;
  font-size: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  color: #333333;
  font-size: 16px;
  font-weight: 600;
}

.category-tree {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-item:hover {
  border-color: #1890ff;
  background: #f0f8ff;
}

.category-item.active {
  border-color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
}

.category-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.category-name {
  color: #333333;
  font-size: 14px;
  font-weight: 500;
}

.doc-count {
  color: #999999;
  font-size: 12px;
}

.category-actions {
  display: flex;
  gap: 4px;
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

.content-area {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
}

.view-controls,
.sort-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  color: #666666;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
}

.view-btn.active {
  background: #1890ff;
  color: #ffffff;
  border-color: #1890ff;
}

.sort-select {
  padding: 6px 12px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  color: #666666;
  font-size: 12px;
}

.sort-order-btn {
  padding: 6px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  color: #666666;
  cursor: pointer;
}

.documents-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.document-card {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.document-card:hover {
  border-color: #1890ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.doc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.doc-type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.doc-type-badge.manual {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.doc-type-badge.procedure {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.doc-type-badge.case {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.doc-type-badge.standard {
  background: rgba(255, 107, 53, 0.1);
  color: #ff6b35;
}

.doc-actions {
  display: flex;
  gap: 4px;
}

.doc-title {
  margin: 0 0 8px 0;
  color: #333333;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.doc-summary {
  margin: 0 0 12px 0;
  color: #666666;
  font-size: 13px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.doc-meta {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999999;
}

.meta-item i {
  font-size: 11px;
}

.doc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 2px 6px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-size: 11px;
  color: #999999;
}

.documents-list {
  margin-bottom: 20px;
}

.list-header,
.list-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 80px 100px 120px;
  gap: 16px;
  padding: 12px 16px;
  align-items: center;
}

.list-header {
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
  font-weight: 600;
  color: #333333;
  font-size: 13px;
}

.list-item {
  border-bottom: 1px solid #e8e8e8;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.list-item:hover {
  background: #f0f8ff;
}

.doc-title-wrapper h4 {
  margin: 0 0 4px 0;
  color: #333333;
  font-size: 14px;
  font-weight: 500;
}

.doc-title-wrapper p {
  margin: 0;
  color: #999999;
  font-size: 12px;
  line-height: 1.4;
}

.type-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.stars {
  display: flex;
  gap: 2px;
}

.stars i {
  font-size: 10px;
  color: #faad14;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid #e8e8e8;
}

.page-btn {
  padding: 8px 16px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  color: #666666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:not(:disabled):hover {
  border-color: #1890ff;
  background: #f0f8ff;
}

.page-info {
  color: #999999;
  font-size: 14px;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-dialog {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.modal-dialog.small {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h3 {
  margin: 0;
  color: #333333;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #999999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background: #fafafa;
}

.modal-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e8e8e8;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #666666;
  font-size: 14px;
  font-weight: 500;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  color: #333333;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-file {
  width: 100%;
  padding: 8px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  color: #666666;
}

.attachments-list {
  margin-top: 12px;
}

.attachment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  margin-bottom: 8px;
}

.remove-btn {
  background: none;
  border: none;
  color: #ff4d4f;
  cursor: pointer;
  padding: 2px;
}

.upload-area {
  position: relative;
  border: 2px dashed #e8e8e8;
  border-radius: 6px;
  padding: 40px 20px;
  text-align: center;
  background: #fafafa;
  transition: border-color 0.3s ease;
}

.upload-area:hover {
  border-color: #1890ff;
}

.upload-area input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-area i {
  font-size: 24px;
  color: #1890ff;
  margin-bottom: 12px;
}

.upload-area h4 {
  margin: 0 0 8px 0;
  color: #333333;
}

.upload-area p {
  margin: 0;
  color: #999999;
  font-size: 12px;
}

.import-files-list {
  margin-top: 20px;
}

.import-file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  margin-bottom: 8px;
}

.mini-select {
  padding: 4px 8px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  color: #666666;
  font-size: 12px;
}

@media (max-width: 768px) {
  .knowledge-container {
    grid-template-columns: 1fr;
    height: auto;
  }

  .sidebar {
    order: 1;
  }

  .content-area {
    order: 0;
    margin-bottom: 20px;
  }

  .documents-grid {
    grid-template-columns: 1fr;
  }

  .list-header,
  .list-item {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
}
</style>
