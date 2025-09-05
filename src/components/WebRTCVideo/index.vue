<template>
  <div class="webrtc-video-container">
    <div v-if="isLoading" class="loading-container">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>视频加载中...</span>
    </div>
    <div v-else-if="hasError" class="error-container">
      <el-icon><Warning /></el-icon>
      <span>视频加载失败</span>
    </div>
    <div v-else class="video-placeholder">
      <el-icon size="64"><VideoCamera /></el-icon>
      <p>视频预览功能开发中...</p>
      <p>RTSP地址: {{ rtspUrl }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { VideoCamera, Loading, Warning } from '@element-plus/icons-vue'

interface Props {
  cameraId: number
  rtspUrl: string
  width?: number
  height?: number
  showControls?: boolean
  autoplay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: 800,
  height: 400,
  showControls: true,
  autoplay: true
})

const isLoading = ref(true)
const hasError = ref(false)

onMounted(() => {
  // 模拟视频加载过程
  setTimeout(() => {
    isLoading.value = false
    // 这里可以添加实际的WebRTC视频加载逻辑
  }, 1000)
})
</script>

<style scoped lang="scss">
.webrtc-video-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 8px;
  min-height: 200px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #409eff;
  
  .el-icon {
    font-size: 32px;
  }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #f56c6c;
  
  .el-icon {
    font-size: 32px;
  }
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #909399;
  text-align: center;
  
  .el-icon {
    color: #c0c4cc;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    
    &:first-of-type {
      font-size: 16px;
      font-weight: 500;
      color: #606266;
    }
  }
}
</style>
