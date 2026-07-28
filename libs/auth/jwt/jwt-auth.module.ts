import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategies';
import { JwtAuthAdapter } from './jwt-auth.adapter';
import { TYPES } from '@app/shared-kernel';
import jwtConfig from './config/jwt.config';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PassportModule, JwtModule.register({}), ConfigModule.forFeature(jwtConfig)],
  providers: [
    AccessTokenStrategy,
    RefreshTokenStrategy,
    {
      provide: TYPES.AuthTokenProvider,
      useClass: JwtAuthAdapter,
    },
  ],
  exports: [TYPES.AuthTokenProvider, AccessTokenStrategy, RefreshTokenStrategy, PassportModule],
})
export class JwtAuthModule {}
