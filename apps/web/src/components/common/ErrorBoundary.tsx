import { Component, type ErrorInfo, type ReactNode } from 'react'

/**
 * 顶层错误边界。任何渲染期异常都给出可见提示，
 * 而不是留下一片白屏让人无从下手。
 */
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[TradeEZ] 渲染异常：', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="grid min-h-full place-items-center bg-page p-8">
        <div className="max-w-md rounded-xl border border-line bg-card p-7 text-center">
          <p className="text-base font-semibold text-fg">页面出错了</p>
          <p className="mt-2 text-sm text-fg-subtle">
            刷新通常可以恢复。若持续出现，请把下面的信息反馈给我们。
          </p>
          <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-page p-3 text-left text-xs text-loss">
            {error.message}
          </pre>
          <button
            type="button"
            onClick={() => location.reload()}
            className="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            刷新页面
          </button>
        </div>
      </div>
    )
  }
}
