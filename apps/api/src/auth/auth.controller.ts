import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '@tradeez/shared'
import { ZodBody } from '../common/zod-validation.pipe.js'
import { AuthService } from './auth.service.js'
import { JwtAuthGuard, type AuthedRequest } from './jwt-auth.guard.js'

/** 记录登录来源用，只取需要的两个字段 */
interface RequestMeta extends AuthedRequest {
  ip?: string
}

/**
 * 认证接口。F-19
 *
 * 入参校验直接用 @tradeez/shared 的 zod schema —— 与前端表单同一份规则，
 * 不会出现「前端放行、后端拒收」的口径分歧。
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** 请求来源信息，记入 refresh token 便于排查异常登录 */
  private meta(req: RequestMeta) {
    const ua = req.headers['user-agent']
    return { userAgent: typeof ua === 'string' ? ua : undefined, ip: req.ip }
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body(new ZodBody(loginSchema)) body: { email: string; password: string },
    @Req() req: RequestMeta,
  ) {
    return this.auth.login(body, this.meta(req))
  }

  @Post('register')
  async register(@Body() raw: unknown, @Req() req: RequestMeta) {
    /**
     * 注册接口不收 confirmPassword / agreed（那是表单侧的约束），
     * 但仍复用同一份 schema：补齐这两个字段后校验，密码强度规则就不会两处维护。
     */
    const input = raw as Record<string, unknown>
    const parsed = registerSchema.safeParse({
      ...input,
      confirmPassword: input.password,
      agreed: true,
    })
    if (!parsed.success) throw new BadRequestException(parsed.error.issues[0].message)

    const { nickname, email, password } = parsed.data
    return this.auth.register({ nickname, email, password }, this.meta(req))
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body(new ZodBody(forgotPasswordSchema)) body: { email: string }) {
    return this.auth.forgotPassword(body.email)
  }

  @Get('reset-token')
  async verifyResetToken(@Query('token') token?: string) {
    if (!token) return { valid: false }
    return this.auth.verifyResetToken(token)
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() raw: unknown) {
    const input = raw as { token?: string; password?: string }
    if (!input.token) throw new BadRequestException('缺少重置令牌')

    const parsed = resetPasswordSchema.safeParse({
      password: input.password,
      confirmPassword: input.password,
    })
    if (!parsed.success) throw new BadRequestException(parsed.error.issues[0].message)

    return this.auth.resetPassword(input.token, parsed.data.password)
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() body: { refreshToken?: string }) {
    if (!body.refreshToken) throw new BadRequestException('缺少 refreshToken')
    return this.auth.refresh(body.refreshToken)
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Body() body: { refreshToken?: string }) {
    await this.auth.logout(body.refreshToken)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: AuthedRequest) {
    return this.auth.me(req.user!.id)
  }
}
