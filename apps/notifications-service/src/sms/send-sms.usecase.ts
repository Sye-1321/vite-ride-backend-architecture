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
    const correlationId = command.correlationId?.trim() || undefined;

    if (!recipient || !/^\+[1-9]\d{7,14}$/.test(recipient)) {
      throw new ApplicationError(
        'INVALID_ARGUMENT',
        'recipient must be a valid E.164 phone number',
      );
    }

    if (!message || message.length > 1000) {
      throw new ApplicationError(
        'INVALID_ARGUMENT',
        'message must contain between 1 and 1000 characters',
      );
    }

    if (correlationId && correlationId.length > 128) {
      throw new ApplicationError(
        'INVALID_ARGUMENT',
        'correlationId must not exceed 128 characters',
      );
    }

    return this.smsPort.sendSms({
      to: recipient,
      message,
      correlationId,
    });
  }
}
