import { http, HttpResponse } from 'msw'
import { lag } from '../latency'
import type { Paged, SummaryMetrics, Trade } from '@tradeez/shared'
import { ACCOUNTS, DAILY_STATS, TRADES } from '../data/generate'

/**
 * MSW handlers：在网络层拦截 /api/*。
 * 这里实现真实的筛选与聚合逻辑，让指标口径问题在前端阶段就暴露出来。
 * 后端就绪后关闭 MSW（VITE_USE_MOCK=false），业务代码无需改动。
 */

const API = '/api'

/** 解析全局筛选参数（F-1-05） */
function applyFilters(url: URL, trades: Trade[]) {
  const accounts = url.searchParams.get('accounts')?.split(',').filter(Boolean)
  const range = url.searchParams.get('range') ?? 'all'
  const start = url.searchParams.get('start')
  const end = url.searchParams.get('end')

  let from: string | null = null
  if (range !== 'all' && range !== 'custom') {
    const now = new Date('2026-08-14T23:59:59Z')
    const d = new Date(now)
    if (range === 'today') d.setUTCHours(0, 0, 0, 0)
    else if (range === 'thisWeek') d.setUTCDate(d.getUTCDate() - d.getUTCDay())
    else if (range === 'thisMonth') d.setUTCDate(1)
    else if (range === 'thisQuarter') d.setUTCMonth(Math.floor(d.getUTCMonth() / 3) * 3, 1)
    else if (range === 'thisYear') d.setUTCMonth(0, 1)
    from = d.toISOString().slice(0, 10)
  }

  return trades.filter((t) => {
    if (accounts?.length && !accounts.includes(t.accountId)) return false
    const day = (t.closedAt ?? t.openedAt).slice(0, 10)
    if (from && day < from) return false
    if (range === 'custom') {
      if (start && day < start) return false
      if (end && day > end) return false
    }
    return true
  })
}

function computeSummary(trades: Trade[]): SummaryMetrics {
  const closed = trades.filter((t) => t.status === 'closed')
  const winners = closed.filter((t) => t.result === 'win')
  const losers = closed.filter((t) => t.result === 'loss')
  const breakeven = closed.filter((t) => t.result === 'breakeven')

  const grossWin = winners.reduce((s, t) => s + t.netPnl, 0)
  const grossLoss = Math.abs(losers.reduce((s, t) => s + t.netPnl, 0))
  const avgWin = winners.length ? grossWin / winners.length : 0
  const avgLoss = losers.length ? -grossLoss / losers.length : 0

  // 交易日胜率（F-10-02）：按日净盈亏 > 0 统计
  const byDay = new Map<string, number>()
  for (const t of closed) {
    const d = (t.closedAt ?? t.openedAt).slice(0, 10)
    byDay.set(d, (byDay.get(d) ?? 0) + t.netPnl)
  }
  const dayValues = [...byDay.values()]
  const winDays = dayValues.filter((v) => v > 0).length

  return {
    netPnl: +closed.reduce((s, t) => s + t.netPnl, 0).toFixed(2),
    totalTrades: closed.length,
    tradeWinRate: closed.length ? +((winners.length / closed.length) * 100).toFixed(2) : 0,
    dayWinRate: dayValues.length ? +((winDays / dayValues.length) * 100).toFixed(2) : 0,
    profitFactor: grossLoss ? +(grossWin / grossLoss).toFixed(2) : 0,
    avgWin: +avgWin.toFixed(2),
    avgLoss: +avgLoss.toFixed(2),
    avgWinLossRatio: avgLoss ? +(avgWin / Math.abs(avgLoss)).toFixed(2) : 0,
    winners: winners.length,
    losers: losers.length,
    breakeven: breakeven.length,
  }
}

export const tradingHandlers = [
  http.get(`${API}/accounts`, async () => {
    await lag(120)
    return HttpResponse.json(ACCOUNTS)
  }),

  http.get(`${API}/metrics/summary`, async ({ request }) => {
    await lag(200)
    const filtered = applyFilters(new URL(request.url), TRADES)
    return HttpResponse.json(computeSummary(filtered))
  }),

  http.get(`${API}/daily-stats`, async ({ request }) => {
    await lag(180)
    const url = new URL(request.url)
    const filteredTrades = applyFilters(url, TRADES)
    const dates = new Set(filteredTrades.map((t) => (t.closedAt ?? t.openedAt).slice(0, 10)))
    return HttpResponse.json(DAILY_STATS.filter((d) => dates.has(d.date)))
  }),

  http.get(`${API}/trades`, async ({ request }) => {
    await lag(220)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 50)
    const sortBy = url.searchParams.get('sortBy') ?? 'openedAt'
    const sortDir = url.searchParams.get('sortDir') ?? 'desc'

    const filtered = applyFilters(url, TRADES).sort((a, b) => {
      const av = a[sortBy as keyof Trade] as string | number
      const bv = b[sortBy as keyof Trade] as string | number
      const r = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? r : -r
    })

    const body: Paged<Trade> = {
      items: filtered.slice((page - 1) * pageSize, page * pageSize),
      total: filtered.length,
      page,
      pageSize,
    }
    return HttpResponse.json(body)
  }),

  http.get(`${API}/trades/:id`, async ({ params }) => {
    await lag(150)
    const trade = TRADES.find((t) => t.id === params.id)
    if (!trade) return new HttpResponse('交易不存在', { status: 404 })
    return HttpResponse.json(trade)
  }),
]
