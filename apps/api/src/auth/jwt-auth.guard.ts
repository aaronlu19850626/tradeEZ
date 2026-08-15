import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { TokenService } from './token.service.js'

/**
 * 请求上下文里我们只用到 headers，
 * 故自行声明最小接口而非依赖 fastify 的类型（它不在依赖里）。
 */
export interface AuthedRequest {
  headers: Record<string, string | string[] | undefined>
  user?: { id: string; email: string }
}

/**
 * 鉴权守卫。校验 Authorization: Bearer <access token>。
 * 用在需要登录的路由上，未通过统一抛 401 —— 前端守卫据此清会话并跳登录页。
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokens: TokenService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>()
    const header = req.headers.authorization

    if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('未登录或会话已过期')
    }

    const payload = await this.tokens.verifyAccessToken(header.slice(7))
    if (!payload) throw new UnauthorizedException('未登录或会话已过期')

    req.user = { id: payload.sub, email: payload.email }
    return true
  }
}
