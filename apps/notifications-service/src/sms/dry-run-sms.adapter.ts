import { Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { DeliveryResult } from '../delivery.types';
import { SmsPort } from './sms.port';

export class DryRunSmsAdapter implements SmsPort {
  private readonly logger = new Logger(DryRunSmsAdapter.name);

  async sendSms(): Promise<DeliveryResult> {
    const deliveryId = randomUUID();
    this.logger.log({ deliveryId, channel: 'sms', outcome: 'accepted' });
    return { deliveryId, outcome: 'accepted' };
  }
}
