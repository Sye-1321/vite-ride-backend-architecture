import { randomUUID } from 'crypto';

import { LoggerPort } from '@app/shared-kernel';

import { DeliveryResult } from '../delivery.types';
import { PushPort } from './push.port';

export class DryRunPushAdapter implements PushPort {
  constructor(private readonly logger: LoggerPort) {}

  async sendPush(params: {
    tokens: string[];
    title: string;
    body: string;
    data?: Record<string, string>;
    correlationId?: string;
  }): Promise<DeliveryResult> {
    void params;
    const deliveryId = randomUUID();
    this.logger.log(
      'notification accepted',
      { deliveryId, channel: 'push', outcome: 'accepted' },
      DryRunPushAdapter.name,
    );
    return { deliveryId, outcome: 'accepted' };
  }
}
