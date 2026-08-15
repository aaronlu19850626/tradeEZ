import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Loader2, TriangleAlert } from 'lucide-react'
import { useResetPassword, useVerifyResetToken } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { fieldErrors, resetPasswordSchema } from '@tradeez/shared'
import { AuthCard } from './AuthLayout'

/** 设置新密码。F-19-04，入口为邮件中的 /reset-password?token=xxx */
export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const token = useSearchParams()[0].get('token')
  const verify = useVerifyResetToken(token)
  const reset = useResetPassword()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const parsed = resetPasswordSchema.safeParse({
      password: String(fd.get('password') ?? ''),
      confirmPassword: String(fd.get('confirmPassword') ?? ''),
    })
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    try {
      await reset.mutateAsync({ token: token!, password: parsed.data.password })
      setDone(true)
    } catch {
      // 错误由 reset.error 渲染
    }
  }

  if (!token || verify.data?.valid === false || verify.isError) {
    return (
      <AuthCard title="链接已失效" subtitle="重置链接可能已过期或被使用过">
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-loss-soft text-loss">
            <TriangleAlert className="size-6" />
          </span>
          <p className="text-sm text-fg-muted">请重新申请一封重置邮件。</p>
          <Button onClick={() => navigate('/forgot-password')}>重新申请</Button>
        </div>
      </AuthCard>
    )
  }

  if (verify.isLoading) {
    return (
      <AuthCard title="校验链接" subtitle="请稍候">
        <div className="grid place-items-center py-6">
          <Loader2 className="size-6 animate-spin text-slate-300" />
        </div>
      </AuthCard>
    )
  }

  if (done) {
    return (
      <AuthCard title="密码已重置" subtitle="请用新密码登录">
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-profit-soft text-profit">
            <CheckCircle2 className="size-6" />
          </span>
          <p className="text-sm text-fg-muted">出于安全考虑，其他设备上的登录已同时失效。</p>
          <Button onClick={() => navigate('/login', { replace: true })}>前往登录</Button>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="设置新密码"
      subtitle={verify.data?.email ? `账号：${verify.data.email}` : undefined}
      footer={
        <Link to="/login" className="text-brand-600 hover:underline">
          返回登录
        </Link>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <TextField
          name="password"
          type="password"
          placeholder="新密码（至少 8 位，含字母与数字）"
          autoComplete="new-password"
          error={errors.password}
        />
        <TextField
          name="confirmPassword"
          type="password"
          placeholder="确认新密码"
          autoComplete="new-password"
          error={errors.confirmPassword}
        />
        {reset.error && (
          <p role="alert" className="rounded-lg bg-loss-soft px-3 py-2 text-sm text-loss">
            {reset.error.message}
          </p>
        )}
        <Button type="submit" size="lg" fullWidth loading={reset.isPending}>
          确认重置
        </Button>
      </form>
    </AuthCard>
  )
}
