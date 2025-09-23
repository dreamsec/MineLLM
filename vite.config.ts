import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 添加代理配置，用于访问两个后端
  server: {
    proxy: {
      // 第一个后端服务的代理
      '/api1': {
        target: 'http://localhost:9000', // 第一个后端地址
        changeOrigin: true, // 允许跨域
        rewrite: (path) => path.replace(/^\/api1/, '') // 重写路径
      },
      // 第二个后端服务的代理
      '/api2': {
        target: 'http://localhost:5003', // 第二个后端地址
        changeOrigin: true, // 允许跨域
        rewrite: (path) => path.replace(/^\/api2/, '') // 重写路径
      }
    }
  }
})
