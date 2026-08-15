import { useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

/**
 * 点击时从落点向外扩散一个圆。
 * 涟漪元素在动画结束后移除，避免节点无限堆积。
 */
export function RippleButton({
  className,
  onClick,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const seq = useRef(0)

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      // 取长边保证圆能盖满按钮
      const size = Math.max(rect.width, rect.height)
      const id = seq.current++
      setRipples((r) => [
        ...r,
        { id, x: e.clientX - rect.left - size / 2, y: e.clientY - rect.top - size / 2, size },
      ])
      onClick?.(e)
    },
    [onClick],
  )

  return (
    <button
      {...rest}
      onClick={handleClick}
      className={cn('relative overflow-hidden', className)}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden
          onAnimationEnd={() => setRipples((prev) => prev.filter((p) => p.id !== r.id))}
          className="animate-ripple pointer-events-none absolute rounded-full bg-current"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
      {children}
    </button>
  )
}
