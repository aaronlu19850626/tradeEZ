import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { rmSync } from 'node:fs'

/**
 * 生产构建时从产物中剔除 mockServiceWorker.js。
 * 生产环境不启用 MSW，留着这个文件只会让人误以为线上跑的是模拟数据。
 */
function stripMockWorker(): Plugin {
  return {
    name: 'strip-mock-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      for (const key of Object.keys(bundle)) {
        if (key === 'mockServiceWorker.js') delete bundle[key]
      }
    },
    closeBundle() {
      const file = fileURLToPath(new URL('./dist/mockServiceWorker.js', import.meta.url))
      rmSync(file, { force: true })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), stripMockWorker()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // 后端就绪后：关闭 MSW（VITE_USE_MOCK=false），请求由此转发到真实后端
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
