import { HttpService } from '@nestjs/axios';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';

import { NotificationsConfig } from '../../config';
import { DeliveryResult } from '../../delivery.types';
import { SmsPort } from '../sms.port';

export class AfroMessageAdapter implements SmsPort {
  constructor(
    private readonly http: HttpService,
    private readonly config: NotificationsConfig,
  ) {}

  async sendSms(params: {
    to: string;
    message: string;
    correlationId?: string;
  }): Promise<DeliveryResult> {
    const payload = {
      to: params.to,
      message: params.message,
    };

    try {
      await firstValueFrom(
        this.http.post(this.config.AFROMESSAGE_BASE_URL, payload, {
          headers: {
            Authorization: `Bearer ${this.config.AFROMESSAGE_API_TOKEN}`,
          },
        }),
      );
      return { deliveryId: randomUUID(), outcome: 'delivered' };
    } catch {
      throw new Error('SMS provider request failed');
    }
  }
}
