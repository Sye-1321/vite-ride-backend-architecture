import { ClientGrpc } from '@nestjs/microservices';
import { of } from 'rxjs';

import { DeliveryStatus, NotificationsServiceClient } from '@app/proto-schema';

import { UserVerificationPurpose } from '../../user/application/types';
import { NotificationsGrpcAdapter } from './notifications-grpc.adapter';

describe('NotificationsGrpcAdapter', () => {
  it('maps verification data to the notifications contract', async () => {
    const notificationsService: Pick<NotificationsServiceClient, 'sendSms'> = {
      sendSms: jest.fn().mockReturnValue(
        of({
          deliveryId: 'delivery-1',
          status: DeliveryStatus.DELIVERY_STATUS_ACCEPTED,
        }),
      ),
    };
    const client = {
      getService: jest.fn().mockReturnValue(notificationsService),
    } as unknown as ClientGrpc;
    const adapter = new NotificationsGrpcAdapter(client);
    adapter.onModuleInit();

    await adapter.sendOtp({
      recipient: '+251900000000',
      otp: '123456',
      purpose: UserVerificationPurpose.PASSWORD_RESET,
    });

    expect(notificationsService.sendSms).toHaveBeenCalledWith({
      recipient: '+251900000000',
      message: 'Your password reset code is 123456. It expires in 5 minutes.',
      correlationId: expect.any(String),
    });
  });
});
