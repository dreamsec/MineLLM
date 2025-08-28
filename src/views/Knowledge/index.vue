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
    docCount: 45,
    description: '设备操作相关手册',
  },
  {
    id: 2,
    name: '操作规程',
    icon: 'fas fa-file-alt',
    docCount: 32,
    description: '标准操作规程文档',
  },
  {
    id: 3,
    name: '故障案例',
    icon: 'fas fa-exclamation-triangle',
    docCount: 78,
    description: '设备故障处理案例',
  },
  {
    id: 4,
    name: '技术标准',
    icon: 'fas fa-cog',
    docCount: 23,
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
    content: '主提升机操作手册详细内容...',
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
    content: '安全操作规程详细内容...',
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
    content: '轴承故障诊断案例详细内容...',
    author: '王技师',
    createTime: new Date().getTime() - 86400000 * 3,
    updateTime: new Date().getTime() - 86400000 * 1,
    viewCount: 89,
    rating: 4.2,
    tags: ['轴承', '故障', '诊断'],
  },
])

const stats = reactive({
  totalDocs: 178,
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
