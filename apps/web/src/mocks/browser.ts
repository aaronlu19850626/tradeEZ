import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

/** 在 main.tsx 中于渲染前启动，确保首屏请求也被拦截 */
export async function startMockWorker() {
  await worker.start({
    /**
     * 对 /api 请求必须报警：未命中 handler 会穿透到 Vite proxy，
     * 打到没有后端的 8080 端口并返回 502。用 bypass 会让这个问题静默消失。
     * 非 /api 请求（静态资源、HMR）正常放过。
     */
    onUnhandledRequest(request, print) {
      if (new URL(request.url).pathname.startsWith('/api')) print.warning()
    },
    serviceWorker: { url: '/mockServiceWorker.js' },
  })

  /**
   * 首次注册 Service Worker 时，当前这次页面加载不受其接管，
   * 请求会直接走网络（表现为 502）。此时刷新一次即可生效。
   * 用 sessionStorage 标记确保只刷一次，避免 SW 始终无法接管时无限刷新。
   */
  const RELOAD_FLAG = 'tradeez.msw.reloaded'
  if (!navigator.serviceWorker.controller) {
    if (sessionStorage.getItem(RELOAD_FLAG)) {
      console.error(
        '[TradeEZ] Service Worker 无法接管页面，接口请求将穿透到网络。' +
          '请在开发者工具 Application → Service Workers 中注销后重试。',
      )
      return
    }
    sessionStorage.setItem(RELOAD_FLAG, '1')
    console.warn('[TradeEZ] Service Worker 刚注册，本次加载未被接管，正在刷新…')
    location.reload()
    return
  }
  sessionStorage.removeItem(RELOAD_FLAG)

  console.info(`[TradeEZ] MSW 已就绪，注册 ${handlers.length} 个 handler，接口走模拟数据`)
}
