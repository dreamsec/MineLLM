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
        <div class="sidebar-section compact">
          <h3>设备状态</h3>
          <div class="device-grid compact">
            <div class="device-card compact active">
              <div class="device-icon">🏗️</div>
              <div class="device-info">
                <span class="device-name">提升机</span>
                <span class="device-status">运行中</span>
              </div>
              <div class="status-light green"></div>
            </div>
            <div class="device-card compact active">
              <div class="device-icon">🌪️</div>
              <div class="device-info">
                <span class="device-name">通风机</span>
                <span class="device-status">正常</span>
              </div>
              <div class="status-light green"></div>
            </div>
            <div class="device-card compact warning">
              <div class="device-icon">⚙️</div>
              <div class="device-info">
                <span class="device-name">压风机</span>
                <span class="device-status">高温</span>
              </div>
              <div class="status-light yellow"></div>
            </div>
            <div class="device-card compact active">
              <div class="device-icon">💧</div>
              <div class="device-info">
                <span class="device-name">排水机</span>
                <span class="device-status">正常</span>
              </div>
              <div class="status-light green"></div>
            </div>
          </div>
        </div>

        <div class="sidebar-section compact">
          <h3>环境参数</h3>
          <div class="env-cards compact">
            <div class="env-card compact">
              <div class="env-icon">🌡️</div>
              <div class="env-data">
                <span class="env-value">28.5°C</span>
                <span class="env-label">温度</span>
              </div>
            </div>
            <div class="env-card compact">
              <div class="env-icon">💨</div>
              <div class="env-data">
                <span class="env-value">65%</span>
                <span class="env-label">湿度</span>
              </div>
            </div>
            <div class="env-card compact">
              <div class="env-icon">🌬️</div>
              <div class="env-data">
                <span class="env-value">2.3m/s</span>
                <span class="env-label">风速</span>
              </div>
            </div>
            <div class="env-card compact">
              <div class="env-icon">⚠️</div>
              <div class="env-data">
                <span class="env-value">0.2%</span>
                <span class="env-label">瓦斯</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-section compact stats-section">
          <h3>今日统计</h3>
          <div class="stats-container compact">
            <div class="stat-item compact">
              <div class="stat-icon">📈</div>
              <div class="stat-content">
                <span class="stat-number">156</span>
                <span class="stat-label">提升次数</span>
              </div>
            </div>
            <div class="stat-item compact">
              <div class="stat-icon">⏱️</div>
              <div class="stat-content">
                <span class="stat-number">18.5h</span>
                <span class="stat-label">运行时长</span>
              </div>
            </div>
            <div class="stat-item compact">
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
        <div class="viewport-header compact">
          <h2>3D可视化监控中心</h2>
          <div class="viewport-controls">
            <button class="control-btn compact">
              <span class="icon">🔍</span>
              全屏
            </button>
            <button class="control-btn compact">
              <span class="icon">🔄</span>
              重置视角
            </button>
            <button class="control-btn compact">
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
        <div class="sidebar-section compact">
          <h3>实时告警</h3>
          <div class="alerts-container compact">
            <div class="alert-item compact warning">
              <div class="alert-time">14:32</div>
              <div class="alert-message">
                <span class="alert-title">压风机温度异常</span>
                <span class="alert-desc">温度达到85°C，建议检查</span>
              </div>
              <div class="alert-priority high"></div>
            </div>
            <div class="alert-item compact info">
              <div class="alert-time">13:15</div>
              <div class="alert-message">
                <span class="alert-title">系统自检完成</span>
                <span class="alert-desc">所有设备状态正常</span>
              </div>
              <div class="alert-priority low"></div>
            </div>
            <div class="alert-item compact success">
              <div class="alert-time">12:00</div>
              <div class="alert-message">
                <span class="alert-title">日常维护完成</span>
                <span class="alert-desc">例行检查已结束</span>
              </div>
              <div class="alert-priority low"></div>
            </div>
          </div>
        </div>

        <div class="sidebar-section compact">
          <h3>效率分析</h3>
          <div class="efficiency-circles compact">
            <div class="efficiency-circle compact">
              <svg class="circle-chart compact" viewBox="0 0 36 36">
                <path class="circle-bg" d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path class="circle" stroke-dasharray="94, 100" d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <text class="percentage compact" x="18" y="20.35">94%</text>
              </svg>
              <span>整体效率</span>
            </div>
            <div class="efficiency-circle compact">
              <svg class="circle-chart compact" viewBox="0 0 36 36">
                <path class="circle-bg" d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path class="circle" stroke-dasharray="88, 100" d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <text class="percentage compact" x="18" y="20.35">88%</text>
              </svg>
              <span>提升系统</span>
            </div>
          </div>
        </div>

        <div class="sidebar-section compact">
          <h3>快捷操作</h3>
          <div class="quick-actions compact">
            <button class="action-btn compact emergency">
              <span class="icon">🚨</span>
              紧急停止
            </button>
            <button class="action-btn compact primary">
              <span class="icon">📊</span>
              生成报表
            </button>
            <button class="action-btn compact">
              <span class="icon">🔔</span>
              设置提醒
            </button>
          </div>
        </div>
      </aside>
    </main>

    <!-- 底部快捷按钮栏 -->
    <footer class="bottom-toolbar compact">
      <div class="toolbar-section compact">
        <button class="toolbar-btn compact primary">
          <span class="icon">▶️</span>
          启动系统
        </button>
        <button class="toolbar-btn compact">
          <span class="icon">⏸️</span>
          暂停监控
        </button>
        <button class="toolbar-btn compact">
          <span class="icon">🔄</span>
          重置数据
        </button>
      </div>
      <div class="toolbar-section compact">
        <button class="toolbar-btn compact">
          <span class="icon">📥</span>
          导出数据
        </button>
        <button class="toolbar-btn compact">
          <span class="icon">⚙️</span>
          系统设置
        </button>
        <button class="toolbar-btn compact">
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
  overflow: hidden;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 25px;
  background: linear-gradient(90deg, #1a1f3a 0%, #0f1419 100%);
  border-bottom: 1px solid #2a2f4a;
  height: 60px;
}

