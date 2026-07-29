import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule, ThrottlerStorage } from '@nestjs/throttler';
import { UserModule } from './identity/user/user.module';
import { JwtAuthModule } from '@app/auth';
import { ConfigModule } from '@nestjs/config';
import { GatewayContextModule } from '@app/context';
import { RedisClientModule } from '@app/redis';

import gatewayConfig from './config/gateway.config';
import { AuthorizationModule } from './authorization/authorization.module';
import { HealthModule } from './health/health.module';
import { RealtimeModule } from './realtime/realtime.module';
import { RedisThrottlerStorage } from './security/redis-throttler.storage';
import { TenantsModule } from './tenants/tenants.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [gatewayConfig],
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 100 }],
    }),
    UserModule,
    AuthorizationModule,
    TenantsModule,
    JwtAuthModule,
    RedisClientModule,
    GatewayContextModule,
    RealtimeModule,
    HealthModule,
  ],
  providers: [
    RedisThrottlerStorage,
    {
      provide: ThrottlerStorage,
      useExisting: RedisThrottlerStorage,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
