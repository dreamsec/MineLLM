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
              <span class="emoji-icon">＋</span>
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
                <span class="emoji-icon">{{ getCategoryEmoji(category.name) }}</span>
                <span class="category-name">{{ category.name }}</span>
                <span class="doc-count">({{ category.docCount }})</span>
              </div>

              <div class="category-actions">
                <button class="action-btn tiny" @click.stop="deleteCategory(category.id)">
                  <span class="emoji-icon">🗑️</span>
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
          <div class="progress-bars" v-if="isUploading || isDownloading">
            <div v-if="isUploading" class="progress-item">
              <div class="progress-track"><div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div></div>
              <span>上传 {{ uploadProgress }}%</span>
            </div>
            <div v-if="isDownloading" class="progress-item">
              <div class="progress-track"><div class="progress-fill" :style="{ width: downloadProgress + '%' }"></div></div>
              <span>下载 {{ downloadProgress }}%</span>
            </div>
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
              <button class="action-btn tiny" @click.stop="editDocument(doc)" title="编辑">🛠️</button>
              <button class="action-btn tiny" @click.stop="previewDocument(doc)" title="预览">👁️</button>
              <button class="action-btn tiny" @click.stop="downloadDocument(doc)" title="下载">⬇️</button>
              <button class="action-btn tiny" @click.stop="deleteDocument(doc.id)" title="删除">🗑️</button>
            </div>
          </div>

              <div class="doc-content">
                <h4 class="doc-title">{{ doc.title }}</h4>
                <p class="doc-summary">{{ doc.summary }}</p>

                <div class="doc-meta">
                  <div class="meta-item">
                    <span class="emoji-icon">👤</span>
                    <span>{{ doc.author }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="emoji-icon">⏰</span>
                    <span>{{ formatDate(doc.updateTime) }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="emoji-icon">👁️</span>
                    <span>{{ doc.viewCount }}</span>
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
              <div class="col-actions">
                <div class="actions-grid">
                  <button class="action-btn small edit" @click.stop="editDocument(doc)">🛠️ 编辑</button>
                  <button class="action-btn small preview" @click.stop="previewDocument(doc)">👁️ 预览</button>
                  <button class="action-btn small download" @click.stop="downloadDocument(doc)">⬇️ 下载</button>
                  <button class="action-btn small delete" @click.stop="deleteDocument(doc.id)">🗑️ 删除</button>
                </div>
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
            <i class="fas fa-times"></i><span>×</span>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveDocument">
            <!-- <div class="form-group">
              <label>文件名 *</label>
              <input v-model="documentForm.filename" type="text" required class="form-input" placeholder="例如：操作手册.pdf" />
            </div> -->

            <div class="form-group">
              <label>文件所属分类 *</label>
              <select v-model="documentForm.categoryId" required class="form-select">
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div class="form-group" v-if="showAddDialog">
              <label>上传作者 *</label>
              <input v-model="documentForm.author" type="text" required class="form-input" placeholder="例如：张工程师" />
            </div>

            <div class="form-group">
              <label>文件摘要 *</label>
              <textarea v-model="documentForm.abstract" rows="4" required class="form-textarea" placeholder="简要说明文件内容"></textarea>
            </div>

            <div class="form-group" v-if="showAddDialog">
              <label>文件 *</label>
              <input type="file" @change="handleFileUpload" required class="form-file" />
              <div v-if="documentForm.file" class="attachments-list">
                <div class="attachment-item">
                  <span>{{ documentForm.file?.name }}</span>
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
          <h3>新增分类</h3>
          <button class="close-btn" @click="closeCategoryDialog">
            <i class="fas fa-times"></i><span>×</span>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveCategory">
            <div class="form-group">
              <label>分类类型 *</label>
              <select v-model="categoryForm.selectedType" required class="form-select">
                <option v-for="opt in categoryTypeOptions" :key="opt.label" :value="opt.label">
                  {{ opt.emoji }} {{ opt.label }}
                </option>
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
          <button type="button" @click="closeCategoryDialog" class="action-btn secondary">
            取消
          </button>
          <button @click="saveCategory" class="action-btn primary">保存</button>
        </div>
      </div>
    </div>

    <!-- 导入对话框 -->
    <div v-if="showImportDialog" class="modal-overlay" @click="closeImportDialog">
      <div class="modal-dialog" @click.stop>
        <div class="modal-header">
          <h3>批量导入文档</h3>
          <button class="close-btn" @click="showImportDialog = false">
            <i class="fas fa-times"></i><span>×</span>
          </button>
        </div>

        <div class="modal-body">
          <div class="import-section">
            <div class="upload-area" @drop="handleDrop" @dragover.prevent @dragenter.prevent>
              <i class="fas fa-upload"></i>
              <h4>拖拽文件到这里，或点击选择文件</h4>
              <p>支持 Word, Excel, PPT, PDF, WPS, TXT 文档及常见图片格式</p>
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
          <button type="button" @click="closeImportDialog" class="action-btn secondary">
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

    <!-- 预览对话框 -->
    <div v-if="showPreviewModal" class="modal-overlay" @click="closePreview">
      <div class="modal-dialog large" @click.stop>
        <div class="modal-header">
          <h3>预览</h3>
          <button class="close-btn" @click="closePreview">
            <i class="fas fa-times"></i><span>×</span>
          </button>
        </div>
        <div class="modal-body">
          <iframe v-if="previewUrl" :src="previewUrl" class="preview-frame"></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
// 引入知识库 API（统一通过 @/api/knowledgebase）
// 使用这些 API 来替换原来的模拟数据，加载真实后端数据
import {
  getKbContentTypesApi,
  listKbFilesApi,
  getKbInformationApi,
  uploadKbFileApi,
  updateKbFileApi,
  deleteKbFileApi,
  createKbContentTypeApi,
  deleteKbContentTypeApi,
  downloadKbFileApi
} from '@/api/knowledgebase'

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
  mimeType?: string
}

interface ImportFile {
  file: File
  name: string
  category: number | string
}

interface DocumentForm {
  id: number | null
  filename: string
  categoryId: string | number
  author: string
  abstract: string
  file: File | null
}

interface CategoryForm {
  id: number | null
  selectedType: string
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
  filename: '',
  categoryId: '',
  author: '',
  abstract: '',
  file: null,
})