.logo-section h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(45deg, #00d4ff, #0099ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 11px;
  color: #8892b0;
  margin-left: 8px;
}

.status-indicators {
  display: flex;
  align-items: center;
  gap: 15px;
}

.indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
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
  font-size: 15px;
  color: #00d4ff;
}

.dashboard-content {
  flex: 1;
  display: flex;
  gap: 15px;
  padding: 15px;
  overflow: hidden;
  min-height: 0;
}

.left-sidebar,
.right-sidebar {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.sidebar-section {
  background: rgba(26, 31, 58, 0.6);
  border: 1px solid #2a2f4a;
  border-radius: 8px;
  padding: 15px;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.sidebar-section:last-child {
  flex-shrink: 1;
  min-height: fit-content;
}

.sidebar-section.compact {
  padding: 12px;
}

.sidebar-section h3 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #00d4ff;
  border-bottom: 1px solid #2a2f4a;
  padding-bottom: 8px;
}

.device-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.device-grid.compact {
  gap: 6px;
}

.device-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border-left: 3px solid #00d4ff;
}

.device-card.compact {
  padding: 8px;
  gap: 8px;
}

.device-card.active {
  border-left-color: #4caf50;
}

.device-card.warning {
  border-left-color: #ff9800;
}

.device-icon {
  font-size: 20px;
}

.device-info {
  flex: 1;
}

.device-name {
  display: block;
  font-weight: 600;
  color: #ffffff;
  font-size: 13px;
}

.device-status {
  font-size: 11px;
  color: #8892b0;
}

.status-light {
  width: 10px;
  height: 10px;
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
  gap: 8px;
}

.env-cards.compact {
  gap: 6px;
}

.env-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.env-card.compact {
  padding: 6px;
}

.env-icon {
  font-size: 16px;
}

.env-data {
  display: flex;
  flex-direction: column;
}

.env-value {
  font-size: 14px;
  font-weight: 700;
  color: #00d4ff;
}

.env-label {
  font-size: 10px;
  color: #8892b0;
}

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stats-container.compact {
  gap: 4px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.stat-item.compact {
  padding: 5px;
  gap: 6px;
}

.stat-icon {
  font-size: 18px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 14px;
  font-weight: 700;
  color: #00d4ff;
}

.stat-label {
  font-size: 9px;
  color: #8892b0;
}

.center-viewport {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(26, 31, 58, 0.6);
  border: 1px solid #2a2f4a;
  border-radius: 8px;
  overflow: hidden;
}

.viewport-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid #2a2f4a;
}

.viewport-header.compact {
  padding: 12px;
}

.viewport-header h2 {
  margin: 0;
  font-size: 16px;
  color: #00d4ff;
}

.viewport-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #2a2f4a;
  border-radius: 4px;
  color: #ffffff;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn.compact {
  padding: 4px 8px;
  font-size: 10px;
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

.alerts-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alerts-container.compact {
  gap: 6px;
}

.alert-item {
  display: flex;
  gap: 8px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border-left: 3px solid;
}

.alert-item.compact {
  padding: 6px;
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
  font-size: 11px;
  color: #8892b0;
  min-width: 35px;
}

.alert-message {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.alert-title {
  font-weight: 600;
  color: #ffffff;
  font-size: 12px;
}

.alert-desc {
  font-size: 10px;
  color: #8892b0;
}

.alert-priority {
  width: 6px;
  height: 6px;
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
  gap: 15px;
}

.efficiency-circles.compact {
  gap: 10px;
}

.efficiency-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.efficiency-circle span {
  font-size: 11px;
}

.circle-chart {
  width: 70px;
  height: 70px;
}

.circle-chart.compact {
  width: 60px;
  height: 60px;
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

.percentage {
  fill: #00d4ff;
  font-size: 9px;
  font-weight: 700;
  text-anchor: middle;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-actions.compact {
  gap: 6px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #2a2f4a;
  border-radius: 6px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
}

.action-btn.compact {
  padding: 8px;
  font-size: 11px;
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
  padding: 12px 25px;
  background: rgba(26, 31, 58, 0.8);
  border-top: 1px solid #2a2f4a;
  height: 50px;
}

.toolbar-section {
  display: flex;
  gap: 12px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 6px;
  color: #ffffff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toolbar-btn.compact {
  padding: 6px 12px;
  font-size: 11px;
}

.toolbar-btn:hover {
  background: rgba(0, 212, 255, 0.2);
  transform: translateY(-1px);
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
