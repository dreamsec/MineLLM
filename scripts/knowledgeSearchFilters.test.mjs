import assert from 'node:assert/strict'

const {
  filterKnowledgeDocuments,
  hasKnowledgeClientFilters,
  paginateKnowledgeDocuments,
} = await import('../src/views/Knowledge/knowledgeSearchFilters.ts')

const documents = [
  {
    id: 1,
    title: '压风机操作手册',
    type: 'manual',
    categoryId: 10,
    summary: '包含日常巡检要求',
    author: '张工',
    createTime: new Date('2026-06-01T08:00:00+08:00').getTime(),
    updateTime: new Date('2026-06-02T08:00:00+08:00').getTime(),
    viewCount: 3,
    rating: 0,
    tags: ['压风机'],
  },
  {
    id: 2,
    title: '提升机故障案例',
    type: 'case',
    categoryId: 11,
    summary: '制动异常处理记录',
    author: '李工',
    createTime: new Date('2026-06-20T09:00:00+08:00').getTime(),
    updateTime: new Date('2026-06-21T09:00:00+08:00').getTime(),
    viewCount: 8,
    rating: 0,
    tags: ['提升机'],
  },
  {
    id: 3,
    title: '压风机技术标准',
    type: 'standard',
    categoryId: 12,
    summary: '安全阈值说明',
    author: '王工',
    createTime: new Date('2026-07-03T10:00:00+08:00').getTime(),
    updateTime: new Date('2026-07-04T10:00:00+08:00').getTime(),
    viewCount: 1,
    rating: 0,
    tags: ['标准'],
  },
]

assert.equal(hasKnowledgeClientFilters('', { type: '', startDate: '', endDate: '' }), false)
assert.equal(hasKnowledgeClientFilters('压风机', { type: '', startDate: '', endDate: '' }), true)
assert.equal(hasKnowledgeClientFilters('', { type: 'case', startDate: '', endDate: '' }), true)
assert.equal(hasKnowledgeClientFilters('', { type: '', startDate: '2026-06-01', endDate: '' }), true)

const dateFiltered = filterKnowledgeDocuments(documents, {
  filters: {
    type: '',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
  },
})
assert.deepEqual(dateFiltered.map((doc) => doc.id), [2, 1])

const advancedFiltered = filterKnowledgeDocuments(documents, {
  query: '压风机',
  filters: {
    type: 'manual',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
  },
})
assert.deepEqual(advancedFiltered.map((doc) => doc.id), [1])

const paged = paginateKnowledgeDocuments(dateFiltered, 2, 1)
assert.deepEqual(paged.map((doc) => doc.id), [1])

console.log('knowledgeSearchFilters tests passed')
