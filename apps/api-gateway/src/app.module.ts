import { Module } from '@nestjs/common';
import { UserModule } from './identity/user/user.module';
import { JwtAuthModule } from 'libs/auth/jwt';
import { ConfigModule } from '@nestjs/config';
import { GatewayContextModule } from '@app/context';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    UserModule,
    JwtAuthModule,
    GatewayContextModule,
  ],
})
export class AppModule {}