const categoryForm = reactive<CategoryForm>({
  id: null,
  selectedType: '',
  description: '',
})

const categoryTypeOptions = [
  { label: '操作手册', emoji: '📘' },
  { label: '操作规程', emoji: '📄' },
  { label: '故障案例', emoji: '🛠️' },
  { label: '技术标准', emoji: '📐' },
  { label: '其他', emoji: '📁' }
]

const searchFilters = reactive<SearchFilters>({
  type: '',
  startDate: '',
  endDate: '',
})

// 导入相关
const importFiles = ref<ImportFile[]>([])
// 移除编辑分类模式，后端未提供编辑接口，仅保留新增与删除

// 分类与文档改为通过后端 API 加载
// categories：来自 /content_type 列表
const categories = ref<Category[]>([])

// documents：来自 /list 文件列表，按 content_type_name 与分页筛选
const documents = ref<Document[]>([])

// 统计信息来自 /information
const stats = reactive({
  totalDocs: 0,
  todayAdded: 0,
  weeklyViews: 0,
  avgRating: 0,
})

// 记录后端分页总数，配合 UI 分页显示
const totalRecords = ref<number>(0)

// content_type 映射表（id -> name）用于类型显示
const contentTypeMap = ref<Record<number, string>>({})

// 进度与预览
const isUploading = ref(false)
const uploadProgress = ref(0)
const isDownloading = ref(false)
const downloadProgress = ref(0)
const showPreviewModal = ref(false)
const previewUrl = ref<string | null>(null)

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

const totalDocs = computed(() => totalRecords.value)
const totalPages = computed(() => Math.ceil(totalRecords.value / pageSize.value))

