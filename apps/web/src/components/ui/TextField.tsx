import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  /** 校验错误文案。有值时输入框描红并在下方显示（对齐截图） */
  error?: string
  type?: 'text' | 'email' | 'password'
}

/** 带错误态与密码可见切换的输入框。F-19-02 */
export function TextField({ label, error, type = 'text', className, id, ...rest }: Props) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const [revealed, setRevealed] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className={className}>
      {label && (
        <label htmlFor={fieldId} className="mb-1.5 block text-sm text-fg-muted">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...rest}
          id={fieldId}
          type={isPassword && !revealed ? 'password' : type === 'password' ? 'text' : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={cn(
            'w-full rounded-lg border bg-card px-3.5 py-2.5 text-sm text-fg outline-none',
            'placeholder:text-fg-subtle',
            'focus:ring-2 focus:ring-brand-100',
            isPassword && 'pr-10',
            error
              ? 'border-loss focus:border-loss focus:ring-loss/15'
              : 'border-line focus:border-brand-400',
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? '隐藏密码' : '显示密码'}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-fg-subtle hover:text-fg-muted"
          >
            {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${fieldId}-error`} className="mt-1.5 text-xs text-loss">
          {error}
        </p>
      )}
    </div>
  )
}
