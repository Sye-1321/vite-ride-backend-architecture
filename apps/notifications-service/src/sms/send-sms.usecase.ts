import { Inject, Injectable } from '@nestjs/common';

import { ApplicationError } from '@app/application-core';
import { TYPES } from '@app/shared-kernel';

import { DeliveryResult } from '../delivery.types';
import { SmsPort } from './sms.port';

export interface SendSmsCommand {
  recipient: string;
  message: string;
  correlationId?: string;
}

@Injectable()
export class SendSmsUseCase {
  constructor(
    @Inject(TYPES.SmsPort)
    private readonly smsPort: SmsPort,
  ) {}

  execute(command: SendSmsCommand): Promise<DeliveryResult> {
    const recipient = command.recipient?.trim();
    const message = command.message?.trim();

    if (!recipient || recipient.length > 64) {
      throw new ApplicationError(
        'INVALID_ARGUMENT',
        'recipient must contain between 1 and 64 characters',
      );
    }

    if (!message || message.length > 1000) {
      throw new ApplicationError(
        'INVALID_ARGUMENT',
        'message must contain between 1 and 1000 characters',
      );
    }

    return this.smsPort.sendSms({
      to: recipient,
      message,
      correlationId: command.correlationId || undefined,
    });
  }
}
