import { cn } from '@/lib/utils'
import type { Locale } from '@/i18n/locales'

/**
 * 国旗图标。内联 SVG 而非 emoji 或 CDN 图片：
 * emoji 国旗在 Windows 上不渲染，CDN 图片在断网/内网环境会变成空白。
 */
export function FlagIcon({ locale, className }: { locale: Locale; className?: string }) {
  return (
    <span
      className={cn(
        'inline-block h-3 w-[18px] shrink-0 overflow-hidden rounded-[2px] ring-1 ring-black/10',
        className,
      )}
      aria-hidden
    >
      {locale === 'zh' ? <CnFlag /> : <UsFlag />}
    </span>
  )
}

function CnFlag() {
  return (
    <svg viewBox="0 0 30 20" className="size-full">
      <rect width="30" height="20" fill="#de2910" />
      <g fill="#ffde00">
        <polygon points="5,3 6.2,6.5 9.6,6.5 6.9,8.7 7.9,12 5,10 2.1,12 3.1,8.7 0.4,6.5 3.8,6.5" />
        <circle cx="11.5" cy="2.5" r="1" />
        <circle cx="13.8" cy="4.8" r="1" />
        <circle cx="13.8" cy="8" r="1" />
        <circle cx="11.5" cy="10.2" r="1" />
      </g>
    </svg>
  )
}

function UsFlag() {
  return (
    <svg viewBox="0 0 30 20" className="size-full">
      <rect width="30" height="20" fill="#fff" />
      {/* 13 道条纹压成 7 红 6 白 */}
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect key={i} y={(i * 20) / 13} width="30" height={20 / 13} fill="#b22234" />
      ))}
      <rect width="13" height={(20 / 13) * 7} fill="#3c3b6e" />
      <g fill="#fff">
        {[1, 3, 5, 7, 9].map((x) =>
          [1, 3, 5, 7, 9].map((y) => <circle key={`${x}-${y}`} cx={x * 1.3} cy={y * 1.05} r="0.42" />),
        )}
      </g>
    </svg>
  )
}
