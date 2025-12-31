import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AfroMessageModule } from './sms/afro-message/afro-message.module';
import { PushModule } from './push/firebase/firebase.module';


@Module({
  imports: [
      ConfigModule.forRoot({
      isGlobal: true,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    AfroMessageModule,
    PushModule,
  ],
})
export class NotificationsModule {}
