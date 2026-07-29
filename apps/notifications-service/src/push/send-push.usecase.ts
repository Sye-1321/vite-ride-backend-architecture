import { Inject, Injectable } from '@nestjs/common';

import { ApplicationError } from '@app/application-core';
import { TYPES } from '@app/shared-kernel';

import { DeliveryResult } from '../delivery.types';
import { PushPort } from './push.port';

export interface SendPushCommand {
  deviceTokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  correlationId?: string;
}

@Injectable()
export class SendPushUseCase {
  constructor(
    @Inject(TYPES.PushPort)
    private readonly pushPort: PushPort,
  ) {}

  execute(command: SendPushCommand): Promise<DeliveryResult> {
    const tokens = command.deviceTokens?.map((token) => token.trim()).filter(Boolean);
    const title = command.title?.trim();
    const body = command.body?.trim();
    const correlationId = command.correlationId?.trim() || undefined;

    if (!tokens?.length || tokens.length > 500) {
      throw new ApplicationError(
        'INVALID_ARGUMENT',
        'deviceTokens must contain between 1 and 500 entries',
      );
    }

    if (!title || title.length > 120) {
      throw new ApplicationError(
        'INVALID_ARGUMENT',
        'title must contain between 1 and 120 characters',
      );
    }

    if (!body || body.length > 1000) {
      throw new ApplicationError(
        'INVALID_ARGUMENT',
        'body must contain between 1 and 1000 characters',
      );
    }

    if (correlationId && correlationId.length > 128) {
      throw new ApplicationError(
        'INVALID_ARGUMENT',
        'correlationId must not exceed 128 characters',
      );
    }

    if (
      Object.keys(command.data ?? {}).some(
        (key) =>
          key === 'from' ||
          key === 'message_type' ||
          key.startsWith('google.') ||
          key.startsWith('gcm.') ||
          key.startsWith('gcm.notification.'),
      )
    ) {
      throw new ApplicationError('INVALID_ARGUMENT', 'data contains a reserved push key');
    }

    const payloadBytes = Buffer.byteLength(
      JSON.stringify({ notification: { title, body }, data: command.data ?? {} }),
      'utf8',
    );
    if (payloadBytes > 4_096) {
      throw new ApplicationError('INVALID_ARGUMENT', 'push payload must not exceed 4096 bytes');
    }

    return this.pushPort.sendPush({
      tokens: [...new Set(tokens)],
      title,
      body,
      data: command.data,
      correlationId,
    });
  }
}
