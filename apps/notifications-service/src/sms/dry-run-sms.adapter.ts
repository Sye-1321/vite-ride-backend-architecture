import { randomUUID } from 'crypto';

import { LoggerPort } from '@app/shared-kernel';

import { DeliveryResult } from '../delivery.types';
import { SmsPort } from './sms.port';

export class DryRunSmsAdapter implements SmsPort {
  constructor(private readonly logger: LoggerPort) {}

  async sendSms(params: {
    to: string;
    message: string;
    correlationId?: string;
  }): Promise<DeliveryResult> {
    void params;
    const deliveryId = randomUUID();
    this.logger.log(
      'notification accepted',
      { deliveryId, channel: 'sms', outcome: 'accepted' },
      DryRunSmsAdapter.name,
    );
    return { deliveryId, outcome: 'accepted' };
  }
}
