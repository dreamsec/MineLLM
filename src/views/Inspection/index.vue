<template>
  <div class="inspection-container">
    <!-- 顶部标题栏 -->
    <div class="header">
      <h1>矿用设备虚拟巡检</h1>
      <div class="controls">
        <el-select v-model="selectedScene" placeholder="选择巡检场景" size="small" style="width: 200px">
          <el-option label="矿井设备巡检" value="mineInspection" />
          <el-option label="电梯设备" value="elevator" />
          <el-option label="新电梯系统" value="newElevator" />
        </el-select>
        <el-button type="primary" size="small" @click="reloadUnity">刷新场景</el-button>
      </div>
    </div>

    <!-- Unity 容器 - 使用你提供的结构 -->
    <div class="center-panel">
      <iframe
        :src="`/Inspection/index.html`"
        style="width:100%; height:100%; border:none; background:transparent;"
        allowfullscreen
        @load="handleIframeLoad"
      ></iframe>

      <!-- 加载提示 -->
      <div v-if="loading" class="loading-overlay">
        <el-loading :loading="true" text="正在加载 Unity 场景..." />
      </div>
    </div>

    <!-- 底部控制面板 -->
    <div class="control-panel">
      <div class="panel-section">
        <h3>巡检控制</h3>
        <el-button-group>
          <el-button size="small" @click="toggleFullscreen">全屏巡检</el-button>
          <el-button size="small" @click="resetCamera">重置视角</el-button>
          <el-button size="small" @click="reloadUnity">重新加载</el-button>
        </el-button-group>
      </div>

      <div class="panel-section">
        <h3>巡检信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">当前场景:</span>
            <span class="value">{{ getSceneName(selectedScene) }}</span>
          </div>
          <div class="info-item">
            <span class="label">加载状态:</span>
            <span class="value" :class="{ 'success': !loading, 'warning': loading }">
              {{ loading ? '加载中' : '已就绪' }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">巡检模式:</span>
            <span class="value">虚拟3D巡检</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 场景选择
const selectedScene = ref('mineInspection')
const loading = ref(true)

// 获取场景名称
const getSceneName = (scene: string) => {
  const names: Record<string, string> = {
    mineInspection: '矿井设备巡检',
    elevator: '电梯设备',
    newElevator: '新电梯系统'
  }
  return names[scene] || '未知场景'
}

// 计算 Unity 场景 URL
const unityUrl = computed(() => {
  const basePath = import.meta.env.BASE_URL || '/'
  const urls: Record<string, string> = {
    mineInspection: `${basePath}MineInspection/index.html`,
    elevator: `${basePath}elevator/index.html`,
    newElevator: `${basePath}NewElevator/index.html`
  }
  return urls[selectedScene.value] || `${basePath}MineInspection/index.html`
})

// 刷新 Unity 场景
const reloadUnity = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
}

// 全屏显示
const toggleFullscreen = () => {
  const iframe = document.querySelector('iframe') as HTMLIFrameElement
  if (iframe) {
    if (iframe.requestFullscreen) {
      iframe.requestFullscreen()
    } else if ((iframe as any).webkitRequestFullscreen) {
      (iframe as any).webkitRequestFullscreen()
    } else if ((iframe as any).mozRequestFullScreen) {
      (iframe as any).mozRequestFullScreen()
    }
  }
}

// 重置视角（通过 postMessage 与 Unity 通信）
const resetCamera = () => {
  const iframe = document.querySelector('iframe') as HTMLIFrameElement
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage({ type: 'resetCamera' }, '*')
  }
}

// 监听 iframe 加载完成
const handleIframeLoad = () => {
  loading.value = false
}

onMounted(() => {
  loading.value = true
})
</script>

<style scoped>
.inspection-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #1a1a1a;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #2c2c2c;
  color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.center-panel {
  flex: 1;
  position: relative;
  background-color: #000;
  overflow: hidden;
}

iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
}

.control-panel {
  display: flex;
  gap: 30px;
  padding: 15px 20px;
  background-color: #2c2c2c;
  color: white;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.3);
}

.panel-section {
  flex: 1;
}

.panel-section h3 {
  margin: 0 0 10px 0;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
}

.label {
  color: #aaa;
}

.value {
  color: #fff;
  font-weight: bold;
}

.value.success {
  color: #67c23a;
}

.value.warning {
  color: #e6a23c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .control-panel {
    flex-direction: column;
    gap: 15px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
