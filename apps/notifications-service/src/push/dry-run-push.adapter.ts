import { Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { DeliveryResult } from '../delivery.types';
import { PushPort } from './push.port';

export class DryRunPushAdapter implements PushPort {
  private readonly logger = new Logger(DryRunPushAdapter.name);

  async sendPush(params: {
    tokens: string[];
    title: string;
    body: string;
    data?: Record<string, string>;
    correlationId?: string;
  }): Promise<DeliveryResult> {
    void params;
    const deliveryId = randomUUID();
    this.logger.log({ deliveryId, channel: 'push', outcome: 'accepted' });
    return { deliveryId, outcome: 'accepted' };
  }
}
