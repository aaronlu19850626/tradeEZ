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
   * Service Worker 首次注册时不接管当前这次页面加载，请求会直接走网络（表现为 502）。
   *
   * 这里等待接管完成而不是刷新页面：之前用「刷新 + sessionStorage 标记」的做法有个坑 ——
   * 标记一旦留下，后续 SW 未接管时会直接跳过启动，MSW 静默失效，
   * 症状就是登录一直 502 且看不出原因。
   */
  if (!navigator.serviceWorker.controller) {
    await new Promise<void>((resolve) => {
      // controllerchange 在 SW 取得控制权时触发
      navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
        once: true,
      })
      // 兜底：2 秒内没等到就继续，至少让页面渲染出来而不是白屏
      setTimeout(resolve, 2000)
    })
  }

  if (!navigator.serviceWorker.controller) {
    console.error(
      '[TradeEZ] Service Worker 未能接管页面，接口请求会穿透到网络（502）。' +
        '请在开发者工具 Application → Service Workers 中注销后刷新。',
    )
    return
  }

  console.info(`[TradeEZ] MSW 已就绪，注册 ${handlers.length} 个 handler，接口走模拟数据`)
}
