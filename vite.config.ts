import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyPort = env.PROXY_PORT || '3001'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // 开发环境热更新（HMR）
      hmr: {
        overlay: true,
      },
      watch: {
        usePolling: false,
      },
      // 浏览器 /api -> 本地 Node 代理 -> 192.168.3.153:3000
      proxy: {
        '/api': {
          target: `http://localhost:${proxyPort}`,
          changeOrigin: true,
        },
      },
    },
  }
})
