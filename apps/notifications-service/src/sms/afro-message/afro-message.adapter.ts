import { HttpService } from '@nestjs/axios';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';

import { ApplicationError } from '@app/application-core';
import { LoggerPort } from '@app/shared-kernel';

import { NotificationsConfig } from '../../config';
import { DeliveryResult } from '../../delivery.types';
import { SmsPort } from '../sms.port';

export class AfroMessageAdapter implements SmsPort {
  constructor(
    private readonly http: HttpService,
    private readonly config: NotificationsConfig,
    private readonly logger: LoggerPort,
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
            ...(params.correlationId
              ? {
                  'X-Correlation-Id': params.correlationId,
                }
              : {}),
          },
          maxRedirects: 0,
          timeout: this.config.NOTIFICATION_PROVIDER_TIMEOUT_MS,
        }),
      );
      return { deliveryId: randomUUID(), outcome: 'accepted' };
    } catch (error) {
      this.logger.error('SMS provider request failed', error, AfroMessageAdapter.name);
      throw new ApplicationError('UNAVAILABLE', 'SMS provider is unavailable');
    }
  }
}
