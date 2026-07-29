import { Module } from '@nestjs/common';
import { UserModule } from './identity/user/user.module';
import { JwtAuthModule } from '@app/auth';
import { ConfigModule } from '@nestjs/config';
import { GatewayContextModule } from '@app/context';
import { RedisClientModule } from '@app/redis';

import gatewayConfig from './config/gateway.config';
import { AuthorizationModule } from './authorization/authorization.module';
import { RealtimeModule } from './realtime/realtime.module';
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
    UserModule,
    AuthorizationModule,
    TenantsModule,
    JwtAuthModule,
    RedisClientModule,
    GatewayContextModule,
    RealtimeModule,
  ],
})
export class AppModule {}
