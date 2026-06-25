export type KnowledgeSortOrder = 'asc' | 'desc'

export interface KnowledgeSearchFilterState {
  type: string
  startDate: string
  endDate: string
}

export interface KnowledgeSearchDocument {
  title: string
  type: string
  categoryId?: number | string
  summary?: string
  author?: string
  createTime: number
  updateTime?: number
  viewCount?: number
  rating?: number
  tags?: string[]
}

export interface KnowledgeSearchOptions {
  query?: string
  filters?: Partial<KnowledgeSearchFilterState>
  categoryId?: number | string | null
  sortBy?: string
  sortOrder?: KnowledgeSortOrder
}

const normalizeText = (value: unknown) => String(value ?? '').trim().toLowerCase()

const parseDateBoundary = (dateText: string | undefined, mode: 'start' | 'end') => {
  if (!dateText) return null

  const [year, month, day] = dateText.split('-').map(Number)
  if (!year || !month || !day) return null

  // 日期筛选按本地时间整天计算，避免结束日期当天的文档被漏掉。
  const date =
    mode === 'start'
      ? new Date(year, month - 1, day, 0, 0, 0, 0)
      : new Date(year, month - 1, day, 23, 59, 59, 999)

  const timestamp = date.getTime()
  return Number.isNaN(timestamp) ? null : timestamp
}

export const hasKnowledgeClientFilters = (
  query: string,
  filters: Partial<KnowledgeSearchFilterState> = {},
) => {
  return Boolean(
    query.trim() ||
      filters.type ||
      filters.startDate ||
      filters.endDate,
  )
}

const matchesKeyword = (doc: KnowledgeSearchDocument, query: string) => {
  if (!query) return true

  const tags = Array.isArray(doc.tags) ? doc.tags : []
  const searchableText = [
    doc.title,
    doc.summary,
    doc.author,
    ...tags,
  ]

  return searchableText.some((text) => normalizeText(text).includes(query))
}

const compareDocuments = (
  left: KnowledgeSearchDocument,
  right: KnowledgeSearchDocument,
  sortBy: string,
  sortOrder: KnowledgeSortOrder,
) => {
  const leftValue = (left as unknown as Record<string, unknown>)[sortBy]
  const rightValue = (right as unknown as Record<string, unknown>)[sortBy]

  if (leftValue == null && rightValue == null) return 0
  if (leftValue == null) return sortOrder === 'asc' ? -1 : 1
  if (rightValue == null) return sortOrder === 'asc' ? 1 : -1

  const normalizedLeft = typeof leftValue === 'number' ? leftValue : normalizeText(leftValue)
  const normalizedRight = typeof rightValue === 'number' ? rightValue : normalizeText(rightValue)

  if (normalizedLeft === normalizedRight) return 0
  const result = normalizedLeft > normalizedRight ? 1 : -1
  return sortOrder === 'asc' ? result : -result
}

export const filterKnowledgeDocuments = <T extends KnowledgeSearchDocument>(
  documents: readonly T[],
  options: KnowledgeSearchOptions = {},
) => {
  const query = normalizeText(options.query)
  const filters = options.filters || {}
  const startTime = parseDateBoundary(filters.startDate, 'start')
  const endTime = parseDateBoundary(filters.endDate, 'end')
  const categoryId = options.categoryId
  const sortBy = options.sortBy || 'updateTime'
  const sortOrder = options.sortOrder || 'desc'

  return [...documents]
    .filter((doc) => {
      if (categoryId != null && String(doc.categoryId) !== String(categoryId)) return false
      if (!matchesKeyword(doc, query)) return false
      if (filters.type && doc.type !== filters.type) return false
      if (startTime != null && doc.createTime < startTime) return false
      if (endTime != null && doc.createTime > endTime) return false
      return true
    })
    .sort((left, right) => compareDocuments(left, right, sortBy, sortOrder))
}

export const paginateKnowledgeDocuments = <T>(
  documents: readonly T[],
  page: number,
  pageSize: number,
) => {
  const safePage = Math.max(1, page)
  const safePageSize = Math.max(1, pageSize)
  const start = (safePage - 1) * safePageSize
  return documents.slice(start, start + safePageSize)
}
