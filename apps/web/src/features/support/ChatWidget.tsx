import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Headset, Loader2, MessageCircle, Send, X } from 'lucide-react'
import { useEscalate, useSendMessage, useStartChat } from '@/api/support'
import { cn } from '@/lib/utils'
import type { ChatSession } from '@tradeez/shared'

/**
 * 在线询问挂件。F-19-07
 * 对齐截图：右下角圆形入口，展开为聊天面板；AI 先答，答不了给「转接人工」。
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [session, setSession] = useState<ChatSession | null>(null)
  const start = useStartChat()
  const send = useSendMessage(session?.id)
  const escalate = useEscalate(session?.id)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 首次展开时开启会话
  useEffect(() => {
    if (!open || session || start.isPending) return
    start.mutateAsync().then(setSession).catch(() => {})
  }, [open, session, start])

  // 新消息滚到底
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [session?.messages.length, send.isPending])

  async function onSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.elements.namedItem('content') as HTMLTextAreaElement
    const content = input.value.trim()
    if (!content || !session || send.isPending) return
    input.value = ''
    const next = await send.mutateAsync(content).catch(() => null)
    if (next) setSession(next)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="在线询问"
        className="fixed right-6 bottom-6 z-40 grid size-12 place-items-center rounded-full bg-brand-500 text-white shadow-lg transition-transform hover:scale-105 hover:bg-brand-600"
      >
        <MessageCircle className="size-5" />
      </button>
    )
  }

  return (
    <div className="fixed right-6 bottom-6 z-40 flex h-[32rem] w-[22rem] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
      {/* 头部 */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-3">
        <span className="grid size-8 place-items-center rounded-full bg-brand-100 text-brand-600">
          <Headset className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">TradeEZ 支持</p>
          <p className="text-[11px] text-slate-500">
            {session?.escalated ? '已转人工客服' : '通常几分钟内回复'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="收起"
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <ChevronDown className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setSession(null)
          }}
          aria-label="结束会话"
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* 消息区 */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 scrollbar-thin">
        <p className="text-center text-xs text-slate-400">有任何问题都可以问我们，或者留下反馈。</p>

        {start.isPending && (
          <div className="grid place-items-center py-6">
            <Loader2 className="size-5 animate-spin text-slate-300" />
          </div>
        )}

        {session?.messages.map((m) => (
          <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className="max-w-[85%]">
              <div
                className={cn(
                  'rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap',
                  m.role === 'user'
                    ? 'rounded-br-sm bg-brand-500 text-white'
                    : 'rounded-bl-sm bg-slate-100 text-slate-700',
                )}
              >
                {m.content}
              </div>
              {m.authorLabel && (
                <p className="mt-1 text-[10px] text-slate-400">{m.authorLabel}</p>
              )}
            </div>
          </div>
        ))}

        {send.isPending && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-slate-100 px-3.5 py-3">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="size-1.5 animate-bounce rounded-full bg-slate-400"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* AI 答不上来时提供转人工，已接入人工后不再显示 */}
        {session?.escalated && !session.messages.some((m) => m.role === 'agent') && (
          <button
            type="button"
            onClick={() => escalate.mutateAsync().then(setSession).catch(() => {})}
            disabled={escalate.isPending}
            className="mx-auto flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100 disabled:opacity-60"
          >
            {escalate.isPending ? <Loader2 className="size-3 animate-spin" /> : <Headset className="size-3" />}
            转接人工客服
          </button>
        )}
      </div>

      {/* 输入区 */}
      <form onSubmit={onSend} className="border-t border-slate-100 p-3">
        <div className="flex items-end gap-2 rounded-lg border border-slate-200 px-3 py-2 focus-within:border-brand-400">
          <textarea
            name="content"
            rows={1}
            placeholder="输入你的问题…"
            disabled={!session}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                e.currentTarget.form?.requestSubmit()
              }
            }}
            className="max-h-24 flex-1 resize-none bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!session || send.isPending}
            aria-label="发送"
            className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
          >
            <Send className="size-3.5" />
          </button>
        </div>
      </form>
    </div>
  )
}
