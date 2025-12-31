import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RedisStoreModule } from '@app/redis-store';

import { UserModule } from './identity/user/user.module';
import { MongoModule } from '@app/persistence';
import { AdaptersModule } from '@app/adapters';
import { MicroserviceContextModule } from '@app/context';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),

    MicroserviceContextModule,

    MongoModule.forRoot('IDENTITY', 'IdentityConnection'),
    RedisStoreModule,
    AdaptersModule,
    UserModule,
  ],
})
export class IdentityServiceModule {}
