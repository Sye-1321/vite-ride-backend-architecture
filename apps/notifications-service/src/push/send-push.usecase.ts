import { status } from '@grpc/grpc-js';
import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

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

    if (!tokens?.length || tokens.length > 500) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'deviceTokens must contain between 1 and 500 entries',
      });
    }

    if (!title || title.length > 120) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'title must contain between 1 and 120 characters',
      });
    }

    if (!body || body.length > 1000) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'body must contain between 1 and 1000 characters',
      });
    }

    return this.pushPort.sendPush({
      tokens: [...new Set(tokens)],
      title,
      body,
      data: command.data,
      correlationId: command.correlationId || undefined,
    });
  }
}
