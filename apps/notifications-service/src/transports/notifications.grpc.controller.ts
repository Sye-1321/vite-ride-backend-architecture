import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import {
  DeliveryResponse,
  DeliveryStatus,
  NOTIFICATIONS_SERVICE_NAME,
  NotificationsHealthResponse,
  SendPushRequest,
  SendSmsRequest,
} from '@app/proto-schema';

import { DeliveryOutcome } from '../delivery.types';
import { SendPushUseCase } from '../push/send-push.usecase';
import { SendSmsUseCase } from '../sms/send-sms.usecase';

@Controller()
export class NotificationsGrpcController {
  constructor(
    private readonly sendSmsUseCase: SendSmsUseCase,
    private readonly sendPushUseCase: SendPushUseCase,
  ) {}

  @GrpcMethod(NOTIFICATIONS_SERVICE_NAME, 'SendSms')
  async sendSms(request: SendSmsRequest): Promise<DeliveryResponse> {
    const result = await this.sendSmsUseCase.execute(request);
    return {
      deliveryId: result.deliveryId,
      status: this.toDeliveryStatus(result.outcome),
    };
  }

  @GrpcMethod(NOTIFICATIONS_SERVICE_NAME, 'SendPush')
  async sendPush(request: SendPushRequest): Promise<DeliveryResponse> {
    const result = await this.sendPushUseCase.execute(request);
    return {
      deliveryId: result.deliveryId,
      status: this.toDeliveryStatus(result.outcome),
    };
  }

  @GrpcMethod(NOTIFICATIONS_SERVICE_NAME, 'Health')
  health(): NotificationsHealthResponse {
    return { status: 'SERVING' };
  }

  private toDeliveryStatus(outcome: DeliveryOutcome): DeliveryStatus {
    return outcome === 'delivered'
      ? DeliveryStatus.DELIVERY_STATUS_DELIVERED
      : DeliveryStatus.DELIVERY_STATUS_ACCEPTED;
  }
}
