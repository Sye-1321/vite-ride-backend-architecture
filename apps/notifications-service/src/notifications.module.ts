import { HttpModule, HttpService } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';

import { TYPES } from '@app/shared-kernel';

import { NotificationsConfig } from './config';
import notificationsConfig from './config/notifications.config';
import { DryRunPushAdapter } from './push/dry-run-push.adapter';
import { FirebaseAdapter } from './push/firebase/firebase.adapter';
import { SendPushUseCase } from './push/send-push.usecase';
import { AfroMessageAdapter } from './sms/afro-message/afro-message.adapter';
import { DryRunSmsAdapter } from './sms/dry-run-sms.adapter';
import { SendSmsUseCase } from './sms/send-sms.usecase';
import { NotificationsGrpcController } from './transports/notifications.grpc.controller';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [notificationsConfig],
    }),
  ],
  controllers: [NotificationsGrpcController],
  providers: [
    SendSmsUseCase,
    SendPushUseCase,
    {
      provide: TYPES.SmsPort,
      inject: [ConfigService, HttpService],
      useFactory: (configService: ConfigService, httpService: HttpService) => {
        const config = configService.get<NotificationsConfig>('notifications');

        if (!config) {
          throw new Error('Notifications configuration is unavailable');
        }

        return config.SMS_DRIVER === 'afromessage'
          ? new AfroMessageAdapter(httpService, config)
          : new DryRunSmsAdapter();
      },
    },
    {
      provide: TYPES.PushPort,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get<NotificationsConfig>('notifications');

        if (!config) {
          throw new Error('Notifications configuration is unavailable');
        }

        return config.PUSH_DRIVER === 'firebase'
          ? new FirebaseAdapter(config)
          : new DryRunPushAdapter();
      },
    },
  ],
})
export class NotificationsModule {}
