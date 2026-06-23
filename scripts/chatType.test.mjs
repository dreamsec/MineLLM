import assert from 'node:assert/strict'

const {
  DEFAULT_CHAT_TYPE,
  CHAT_TYPE_OPTIONS,
  normalizeChatType,
  shouldRestoreChatTypeFromSession,
} = await import('../src/utils/chatType.ts')

assert.equal(DEFAULT_CHAT_TYPE, 'expert')
assert.deepEqual(
  CHAT_TYPE_OPTIONS.map((option) => option.value),
  ['expert', 'normal'],
)
assert.equal(normalizeChatType('expert'), 'expert')
assert.equal(normalizeChatType('normal'), 'normal')
assert.equal(normalizeChatType(undefined), 'expert')
assert.equal(normalizeChatType(null), 'expert')
assert.equal(normalizeChatType('unknown'), 'expert')
assert.equal(shouldRestoreChatTypeFromSession('session-load'), true)
assert.equal(shouldRestoreChatTypeFromSession('list-refresh'), false)

console.log('chatType tests passed')
