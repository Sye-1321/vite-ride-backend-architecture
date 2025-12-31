import { Controller, Post, Body } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { TYPES } from '@app/shared-kernel';
import { SmsPort } from '../sms.port';

@Controller('test/sms')
export class SmsTestController {
  constructor(
    @Inject(TYPES.SmsPort)
    private readonly smsPort: SmsPort,
  ) {}

  @Post()
  async sendTestSms(
    @Body() body: { to: string; message: string },
  ) {
    await this.smsPort.sendSms({
      to: body.to,
      message: body.message,
    });

    return { status: 'SMS_SENT' };
  }
}
