export interface TranscribeResponseLike {
  code?: number
  message?: string
  data?: {
    text?: string | null
  } | null
}

const RECORDER_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/wav',
]

export function getSupportedRecorderMimeType(
  recorderCtor: Pick<typeof MediaRecorder, 'isTypeSupported'> | null | undefined,
) {
  if (!recorderCtor) return ''
  return RECORDER_MIME_TYPES.find((mimeType) => recorderCtor.isTypeSupported(mimeType)) || ''
}

export function extractTranscribeText(response: TranscribeResponseLike) {
  if (response.code !== 1) {
    throw new Error(response.message || '语音转写失败')
  }

  const text = response.data?.text?.trim()
  if (!text) {
    throw new Error('未识别到有效语音')
  }

  return text
}

export function buildVoiceButtonTitle(isRecording: boolean, isTranscribing: boolean) {
  if (isTranscribing) return '正在转写语音...'
  if (isRecording) return '点击停止录音并转写'
  return '点击开始语音输入'
}
