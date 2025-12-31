import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtConfig } from '../config/jwt.config.schema';
import { AuthPayload } from 'apps/identity-service/src/identity/user/application/types';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    const jwtConfig = configService.get<JwtConfig>('jwt', { infer: true });

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.JWT_REFRESH_TOKEN_SECRET,
      passReqToCallback: true,
    });
  }

  validate(request: Request, payload: AuthPayload) {
    const refreshToken =
      ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    if (!refreshToken) {
      throw new Error('Refresh token missing');
    }

    return {
      userId: payload.userId,
      refreshToken,
    };
  }
}

