import assert from 'node:assert/strict'

const { buildHistoryMessages } = await import('../src/utils/aiHistoryMessages.ts')

const messages = buildHistoryMessages([
  {
    id: 42,
    session_id: 'abc-123',
    role: 'user',
    content: 'PS001 最近24小时电流怎么样？',
    tool_calls: null,
    tool_call_id: null,
    tool_data: null,
    created_at: '2026-06-15T10:30:00',
  },
  {
    id: 43,
    session_id: 'abc-123',
    role: 'assistant',
    content: null,
    tool_calls: [
      {
        id: 'call_chart',
        function: {
          name: 'generate_chart',
          arguments: '{"equipment_code":"PS001"}',
        },
      },
    ],
    tool_call_id: null,
    tool_data: null,
    created_at: '2026-06-15T10:30:05',
  },
  {
    id: 44,
    session_id: 'abc-123',
    role: 'tool',
    content: '{"success":true,"content":"图表生成完成","data":{"record_count":100}}',
    tool_calls: null,
    tool_call_id: 'call_chart',
    tool_data: '{"echarts_option":{"series":[{"name":"温度_1","data":[1,2]}]}}',
    created_at: '2026-06-15T10:30:06',
  },
  {
    id: 45,
    session_id: 'abc-123',
    role: 'assistant',
    content: '这是最终分析结论。',
    tool_calls: null,
    tool_call_id: null,
    tool_data: null,
    created_at: '2026-06-15T10:30:07',
  },
])

assert.equal(messages.length, 2)
assert.equal(messages[0].type, 'user')
assert.equal(messages[1].type, 'assistant')

const parts = messages[1].parts
assert.equal(parts.length, 2)
assert.equal(parts[0].type, 'tool')
assert.equal(parts[0].tool_call_id, 'call_chart')
assert.equal(parts[0].toolName, 'generate_chart')
assert.equal(parts[0].toolStatus, 'success')
assert.equal(parts[0].toolResult.content, '图表生成完成')
assert.equal(parts[0].toolResult.data.record_count, 100)
assert.deepEqual(parts[0].toolResult.data.echarts_option.series[0].data, [1, 2])
assert.equal(parts[1].type, 'response')
assert.equal(parts[1].content, '这是最终分析结论。')

const outOfOrderMessages = buildHistoryMessages([
  {
    id: 100,
    session_id: 'abc-456',
    role: 'user',
    content: 'TS001 最近运行数据',
    tool_calls: null,
    tool_call_id: null,
    tool_data: null,
    created_at: '2026-06-16T09:00:00',
  },
  {
    id: 102,
    session_id: 'abc-456',
    role: 'tool',
    content: '{"success":true,"content":"查询完成","data":{"record_count":12,"records":[{"stator_current":1}]}}',
    tool_calls: null,
    tool_call_id: 'call_query',
    tool_data: null,
    created_at: '2026-06-16T09:00:02',
  },
  {
    id: 101,
    session_id: 'abc-456',
    role: 'assistant',
    content: null,
    tool_calls: [
      {
        id: 'call_query',
        function: {
          name: 'query_equipment_data',
          arguments: '{"equipment_code":"TS001"}',
        },
      },
    ],
    tool_call_id: null,
    tool_data: null,
    created_at: '2026-06-16T09:00:01',
  },
  {
    id: 103,
    session_id: 'abc-456',
    role: 'assistant',
    content: '这是最终回答',
    tool_calls: null,
    tool_call_id: null,
    tool_data: null,
    created_at: '2026-06-16T09:00:03',
  },
])

const outOfOrderParts = outOfOrderMessages[1].parts
assert.equal(outOfOrderParts.length, 2)
assert.equal(outOfOrderParts[0].type, 'tool')
assert.equal(outOfOrderParts[0].toolName, 'query_equipment_data')
assert.equal(outOfOrderParts[0].toolStatus, 'success')
assert.equal(outOfOrderParts[0].toolResult.content, '查询完成')
assert.equal(outOfOrderParts[0].toolResult.data.record_count, 12)
assert.equal(outOfOrderParts[1].type, 'response')

console.log('aiHistoryMessages tests passed')
