<template>
  <div class="mining-dashboard">
    <!-- 顶部状态栏 -->
    <header class="top-bar">
      <div class="logo-section">
        <h1>智慧矿山监控系统</h1>
        <span class="subtitle">Real-time Mining Monitoring</span>
      </div>
      <div class="status-indicators">
        <div class="indicator">
          <span class="dot online"></span>
          <span>系统在线</span>
        </div>
        <div class="time-display">{{ currentTime }}</div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="dashboard-content">
      <!-- 左侧控制面板 -->
      <aside class="left-sidebar">
        <div class="sidebar-section">
          <h3>设备状态</h3>
          <div class="device-grid">
            <div class="device-card active">
              <div class="device-icon">🏗️</div>
              <div class="device-info">
                <span class="device-name">提升机</span>
                <span class="device-status">运行中</span>
              </div>
              <div class="status-light green"></div>
            </div>
            <div class="device-card active">
              <div class="device-icon">🌪️</div>
              <div class="device-info">
                <span class="device-name">通风机</span>
                <span class="device-status">正常</span>
              </div>
              <div class="status-light green"></div>
            </div>
            <div class="device-card warning">
              <div class="device-icon">⚙️</div>
              <div class="device-info">
                <span class="device-name">压风机</span>
                <span class="device-status">高温</span>
              </div>
              <div class="status-light yellow"></div>
            </div>
            <div class="device-card active">
              <div class="device-icon">💧</div>
              <div class="device-info">
                <span class="device-name">排水机</span>
                <span class="device-status">正常</span>
              </div>
              <div class="status-light green"></div>
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <h3>环境参数</h3>
          <div class="env-cards">
            <div class="env-card">
              <div class="env-icon">🌡️</div>
              <div class="env-data">
                <span class="env-value">28.5°C</span>
                <span class="env-label">温度</span>
              </div>
            </div>
            <div class="env-card">
              <div class="env-icon">💨</div>
              <div class="env-data">
                <span class="env-value">65%</span>
                <span class="env-label">湿度</span>
              </div>
            </div>
            <div class="env-card">
              <div class="env-icon">🌬️</div>
              <div class="env-data">
                <span class="env-value">2.3m/s</span>
                <span class="env-label">风速</span>
              </div>
            </div>
            <div class="env-card">
              <div class="env-icon">⚠️</div>
              <div class="env-data">
                <span class="env-value">0.2%</span>
                <span class="env-label">瓦斯</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <h3>今日统计</h3>
          <div class="stats-container">
            <div class="stat-item">
              <div class="stat-icon">📈</div>
              <div class="stat-content">
                <span class="stat-number">156</span>
                <span class="stat-label">提升次数</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">⏱️</div>
              <div class="stat-content">
                <span class="stat-number">18.5h</span>
                <span class="stat-label">运行时长</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <span class="stat-number">0</span>
                <span class="stat-label">故障次数</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 中间Unity3D区域 -->
      <section class="center-viewport">
        <div class="viewport-header">
          <h2>3D可视化监控中心</h2>
          <div class="viewport-controls">
            <button class="control-btn">
              <span class="icon">🔍</span>
              全屏
            </button>
            <button class="control-btn">
              <span class="icon">🔄</span>
              重置视角
            </button>
            <button class="control-btn">
              <span class="icon">📷</span>
              截图
            </button>
          </div>
        </div>

        <div class="unity-container">
          <video
            class="unity-video"
            controls
            autoplay
            muted
            loop
            style="width: 100%; height: 100%; object-fit: contain; background: #000;"
          >
            <source src="/videos/unity1.mp4" type="video/mp4">
            您的浏览器不支持视频播放。
          </video>
        </div>
      </section>

      <!-- 右侧信息面板 -->
      <aside class="right-sidebar">
        <div class="sidebar-section">
          <h3>实时告警</h3>
          <div class="alerts-container">
            <div class="alert-item warning">
              <div class="alert-time">14:32</div>
              <div class="alert-message">
                <span class="alert-title">压风机温度异常</span>
                <span class="alert-desc">温度达到85°C，建议检查</span>
              </div>
              <div class="alert-priority high"></div>
            </div>
            <div class="alert-item info">
              <div class="alert-time">13:15</div>
              <div class="alert-message">
                <span class="alert-title">系统自检完成</span>
                <span class="alert-desc">所有设备状态正常</span>
              </div>
              <div class="alert-priority low"></div>
            </div>
            <div class="alert-item success">
              <div class="alert-time">12:00</div>
              <div class="alert-message">
                <span class="alert-title">日常维护完成</span>
                <span class="alert-desc">例行检查已结束</span>
              </div>
              <div class="alert-priority low"></div>
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <h3>效率分析</h3>
          <div class="efficiency-circles">
            <div class="efficiency-circle">
              <svg class="circle-chart" viewBox="0 0 36 36">
                <path class="circle-bg" d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path class="circle" stroke-dasharray="94, 100" d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <text class="percentage" x="18" y="20.35">94%</text>
              </svg>
              <span>整体效率</span>
            </div>
            <div class="efficiency-circle">
              <svg class="circle-chart" viewBox="0 0 36 36">
                <path class="circle-bg" d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path class="circle" stroke-dasharray="88, 100" d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <text class="percentage" x="18" y="20.35">88%</text>
              </svg>
              <span>提升系统</span>
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <h3>快捷操作</h3>
          <div class="quick-actions">
            <button class="action-btn emergency">
              <span class="icon">🚨</span>
              紧急停止
            </button>
            <button class="action-btn primary">
              <span class="icon">📊</span>
              生成报表
            </button>
            <button class="action-btn">
              <span class="icon">🔔</span>
              设置提醒
            </button>
          </div>
        </div>
      </aside>
    </main>

    <!-- 底部快捷按钮栏 -->
    <footer class="bottom-toolbar">
      <div class="toolbar-section">
        <button class="toolbar-btn primary">
          <span class="icon">▶️</span>
          启动系统
        </button>
        <button class="toolbar-btn">
          <span class="icon">⏸️</span>
          暂停监控
        </button>
        <button class="toolbar-btn">
          <span class="icon">🔄</span>
          重置数据
        </button>
      </div>
      <div class="toolbar-section">
        <button class="toolbar-btn">
          <span class="icon">📥</span>
          导出数据
        </button>
        <button class="toolbar-btn">
          <span class="icon">⚙️</span>
          系统设置
        </button>
        <button class="toolbar-btn">
          <span class="icon">❓</span>
          帮助
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const currentTime = ref(new Date().toLocaleTimeString())

