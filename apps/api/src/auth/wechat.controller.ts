import { Controller, Get, Post, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

/**
 * 微信扫码登录。F-19-05
 *
 * 需要微信开放平台「网站应用」的 AppID / AppSecret，该资质尚未申请。
 * 这里保留路由并返回明确的 503 + 中文提示 —— 否则前端会收到 404，
 * 用户只看到「请求失败：404」，无从判断是功能未开放还是系统故障。
 *
 * 拿到凭据后：填入环境变量，把下面的抛错替换为真实的
 * 二维码申请 / 状态轮询 / code 换 access_token 三步。
 */
@Controller('auth/wechat')
export class WechatController {
  constructor(private readonly config: ConfigService) {}

  private get configured() {
    return Boolean(this.config.get('WECHAT_APP_ID') && this.config.get('WECHAT_APP_SECRET'))
  }

  private ensureConfigured() {
    if (!this.configured) {
      throw new ServiceUnavailableException('微信登录暂未开放，请使用邮箱密码登录')
    }
  }

  @Post('qrcode')
  qrcode() {
    this.ensureConfigured()
    throw new ServiceUnavailableException('微信登录暂未开放，请使用邮箱密码登录')
  }

  @Get('status')
  status() {
    this.ensureConfigured()
    throw new ServiceUnavailableException('微信登录暂未开放，请使用邮箱密码登录')
  }

  @Post('exchange')
  exchange() {
    this.ensureConfigured()
    throw new ServiceUnavailableException('微信登录暂未开放，请使用邮箱密码登录')
  }
}
