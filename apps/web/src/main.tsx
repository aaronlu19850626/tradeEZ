import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

/**
 * 是否启用模拟数据。
 *
 * 必须以 import.meta.env.DEV 为前提：.env.development 只在 dev 模式加载，
 * 生产构建里 VITE_USE_MOCK 是 undefined，若只判断 !== 'false' 会让 MSW 在线上启动。
 * 之前正是这个判断导致生产环境白屏。
 */
const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'

function render() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

async function bootstrap() {
  if (useMock) {
    // mock 启动失败不能阻断渲染 —— 否则用户只看到白屏，连报错都看不到
    try {
      const { startMockWorker } = await import('./mocks/browser')
      await startMockWorker()
    } catch (e) {
      console.error('[TradeEZ] MSW 启动失败，接口将直连后端：', e)
    }
  }
  render()
}

bootstrap().catch((e) => {
  // 兜底：任何启动期异常都要留下痕迹，并给出可见提示而非白屏
  console.error('[TradeEZ] 应用启动失败：', e)
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML =
      '<div style="font-family:system-ui;padding:2rem;text-align:center;color:#334155">' +
      '<p style="font-size:15px">页面加载失败</p>' +
      '<p style="font-size:13px;color:#64748b">请刷新重试。若持续失败，请打开浏览器控制台查看错误详情。</p>' +
      '</div>'
  }
})