let timer: NodeJS.Timeout
onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.mining-dashboard {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0a0e1a;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: linear-gradient(90deg, #1a1f3a 0%, #0f1419 100%);
  border-bottom: 1px solid #2a2f4a;
}

.logo-section h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(45deg, #00d4ff, #0099ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 12px;
  color: #8892b0;
  margin-left: 10px;
}

.status-indicators {
  display: flex;
  align-items: center;
  gap: 20px;
}

.indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.online {
  background: #4caf50;
  box-shadow: 0 0 10px #4caf50;
}

.time-display {
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #00d4ff;
}

.dashboard-content {
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 20px;
  overflow: hidden;
}

.left-sidebar,
.right-sidebar {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.sidebar-section {
  background: rgba(26, 31, 58, 0.6);
  border: 1px solid #2a2f4a;
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.sidebar-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #00d4ff;
  border-bottom: 1px solid #2a2f4a;
  padding-bottom: 10px;
}

.device-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.device-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 3px solid #00d4ff;
}

.device-card.active {
  border-left-color: #4caf50;
}

.device-card.warning {
  border-left-color: #ff9800;
}

.device-icon {
  font-size: 24px;
}

.device-info {
  flex: 1;
}

.device-name {
  display: block;
  font-weight: 600;
  color: #ffffff;
}

.device-status {
  font-size: 12px;
  color: #8892b0;
}

.status-light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-light.green {
  background: #4caf50;
  box-shadow: 0 0 8px #4caf50;
}

.status-light.yellow {
  background: #ff9800;
  box-shadow: 0 0 8px #ff9800;
}

.env-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.env-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.env-icon {
  font-size: 20px;
}

.env-data {
  display: flex;
  flex-direction: column;
}

.env-value {
  font-size: 18px;
  font-weight: 700;
  color: #00d4ff;
}

.env-label {
  font-size: 12px;
  color: #8892b0;
}

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.stat-icon {
  font-size: 24px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: #00d4ff;
}

.stat-label {
  font-size: 12px;
  color: #8892b0;
}

.center-viewport {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(26, 31, 58, 0.6);
  border: 1px solid #2a2f4a;
  border-radius: 12px;
  overflow: hidden;
}

.viewport-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid #2a2f4a;
}

