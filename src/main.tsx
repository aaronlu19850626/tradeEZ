import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

/**
 * MSW 必须在渲染前启动，否则首屏请求会漏过拦截。
 * 后端就绪后把 VITE_USE_MOCK 置为 false，请求经 Vite proxy 转发到真实后端。
 */
async function bootstrap() {
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    const { startMockWorker } = await import('./mocks/browser')
    await startMockWorker()
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
