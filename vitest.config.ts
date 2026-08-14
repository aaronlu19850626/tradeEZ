import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // MSW handler 用相对路径注册（如 /api/auth/login），需要 location 才能解析，
    // 因此测试跑在 jsdom 下；同时便于后续加组件测试。
    environment: 'jsdom',
    environmentOptions: {
      jsdom: { url: 'http://localhost:5173' },
    },
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
