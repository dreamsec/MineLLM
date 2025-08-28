<template>
  <div class="system-management">
    <!-- 子路由内容区域 -->
    <router-view />

    <!-- 如果没有子路由，显示默认内容 -->
    <div v-if="$route.name === 'System'" class="page-placeholder">
      <div class="placeholder-content">
        <h2>系统管理</h2>
        <p>用户权限管理、系统配置、日志审计等管理功能</p>
        <div class="placeholder-features">
          <div class="feature-item">用户权限管理</div>
          <div class="feature-item">系统配置管理</div>
          <div class="feature-item">日志审计功能</div>
          <div class="feature-item">数据备份恢复</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 系统管理主页
</script>

<style scoped>
.system-management {
  height: 100%;
}

.page-placeholder {
  padding: 40px;
  text-align: center;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content h2 {
  color: var(--primary-color);
  margin-bottom: 16px;
  font-size: 24px;
}

.placeholder-content p {
  color: var(--text-tertiary);
  margin-bottom: 32px;
  font-size: 16px;
}

.placeholder-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-width: 400px;
}

.feature-item {
  padding: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);

  color: var(--text-secondary);
  font-size: 14px;
}
</style>
