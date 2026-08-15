import { cn } from '@/lib/utils'

/** 品牌标识。字标为固定资产，不随语言切换 */
type Tone = 'light' | 'dark' | 'auto'

/** 图形标记。引用 favicon.svg，避免重复维护同一段路径数据 */
export function LogoMark({ className }: { className?: string }) {
  return <img src="/favicon.svg" alt="" aria-hidden className={cn('shrink-0', className)} />
}

/** trade 的颜色。auto 走 text-fg，随主题在深浅之间切换 */
const TRADE_TONE: Record<Tone, string> = {
  light: 'text-white',
  dark: 'text-slate-900',
  auto: 'text-fg',
}

/** 文字标：trade 实色 + EZ 渐变 */
export function Wordmark({
  tone = 'light',
  className,
}: {
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={cn(
        'font-serif leading-none font-normal tracking-[0.04em] select-none',
        className,
      )}
    >
      <span className={TRADE_TONE[tone]}>trade</span>
      <span className="bg-gradient-to-r from-[#47bfff] via-[#863bff] to-[#c86bff] bg-clip-text text-transparent">
        EZ
      </span>
    </span>
  )
}

/** 图形 + 文字的组合，供顶栏与认证页共用 */
export function Logo({
  tone = 'light',
  size = 'md',
  className,
}: {
  tone?: Tone
  size?: 'md' | 'lg'
  className?: string
}) {
  const lg = size === 'lg'
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark className={lg ? 'h-8 w-8' : 'h-7 w-7'} />
      <Wordmark tone={tone} className={lg ? 'text-[27px]' : 'text-[22px]'} />
    </span>
  )
}