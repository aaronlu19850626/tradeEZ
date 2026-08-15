import { useEffect, useRef } from 'react'
import { CheckCircle2, Loader2, RefreshCw, ScanLine, X } from 'lucide-react'
import { useWechatExchange, useWechatQrStatus, useWechatQrTicket } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { QrPlaceholder } from './QrPlaceholder'

/**
 * 微信扫码弹窗。F-19-05
 * 状态流转：pending（待扫码）→ scanned（已扫码待确认）→ confirmed（换取会话）
 * 另有 expired（过期，可刷新）与 canceled（手机端取消）两个终态。
 */
export function WechatQrModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const ticketQuery = useWechatQrTicket(true)
  const ticket = ticketQuery.data?.ticket
  const statusQuery = useWechatQrStatus(ticket)
  const exchange = useWechatExchange()
  const status = statusQuery.data?.status ?? 'pending'

  // confirmed 只换一次会话，避免轮询残留触发重复请求
  const exchanged = useRef(false)
  useEffect(() => {
    const code = statusQuery.data?.authCode
    if (status !== 'confirmed' || !code || exchanged.current) return
    exchanged.current = true
    exchange.mutateAsync(code).then(onSuccess).catch(() => {
      // 失败时允许重试
      exchanged.current = false
    })
  }, [status, statusQuery.data?.authCode, exchange, onSuccess])

  // Esc 关闭
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function refresh() {
    exchanged.current = false
    void ticketQuery.refetch()
  }

  const loading = ticketQuery.isLoading || ticketQuery.isFetching

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="微信扫码登录"
        className="relative w-full max-w-sm rounded-xl bg-card p-7 shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭"
          className="absolute top-4 right-4 rounded-md p-1 text-fg-subtle hover:bg-raised hover:text-fg-muted"
        >
          <X className="size-4" />
        </button>

        <h2 className="mb-1 text-center text-base font-semibold text-fg">
          微信扫码登录
        </h2>
        <p className="mb-5 text-center text-xs text-fg-subtle">
          请使用微信扫描二维码，并在手机上确认
        </p>

        <div className="relative mx-auto grid size-48 place-items-center rounded-lg border border-line bg-card">
          {loading ? (
            <Loader2 className="size-6 animate-spin text-slate-300" />
          ) : (
            <QrPlaceholder payload={ticketQuery.data?.qrPayload ?? ''} />
          )}

          {/* 状态遮罩 */}
          {status === 'scanned' && (
            <Overlay
              icon={<ScanLine className="size-7 text-white" />}
              text="扫码成功"
              hint="请在手机上点击确认"
            />
          )}
          {status === 'confirmed' && (
            <Overlay
              icon={<CheckCircle2 className="size-7 text-white" />}
              text="已确认"
              hint="正在登录…"
            />
          )}
          {(status === 'expired' || status === 'canceled') && (
            <Overlay
              text={status === 'expired' ? '二维码已过期' : '已取消登录'}
              hint="点击下方按钮重新获取"
            />
          )}
        </div>

        <div className="mt-5 text-center">
          {status === 'pending' && (
            <p className="flex items-center justify-center gap-1.5 text-sm text-fg-subtle">
              <Loader2 className="size-3.5 animate-spin" />
              等待扫码…
            </p>
          )}
          {status === 'scanned' && (
            <p className="text-sm text-fg-muted">
              {statusQuery.data?.nickname} 已扫码，请在手机上确认
            </p>
          )}
          {status === 'confirmed' && (
            <p className="text-sm text-profit">
              {exchange.isError ? '登录失败，请重试' : '登录中…'}
            </p>
          )}
          {(status === 'expired' || status === 'canceled') && (
            <Button variant="outline" onClick={refresh} className="mx-auto">
              <RefreshCw className="size-4" />
              刷新二维码
            </Button>
          )}
        </div>

        {exchange.error && (
          <p role="alert" className="mt-3 rounded-lg bg-loss-soft px-3 py-2 text-center text-xs text-loss">
            {exchange.error.message}
          </p>
        )}
      </div>
    </div>
  )
}

function Overlay({
  icon,
  text,
  hint,
}: {
  icon?: React.ReactNode
  text: string
  hint: string
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-lg bg-slate-900/80 px-4 text-center">
      {icon}
      <p className="text-sm font-medium text-white">{text}</p>
      <p className="text-[11px] text-white/70">{hint}</p>
    </div>
  )
}
