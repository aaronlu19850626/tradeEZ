import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { useForgotPassword } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { fieldErrors, forgotPasswordSchema } from '@/lib/validation'
import { AuthCard } from './AuthLayout'

/** 找回密码：发送重置链接。F-19-04 */
export default function ForgotPasswordPage() {
  const forgot = useForgotPassword()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sentTo, setSentTo] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = String(new FormData(e.currentTarget).get('email') ?? '')
    const parsed = forgotPasswordSchema.safeParse({ email })
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    await forgot.mutateAsync(parsed.data)
    setSentTo(parsed.data.email)
  }

  if (sentTo) {
    return (
      <AuthCard title="请检查邮箱" subtitle={`重置链接已发送至 ${sentTo}`}>
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-profit-soft text-profit">
            <MailCheck className="size-6" />
          </span>
          <p className="text-sm text-slate-600">
            点击邮件中的链接即可设置新密码，链接 30 分钟内有效。
            <br />
            没收到？请检查垃圾邮件夹。
          </p>
          <Button variant="outline" onClick={() => setSentTo(null)}>
            换个邮箱重试
          </Button>
          {/* mock 阶段无真实邮件，链接打在控制台 */}
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            当前为模拟环境，重置链接已打印在浏览器控制台
          </p>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="找回密码"
      subtitle="输入注册邮箱，我们会发送重置链接"
      footer={
        <Link to="/login" className="inline-flex items-center gap-1 text-brand-600 hover:underline">
          <ArrowLeft className="size-3.5" />
          返回登录
        </Link>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <TextField
          name="email"
          type="email"
          placeholder="电子邮件地址"
          autoComplete="email"
          error={errors.email}
        />
        <Button type="submit" size="lg" fullWidth loading={forgot.isPending}>
          发送重置链接
        </Button>
      </form>
    </AuthCard>
  )
}
