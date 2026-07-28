import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtConfig } from './config';
import { StringValue } from 'ms';
import { AuthTokenProviderPort } from 'apps/identity-service/src/identity/user/application/ports';
import { AuthPayload, AuthTokens } from 'apps/identity-service/src/identity/user/application/types';

@Injectable()
export class JwtAuthAdapter implements AuthTokenProviderPort {
  private readonly jwtConfig: JwtConfig;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtConfig = this.configService.get<JwtConfig>('jwt', { infer: true });
  }

  private getAccessTokenOptions(): JwtSignOptions {
    return {
      secret: this.jwtConfig.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: this.jwtConfig.JWT_ACCESS_TOKEN_EXPIRATION_TIME as StringValue,
    };
  }

  private getRefreshTokenOptions(): JwtSignOptions {
    return {
      secret: this.jwtConfig.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: this.jwtConfig.JWT_REFRESH_TOKEN_EXPIRATION_TIME as StringValue,
    };
  }

  private async signAccessToken(payload: AuthPayload): Promise<string> {
    return this.jwtService.signAsync(payload, this.getAccessTokenOptions());
  }

  private async signRefreshToken(payload: AuthPayload): Promise<string> {
    return this.jwtService.signAsync(payload, this.getRefreshTokenOptions());
  }

  async generateAuthTokens(payload: AuthPayload): Promise<AuthTokens> {
    const accessToken = await this.signAccessToken(payload);
    const refreshToken = await this.signRefreshToken(payload);
    return { accessToken, refreshToken };
  }
}
