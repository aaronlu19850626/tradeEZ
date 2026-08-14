import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

/** 在 main.tsx 中于渲染前启动，确保首屏请求也被拦截 */
export async function startMockWorker() {
  await worker.start({
    // 未被 handler 覆盖的请求直接放过，不打印警告
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: '/mockServiceWorker.js' },
  })
  console.info('[TradeEZ] MSW 已启动，接口走模拟数据')
}