// 方法
const handleSearch = () => {
  currentPage.value = 1
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

const selectCategory = (category: Category) => {
  // 切换选中分类并重置页码，同时触发真实数据加载
  selectedCategory.value = selectedCategory.value?.id === category.id ? null : category
  currentPage.value = 1
  fetchDocuments()
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
  documentForm.id = doc.id
  documentForm.filename = doc.title
  documentForm.categoryId = doc.
  documentForm.author = doc.author
  documentForm.abstract = doc.summary
  documentForm.file = null
  showEditDialog.value = true
}

  const deleteDocument = async (docId: number) => {
    // 删除文档改为真实调用后端 API
    if (confirm('确定要删除这个文档吗？')) {
      try {
        const res = await deleteKbFileApi(docId)
        if ((res as any).code === 1) {
          await fetchDocuments()
          await fetchCategories()
        } else {
          alert('删除文档失败: ' + ((res as any).message || '未知错误，可能是文件已在后端被删除'))
          // 即便失败也尝试刷新一下，以防状态不一致
          await fetchDocuments()
        }
      } catch (e) {
        console.error('删除文档异常:', e)
        alert('删除操作异常')
      }
    }
  }

// 已移除编辑分类功能

const deleteCategory = async (categoryId: number) => {
  // 根据 id 找到名称，后端删除接口以 name 删除
  const cat = categories.value.find(c => c.id === categoryId)
  if (!cat) return
  if (confirm('确定要删除这个分类[' + cat.name + ']吗？确保分类下没有文档。')) {
    try {
      const res = await deleteKbContentTypeApi(cat.name)
      if ((res as any).code === 1) {
        await fetchCategories()
        await fetchDocuments()
      } else {
        alert('删除分类失败: ' + ((res as any).message || '请确保分类下没有文档'))
      }
    } catch (e) {
      console.error('删除分类异常:', e)
      alert('删除分类请求异常')
    }
  }
}

const saveDocument = async () => {
  const cat = categories.value.find(c => String(c.id) === String(documentForm.categoryId))
  const contentTypeName = cat?.name || ''
  const stripExtension = (name: string) => (name || '').replace(/\.[^.\s]+$/, '')
  if (showEditDialog.value) {
    const res = await updateKbFileApi(documentForm.id as number, {
      filename: stripExtension(documentForm.filename || ''),
      content_type_id: Number(documentForm.categoryId),
      filepath: null,
      abstract: documentForm.abstract
    } as any)
    if (res) {
      closeDialogs()
      console.log('更新文档:', res)
      resetDocumentForm()
      await fetchDocuments()
      await fetchCategories()
    }
  } else {
    const file = documentForm.file
    if (!file) {
      alert('请先选择文件')
      return
    }
    isUploading.value = true
    uploadProgress.value = 0
    const res = await uploadKbFileApi({
      filename: stripExtension(documentForm.filename || file.name),
      content_type_name: contentTypeName,
      author: documentForm.author,
      abstract: documentForm.abstract
    }, file, (e) => {
      if (e.total) {
        uploadProgress.value = Math.round((e.loaded / e.total) * 100)
      }
    })
    if ((res as any).code === 1) {
      closeDialogs()
      resetDocumentForm()
      await fetchDocuments()
    }
    isUploading.value = false
    uploadProgress.value = 0
  }
}

const saveCategory = async () => {
  const nameToCreate = categoryForm.selectedType
  const res = await createKbContentTypeApi(nameToCreate)
  if ((res as any).code === 1) {
    showCategoryDialog.value = false
    resetCategoryForm()
    await fetchCategories()
  }
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const f = target.files?.[0] || null
  documentForm.file = f
  if (f) documentForm.filename = (f.name || '').replace(/\.[^.\s]+$/, '')
}

const removeAttachment = (index: number) => {
  documentForm.file = null
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

const executeImport = async () => {
  // 执行批量导入：逐个文件调用上传 API
  isUploading.value = true
  uploadProgress.value = 0
  for (let i = 0; i < importFiles.value.length; i++) {
    const item = importFiles.value[i]
    const cat = categories.value.find(c => String(c.id) === String(item.category))
    const contentTypeName = cat?.name || ''
    const res = await uploadKbFileApi({
      filename: (item.file.name || '').replace(/\.[^.\s]+$/, ''),
      content_type_name: contentTypeName,
      author: '当前用户',
      abstract: '批量导入'
    }, item.file, (e) => {
      if (e.total) {
        const single = Math.round((e.loaded / e.total) * 100)
        uploadProgress.value = Math.round(((i + single / 100) / importFiles.value.length) * 100)
      }
    })
  }
  showImportDialog.value = false
  importFiles.value = []
  await fetchDocuments()
  isUploading.value = false
  uploadProgress.value = 0
}

// 关闭导入对话框并清空已选择的导入文件
const closeImportDialog = () => {
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
    filename: '',
    categoryId: '',
    author: '',
    abstract: '',
    file: null,
  })
}

