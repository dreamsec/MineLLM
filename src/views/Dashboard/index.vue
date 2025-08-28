<template>
      <!-- 主体内容区 -->
    <div class="dashboard-main">
      <!-- 使用router-view显示子路由内容 -->
      <router-view />
    </div>
</template>

<script setup lang="ts">
// Dashboard 主页面 - 用于显示子路由内容
defineOptions({
  name: 'DashboardIndex'
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* .dashboard-container {
  width: 100%;
  height: 100vh;
  background: #001440;
  color: #ffffff;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
} */



/* 主体内容区 */
/* .dashboard-main {
  flex: 1;
  display: flex;
} */
</style>


