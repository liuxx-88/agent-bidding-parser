import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 开发环境热更新（HMR）
    hmr: {
      overlay: true,
    },
    watch: {
      // 在 Docker / 网络盘等环境下若热更新不生效，可改为 true
      usePolling: false,
    },
  },
})
