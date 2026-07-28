import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';

import {
  DeliveryStatus,
  NOTIFICATIONS_SERVICE_NAME,
  NotificationsServiceClient,
} from '@app/proto-schema';

import { UserVerificationPurpose } from '../../user/application/types';
import { VerificationNotificationPort } from '../application/ports';

export const NOTIFICATIONS_GRPC_CLIENT = 'NOTIFICATIONS_GRPC_CLIENT';

@Injectable()
export class NotificationsGrpcAdapter implements VerificationNotificationPort, OnModuleInit {
  private notificationsService!: NotificationsServiceClient;

  constructor(
    @Inject(NOTIFICATIONS_GRPC_CLIENT)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.notificationsService = this.client.getService<NotificationsServiceClient>(
      NOTIFICATIONS_SERVICE_NAME,
    );
  }

  async sendOtp(params: {
    recipient: string;
    otp: string;
    purpose: UserVerificationPurpose;
  }): Promise<void> {
    const response = await firstValueFrom(
      this.notificationsService.sendSms({
        recipient: params.recipient,
        message: this.buildMessage(params.otp, params.purpose),
        correlationId: randomUUID(),
      }),
    );

    if (response.status === DeliveryStatus.DELIVERY_STATUS_FAILED) {
      throw new Error('Verification notification delivery failed');
    }
  }

  private buildMessage(otp: string, purpose: UserVerificationPurpose): string {
    const action = purpose.replace(/-/g, ' ');
    return `Your ${action} code is ${otp}. It expires in 5 minutes.`;
  }
}
