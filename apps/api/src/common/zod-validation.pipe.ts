import { BadRequestException, type PipeTransform } from '@nestjs/common'
import type { ZodType } from 'zod'

/**
 * zod 校验管道。直接吃 @tradeez/shared 里的 schema，
 * 前端表单与后端入参因此共用同一份规则，不会各自漂移。
 *
 * 用法：@Body(new ZodBody(loginSchema)) body: LoginInput
 */
export class ZodBody<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const parsed = this.schema.safeParse(value)
    if (!parsed.success) {
      // 只回首条错误，与前端 fieldErrors 的呈现方式一致
      const first = parsed.error.issues[0]
      throw new BadRequestException({
        message: first.message,
        field: first.path.join('.') || undefined,
      })
    }
    return parsed.data
  }
}
