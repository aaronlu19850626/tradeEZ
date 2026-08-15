import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

const VARIANTS = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 disabled:bg-brand-300',
  outline: 'border border-line bg-card text-fg-muted hover:bg-page',
  ghost: 'text-fg-muted hover:bg-raised',
} as const

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  fullWidth,
  className,
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-70',
        size === 'lg' ? 'px-5 py-3 text-[15px]' : 'px-4 py-2.5 text-sm',
        fullWidth && 'w-full',
        VARIANTS[variant],
        className,
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  )
}
