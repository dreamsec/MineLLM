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
    <div v-else class="video-wrapper">
      <!-- 使用假视频替代开发中状态 -->
      <video
        :width="width"
        :height="height"
        :controls="showControls"
        autoplay
        muted
        loop
        playsinline
        class="fake-video"
      >
        <source src="/videos/unity1.mp4" type="video/mp4">
        您的浏览器不支持HTML5视频播放
      </video>
      <!-- RTSP地址信息展示 -->
      <div class="rtsp-info" v-if="rtspUrl">
        <strong>RTSP地址:</strong> {{ rtspUrl }}
      </div>
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
  background: #000;
  border-radius: 8px;
  min-height: 200px;
  position: relative;
  overflow: hidden;
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

.video-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.fake-video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

.rtsp-info {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 10;
  max-width: calc(100% - 20px);
  word-break: break-all;
}
</style>
