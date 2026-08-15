import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { JwtAuthGuard } from './jwt-auth.guard.js'
import { TokenService } from './token.service.js'
import { WechatController } from './wechat.controller.js'

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController, WechatController],
  providers: [AuthService, TokenService, JwtAuthGuard],
  // 守卫供其他模块保护自己的路由
  exports: [TokenService, JwtAuthGuard],
})
export class AuthModule {}
