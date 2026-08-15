import { useState } from 'react'
import { WechatQrModal } from './WechatQrModal'

/** 微信快捷登录入口。F-19-05 */
export function WechatButton({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-line bg-card py-3 text-sm font-medium text-fg-muted transition-colors hover:bg-page"
      >
        <WechatIcon className="size-5" />
        使用微信登录
      </button>

      {open && (
        <WechatQrModal
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false)
            onSuccess()
          }}
        />
      )}
    </>
  )
}

export function WechatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="#07C160" aria-hidden>
      <path d="M8.69 4C4.62 4 1.32 6.72 1.32 10.08c0 1.94 1.1 3.66 2.82 4.78l-.7 2.1 2.45-1.23c.87.24 1.8.37 2.8.37.24 0 .47-.01.7-.03a5.1 5.1 0 0 1-.27-1.63c0-3.1 3.02-5.6 6.74-5.6.25 0 .5.01.74.04C15.98 6.35 12.7 4 8.69 4Zm-2.4 3.35a.93.93 0 1 1 0 1.86.93.93 0 0 1 0-1.86Zm4.8 0a.93.93 0 1 1 0 1.86.93.93 0 0 1 0-1.86Z" />
      <path d="M22.68 15.44c0-2.78-2.72-5.04-6.08-5.04s-6.09 2.26-6.09 5.04c0 2.79 2.73 5.05 6.09 5.05.7 0 1.37-.1 1.99-.28l1.98 1-.56-1.7c1.62-.92 2.67-2.42 2.67-4.07Zm-8.1-1.32a.78.78 0 1 1 0-1.56.78.78 0 0 1 0 1.56Zm4.05 0a.78.78 0 1 1 0-1.56.78.78 0 0 1 0 1.56Z" />
    </svg>
  )
}
