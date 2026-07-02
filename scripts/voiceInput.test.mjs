import assert from 'node:assert/strict'

const {
  buildVoiceButtonTitle,
  extractTranscribeText,
  getSupportedRecorderMimeType,
} = await import('../src/utils/voiceInput.ts')

assert.equal(
  extractTranscribeText({ code: 1, message: 'success', data: { text: '分析通风机一号报警' } }),
  '分析通风机一号报警',
)

assert.throws(
  () => extractTranscribeText({ code: 0, message: '未识别到有效语音', data: null }),
  /未识别到有效语音/,
)

assert.throws(
  () => extractTranscribeText({ code: 1, message: 'success', data: { text: '   ' } }),
  /未识别到有效语音/,
)

const fakeMediaRecorder = {
  isTypeSupported: (mimeType) => mimeType === 'audio/webm;codecs=opus',
}

assert.equal(
  getSupportedRecorderMimeType(fakeMediaRecorder),
  'audio/webm;codecs=opus',
)

assert.equal(getSupportedRecorderMimeType(null), '')
assert.equal(buildVoiceButtonTitle(false, false), '点击开始语音输入')
assert.equal(buildVoiceButtonTitle(true, false), '点击停止录音并转写')
assert.equal(buildVoiceButtonTitle(false, true), '正在转写语音...')

console.log('voiceInput tests passed')
