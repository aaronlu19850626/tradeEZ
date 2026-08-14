import { useSummary } from '@/api/queries'
import { formatMoney, formatPercent, pnlColor } from '@/lib/utils'

/**
 * 骨架自检面板（仅开发期使用，页面填充后删除）。
 * 验证链路：组件 → Query → fetch('/api/...') → MSW 拦截 → seeded 数据 → 聚合计算。
 */
export function MockHealthCheck() {
  const { data, isLoading, error } = useSummary()

  return (
    <div className="px-6 pb-10">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="size-2 rounded-full bg-profit" />
          <h2 className="text-sm font-semibold text-slate-800">骨架自检</h2>
          <span className="text-xs text-slate-400">
            链路：TanStack Query → fetch(/api/metrics/summary) → MSW → 模拟数据
          </span>
        </div>

        {isLoading && <p className="text-sm text-slate-500">加载中…</p>}
        {error && <p className="text-sm text-loss">请求失败：{String(error)}</p>}

        {data && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <Metric label="净盈亏" value={formatMoney(data.netPnl)} color={pnlColor(data.netPnl)} />
              <Metric label="交易笔数" value={String(data.totalTrades)} />
              <Metric label="交易胜率" value={formatPercent(data.tradeWinRate)} />
              <Metric label="交易日胜率" value={formatPercent(data.dayWinRate)} />
              <Metric label="盈亏比" value={data.profitFactor.toFixed(2)} />
              <Metric label="平均盈亏比" value={data.avgWinLossRatio.toFixed(2)} />
            </div>
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
              盈 {data.winners} / 平 {data.breakeven} / 亏 {data.losers}｜平均盈利{' '}
              {formatMoney(data.avgWin)}｜平均亏损 {formatMoney(data.avgLoss)}
              　切换上方筛选器可观察数据联动。
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function Metric({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-0.5 text-lg font-semibold ${color ?? 'text-slate-900'}`}>{value}</p>
    </div>
  )
}
