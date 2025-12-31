import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AfroMessageAdapter } from './afro-message.adapter';
import { TYPES } from '@app/shared-kernel';
import { SmsTestController } from './sms-test.controller';
import afroMessageConfig from './config/afro-message.config';


@Module({
  imports: [HttpModule, ConfigModule.forFeature(afroMessageConfig)],
  controllers: [SmsTestController],
  providers: [
    {
      provide: TYPES.SmsPort,
      useClass: AfroMessageAdapter,
    },
  ],
  exports: [TYPES.SmsPort],
})
export class AfroMessageModule {}