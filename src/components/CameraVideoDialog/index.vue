<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="50vw"
    append-to-body
    destroy-on-close
    draggable
    class="camera-video-dialog"
    @closed="resetStream"
  >
    <div class="camera-video-body">
      <div v-if="loading" class="camera-video-state">
        <el-icon class="is-loading" size="32"><Loading /></el-icon>
        <span>正在获取摄像头实时流...</span>
      </div>

      <div v-else-if="errorMessage" class="camera-video-state error">
        <el-icon size="36"><Warning /></el-icon>
        <span>{{ errorMessage }}</span>
      </div>

      <WebRTCVideo
        v-else-if="streamUrl && currentCameraId"
        :camera-id="currentCameraId"
        :model-name="modelName"
        :rtsp-url="streamUrl"
        width="100%"
        height="100%"
        :autoplay="true"
      />
    </div>

    <template #footer>
      <div class="camera-video-footer">
        <span class="camera-video-id">摄像头 ID：{{ currentCameraId ?? '--' }}</span>
        <el-button type="primary" @click="dialogVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Loading, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import WebRTCVideo from '@/components/WebRTCVideo/index.vue'
import { getCameraStreamApi } from '@/api/camera'

const props = withDefaults(defineProps<{
  modelValue: boolean
  cameraId: number | null
  modelName?: string
  title?: string
}>(), {
  modelName: 'none',
  title: ''
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const streamUrl = ref('')
const loading = ref(false)
const errorMessage = ref('')
let requestVersion = 0

const currentCameraId = computed(() => props.cameraId)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const dialogTitle = computed(() => {
  if (props.title) return props.title
  return currentCameraId.value ? `摄像头 #${currentCameraId.value} - 实时视频` : '摄像头实时视频'
})

function resetStream() {
  // 弹窗关闭后清空地址，避免下次打开时先闪一下旧视频。
  requestVersion += 1
  streamUrl.value = ''
  loading.value = false
  errorMessage.value = ''
}

async function loadStreamUrl() {
  const cameraId = currentCameraId.value
  const currentRequest = ++requestVersion

  streamUrl.value = ''
  errorMessage.value = ''

  if (!cameraId) {
    errorMessage.value = '未选择摄像头'
    return
  }

  loading.value = true
  try {
    // 根据摄像头 id 向后端换取可播放的实时流地址。
    const res = await getCameraStreamApi(cameraId)
    const data = (res as any).data || {}
    const playUrl = data.play_url || data.url || data.stream_url || ''

    if (currentRequest !== requestVersion) return

    if (!playUrl) {
      errorMessage.value = '后端未返回摄像头播放地址'
      return
    }

    streamUrl.value = playUrl
  } catch (error) {
    if (currentRequest !== requestVersion) return
    console.error('获取摄像头实时流失败:', error)
    errorMessage.value = '获取摄像头实时流失败'
    ElMessage.error('获取摄像头实时流失败')
  } finally {
    if (currentRequest === requestVersion) {
      loading.value = false
    }
  }
}

watch([() => props.modelValue, () => props.cameraId], ([visible]) => {
  if (visible) {
    loadStreamUrl()
  } else {
    resetStream()
  }
}, { immediate: true })
</script>

<style scoped lang="scss">
.camera-video-body {
  width: 100%;
  height: min(66vh, 720px);
  min-height: 420px;
  background: #000;
  overflow: hidden;
}

.camera-video-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #dcdfe6;
  font-size: 14px;

  &.error {
    color: #f56c6c;
  }
}

.camera-video-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.camera-video-id {
  color: #606266;
  font-size: 13px;
}
</style>
