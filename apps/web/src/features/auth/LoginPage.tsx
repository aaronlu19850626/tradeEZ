import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLogin } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { fieldErrors, loginSchema } from '@tradeez/shared'
import { SEED_ACCOUNT, SEED_HINT } from './constants'
import { AuthCard } from './AuthLayout'
import { WechatButton } from './WechatButton'

/** 登录页。F-19-02 */
export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useLogin()
  const [errors, setErrors] = useState<Record<string, string>>({})

  /** 登录后回到守卫记录的原页面，没有则去仪表盘 */
  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? '/journal/dashboard'

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const input = {
      email: String(fd.get('email') ?? ''),
      password: String(fd.get('password') ?? ''),
    }

    const parsed = loginSchema.safeParse(input)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})

    try {
      await login.mutateAsync(parsed.data)
      navigate(redirectTo, { replace: true })
    } catch {
      // 错误由 login.error 渲染
    }
  }

  return (
    <AuthCard
      title="登录"
      subtitle="我们帮助交易者实现盈利"
      footer={
        <>
          还没有账号？{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">
            立即注册
          </Link>
        </>
      }
    >
      <WechatButton onSuccess={() => navigate(redirectTo, { replace: true })} />

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs text-fg-subtle">或者</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <TextField
          name="email"
          type="email"
          placeholder="电子邮件地址"
          autoComplete="email"
          error={errors.email}
          defaultValue={SEED_ACCOUNT.email}
        />
        <div>
          <TextField
            name="password"
            type="password"
            placeholder="密码"
            autoComplete="current-password"
            error={errors.password}
            defaultValue={SEED_ACCOUNT.password}
          />
          <Link
            to="/forgot-password"
            className="mt-2 inline-block text-sm text-brand-600 hover:underline"
          >
            忘记密码？
          </Link>
        </div>

        {login.error && (
          <p role="alert" className="rounded-lg bg-loss-soft px-3 py-2 text-sm text-loss">
            {login.error.message}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth loading={login.isPending}>
          登录
        </Button>
      </form>

      <p className="mt-5 rounded-lg bg-page px-3 py-2 text-center text-xs text-fg-subtle">
        {SEED_HINT}
      </p>
    </AuthCard>
  )
}