const resetCategoryForm = () => {
  Object.assign(categoryForm, {
    id: null,
    selectedType: '',
    description: '',
  })
  // 无编辑分类模式
}

const closeCategoryDialog = () => {
  showCategoryDialog.value = false
  resetCategoryForm()
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

// 分类图标的 Emoji 回退，避免外部图标库未加载导致看不到图标
const getCategoryEmoji = (name: string) => {
  const n = (name || '').toLowerCase()
  if (n.includes('手册') || n.includes('manual')) return '📘'
  if (n.includes('规程') || n.includes('procedure')) return '📄'
  if (n.includes('案例') || n.includes('case')) return '🛠️'
  if (n.includes('标准') || n.includes('standard')) return '📐'
  return '📁'
}

// 加载分类列表（后端：GET /content_type）
const fetchCategories = async () => {
  const res = await getKbContentTypesApi()
  if ((res as any).code === 1) {
    const list = (res as any).data || []
    categories.value = list.map((ct: any) => ({
      id: ct.id,
      name: ct.name,
      icon: 'fas fa-folder',
      docCount: Number(ct.fileCnt) || 0,
      description: '',
      meta: ct
    }))
    // 构建 id->name 映射
    contentTypeMap.value = {}
    for (const ct of list) {
      contentTypeMap.value[ct.id] = ct.name
    }
  }
}

// 加载文件列表（后端：GET /list，支持 content_type_name + 分页）
const fetchDocuments = async () => {
  const params: any = {
    page: currentPage.value,
    page_size: pageSize.value
  }
  if (selectedCategory.value) {
    params.content_type_name = selectedCategory.value.name
  }
  const res = await listKbFilesApi(params)
  if ((res as any).code === 1) {
    const pageData = (res as any).data
    totalRecords.value = pageData.total || 0
    // 将后端 FileLibraryResponseModel 映射为前端 Document
  documents.value = (pageData.list || []).map((f: any) => ({
      id: f.id,
      title: f.filename + f.suffix,
      type: mapContentTypeToDocType(contentTypeMap.value[f.content_type_id]),
      categoryId: f.content_type_id,
      summary: f.abstract || '',
      content: '',
      author: f.author,
      createTime: new Date(f.create_time).getTime(),
      updateTime: new Date(f.update_time).getTime(),
      viewCount: f.cnt,
      rating: 0,
      tags: [],
      mimeType: f.mime_type
    }))
  }
}

// 加载统计信息（后端：GET /information）
const fetchStats = async () => {
  const res = await getKbInformationApi()
  if ((res as any).code === 1) {
    const info = (res as any).data
    stats.totalDocs = info.FileCnt || 0
    stats.todayAdded = info.today_cnt || 0
    stats.weeklyViews = info.read_cnt || 0
  }
}

// 将内容类型名称映射到前端展示的 type（用于徽标与筛选），简单规则可按名称关键字匹配
const mapContentTypeToDocType = (name?: string): Document['type'] => {
  const n = (name || '').toLowerCase()
  if (n.includes('手册') || n.includes('manual')) return 'manual'
  if (n.includes('规程') || n.includes('procedure')) return 'procedure'
  if (n.includes('案例') || n.includes('case')) return 'case'
  if (n.includes('标准') || n.includes('standard')) return 'standard'
  return 'manual'
}

// 生命周期：进入页面时加载分类、列表与统计
onMounted(async () => {
  await fetchCategories()
  await fetchDocuments()
  await fetchStats()
})

// 翻页时重新加载
watch([currentPage, pageSize], async () => {
  await fetchDocuments()
})

// 预览与下载
const previewDocument = async (doc: Document) => {
  isDownloading.value = true
  downloadProgress.value = 0
  try {
    const blob = await downloadKbFileApi(doc.id, (e) => {
      if (e.total) {
        downloadProgress.value = Math.round((e.loaded / e.total) * 100)
      }
    })
    const url = URL.createObjectURL(blob)
    const w = window.open('', '_blank')
    if (w) {
      const title = doc.title || '预览'
      const mime = doc.mimeType || 'application/octet-stream'
      const isImage = !!mime && mime.startsWith('image/')
      const isPdf = mime === 'application/pdf'
      const isText = !!mime && mime.startsWith('text/')
      const container = isImage
        ? `<img src="${url}" style="max-width:100%;height:auto;display:block;margin:0 auto;" />`
        : `<iframe src="${url}" style="width:100%;height:100%;border:none;"></iframe>`
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
        <style>html,body{height:100%;margin:0;padding:0;background:#f5f5f5;} .topbar{padding:10px 16px;background:#fff;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;font-family:system-ui,-apple-system,Segoe UI,Roboto} .content{height:calc(100% - 48px);} .btn{padding:6px 12px;border:1px solid #1890ff;background:#1890ff;color:#fff;border-radius:4px;text-decoration:none}</style>
      </head><body>
        <div class="topbar"><div>${title}</div><div><a class="btn" href="${url}" download="${title}">下载</a></div></div>
        <div class="content">${container}</div>
      </body></html>`
      w.document.write(html)
      w.document.close()
      // 在父窗口挂载关闭事件，避免在 SFC 中写入 <script> 标签导致解析错误
      try {
        w.addEventListener('beforeunload', () => { try { URL.revokeObjectURL(url) } catch (e) {} })
      } catch (e) { /* noop */ }
    } else {
      const a = document.createElement('a')
      a.href = url
      a.download = doc.title
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  } finally {
    isDownloading.value = false
    downloadProgress.value = 0
  }
}



const downloadDocument = async (doc: Document) => {
  isDownloading.value = true
  downloadProgress.value = 0
  try {
    const blob = await downloadKbFileApi(doc.id, (e) => {
      if (e.total) {
        downloadProgress.value = Math.round((e.loaded / e.total) * 100)
      }
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = doc.title
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } finally {
    isDownloading.value = false
    downloadProgress.value = 0
  }
}

const closePreview = () => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
  showPreviewModal.value = false
}
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

.emoji-icon {
  display: inline-block;
  width: 20px;
  text-align: center;
  margin-right: 8px;
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
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.document-card:hover {
  border-color: #1890ff;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.18);
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
  border: 1px solid transparent;
}

.doc-type-badge.manual {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
  border-color: #91caff;
}

.doc-type-badge.procedure {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  border-color: #b7eb8f;
}

.doc-type-badge.case {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
  border-color: #ffd591;
}

.doc-type-badge.standard {
  background: rgba(255, 107, 53, 0.1);
  color: #ff6b35;
  border-color: #ffd0c2;
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
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
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
  grid-template-columns: 2fr 1fr 1fr 1fr 80px 160px;
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
  border: 1px solid transparent;
}

/* 类型徽章配色与美化 */
.type-badge.manual { background: #e6f4ff; color: #1677ff; border-color: #91caff; }
.type-badge.procedure { background: #fffbe6; color: #faad14; border-color: #ffe58f; }
.type-badge.case { background: #fff1f0; color: #f5222d; border-color: #ffccc7; }
.type-badge.standard { background: rgba(255, 107, 53, 0.1); color: #ff6b35; border-color: #ffd0c2; }
.type-badge:hover { filter: brightness(0.98); }

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

/* 列表视图操作按钮两行栅格布局 */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: 32px;
  gap: 8px;
}
.actions-grid .action-btn {
  width: 100%;
  justify-content: center;
  font-size: 12px;
  padding: 6px 10px;
}
.action-btn.edit { background: #e6f4ff; border: 1px solid #91caff; color: #1677ff; }
.action-btn.preview { background: #f6ffed; border: 1px solid #b7eb8f; color: #52c41a; }
.action-btn.download { background: #fff7e6; border: 1px solid #ffd591; color: #fa8c16; }
.action-btn.delete { background: #fff1f0; border: 1px solid #ffccc7; color: #f5222d; }
.action-btn.edit:hover { background: #d0e9ff; }
.action-btn.preview:hover { background: #eaffea; }
.action-btn.download:hover { background: #ffefd6; }
.action-btn.delete:hover { background: #ffeceb; }

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

.close-btn span {
  display: inline-block;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  margin-left: 4px;
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
