import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type { ChatSession } from '@tradeez/shared'

/** 在线询问接口。F-19-07 */

const KEY = ['support-chat']

export function useStartChat() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<ChatSession>('/support/chat'),
    onSuccess: (s) => qc.setQueryData(KEY, s),
  })
}

export function useSendMessage(sessionId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) =>
      api.post<ChatSession>(`/support/chat/${sessionId}/messages`, { content }),
    onSuccess: (s) => qc.setQueryData(KEY, s),
  })
}

export function useEscalate(sessionId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<ChatSession>(`/support/chat/${sessionId}/escalate`),
    onSuccess: (s) => qc.setQueryData(KEY, s),
  })
}
