import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtConfig } from '../config/jwt.config.schema';
import { AuthPayload } from '../../auth.contracts';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(configService: ConfigService) {
    const jwtConfig = configService.get<JwtConfig>('jwt', { infer: true });

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  validate(payload: AuthPayload) {
    console.log('[AccessTokenStrategy] payload:', payload);
    return { ...payload };
  }
}