.viewport-header h2 {
  margin: 0;
  font-size: 18px;
  color: #00d4ff;
}

.viewport-controls {
  display: flex;
  gap: 10px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #2a2f4a;
  border-radius: 6px;
  color: #ffffff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: #00d4ff;
}

.unity-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, rgba(0, 212, 255, 0.1) 0%, transparent 70%);
}

.unity-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.unity-placeholder {
  text-align: center;
  color: #8892b0;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.unity-logo {
  font-size: 64px;
  opacity: 0.5;
}

.placeholder-content h3 {
  margin: 0;
  font-size: 24px;
  color: #ffffff;
}

.loading-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 212, 255, 0.3);
  border-top: 3px solid #00d4ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.alerts-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alert-item {
  display: flex;
  gap: 12px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 3px solid;
}

.alert-item.warning {
  border-left-color: #ff9800;
}

.alert-item.info {
  border-left-color: #2196f3;
}

.alert-item.success {
  border-left-color: #4caf50;
}

.alert-time {
  font-size: 12px;
  color: #8892b0;
  min-width: 40px;
}

.alert-message {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.alert-title {
  font-weight: 600;
  color: #ffffff;
}

.alert-desc {
  font-size: 12px;
  color: #8892b0;
}

.alert-priority {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  align-self: center;
}

.alert-priority.high {
  background: #f44336;
}

.alert-priority.low {
  background: #4caf50;
}

.efficiency-circles {
  display: flex;
  justify-content: space-around;
  gap: 20px;
}

.efficiency-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.circle-chart {
  width: 80px;
  height: 80px;
}

.circle-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 2;
}

.circle {
  fill: none;
  stroke: #00d4ff;
  stroke-width: 2;
  stroke-linecap: round;
  animation: progress 1s ease-out forwards;
}

@keyframes progress {
  0% {
    stroke-dasharray: 0 100;
  }
}

.percentage {
  fill: #00d4ff;
  font-size: 10px;
  font-weight: 700;
  text-anchor: middle;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #2a2f4a;
  border-radius: 8px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: #00d4ff;
}

.action-btn.emergency {
  background: rgba(244, 67, 54, 0.2);
  border-color: #f44336;
}

.action-btn.emergency:hover {
  background: rgba(244, 67, 54, 0.3);
}

.action-btn.primary {
  background: rgba(33, 150, 243, 0.2);
  border-color: #2196f3;
}

.bottom-toolbar {
  display: flex;
  justify-content: space-between;
  padding: 20px 30px;
  background: rgba(26, 31, 58, 0.8);
  border-top: 1px solid #2a2f4a;
}

.toolbar-section {
  display: flex;
  gap: 15px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toolbar-btn:hover {
  background: rgba(0, 212, 255, 0.2);
  transform: translateY(-2px);
}

.toolbar-btn.primary {
  background: rgba(0, 212, 255, 0.3);
}

@media (max-width: 1400px) {
  .left-sidebar,
  .right-sidebar {
    width: 280px;
  }
}

@media (max-width: 1024px) {
  .dashboard-content {
    flex-direction: column;
  }

  .left-sidebar,
  .right-sidebar {
    width: 100%;
  }
}
</style>
