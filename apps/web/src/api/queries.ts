import { useQuery } from '@tanstack/react-query'
import { api } from './client'
import { filtersToQuery, useFilterStore } from '@/stores/filter-store'
import type { Account, SummaryMetrics } from '@tradeez/shared'

/** 查询键集中管理，避免各处硬编码字符串 */
export const qk = {
  accounts: ['accounts'] as const,
  summary: (q: Record<string, string>) => ['summary', q] as const,
}

export function useAccounts() {
  return useQuery({
    queryKey: qk.accounts,
    queryFn: () => api.get<Account[]>('/accounts'),
  })
}

/** 骨架阶段的样例查询：验证 MSW 拦截与 Query 缓存链路是否通 */
export function useSummary() {
  const filters = useFilterStore()
  const q = filtersToQuery(filters)
  return useQuery({
    queryKey: qk.summary(q),
    queryFn: () => api.get<SummaryMetrics>('/metrics/summary', q),
  })
}
