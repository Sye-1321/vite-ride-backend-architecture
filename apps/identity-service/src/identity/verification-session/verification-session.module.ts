import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { NOTIFICATIONS_PACKAGE_NAME } from '@app/proto-schema';
import { RedisStoreModule } from '@app/redis-store';
import { TYPES } from '@app/shared-kernel';

import { IdentityConfig } from '../../config';
import { VerificationSessionService } from './application/services/verification-session.service';
import {
  NOTIFICATIONS_GRPC_CLIENT,
  NotificationsGrpcAdapter,
  VerificationSessionMapper,
  VerificationSessionRedisRepository,
} from './infrastructure';

@Module({
  imports: [
    RedisStoreModule,
    ClientsModule.registerAsync([
      {
        name: NOTIFICATIONS_GRPC_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const config = configService.get<IdentityConfig>('identity');

          if (!config) {
            throw new Error('Identity configuration is unavailable');
          }

          return {
            transport: Transport.GRPC,
            options: {
              package: NOTIFICATIONS_PACKAGE_NAME,
              protoPath: join(process.cwd(), 'libs/proto-schema/proto/notifications.proto'),
              url: config.NOTIFICATIONS_GRPC_URL,
            },
          };
        },
      },
    ]),
  ],
  providers: [
    VerificationSessionMapper,
    NotificationsGrpcAdapter,
    {
      provide: TYPES.VerificationNotificationPort,
      useExisting: NotificationsGrpcAdapter,
    },
    {
      provide: TYPES.IVerificationSessionService,
      useClass: VerificationSessionService,
    },
    {
      provide: TYPES.VerificationSessionRepository,
      useClass: VerificationSessionRedisRepository,
    },
  ],
  exports: [TYPES.IVerificationSessionService],
})
export class VerificationSessionModule {}
