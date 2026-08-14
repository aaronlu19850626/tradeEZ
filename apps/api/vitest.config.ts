import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // 只跑源码里的测试。dist/ 是 nest build 的产物，
    // 不排除的话编译后的测试副本会被重复执行
    include: ['src/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**'],
  },
})
