import { WsException } from '@nestjs/websockets';

import { AuthorizationGrpcClient } from '../authorization/authorization.grpc.client';
import { RealtimeRateLimiter } from './realtime-rate-limiter.service';
import { RideRealtimeGateway, RideSocket } from './ride-realtime.gateway';

describe('RideRealtimeGateway', () => {
  const tenantId = '5fd27d80-f653-4656-a21b-327283575f56';
  let authorize: jest.Mock;
  let consume: jest.Mock;
  let emit: jest.Mock;
  let socket: RideSocket;
  let gateway: RideRealtimeGateway;

  beforeEach(() => {
    authorize = jest.fn().mockResolvedValue({ allowed: true });
    consume = jest.fn().mockResolvedValue(true);
    emit = jest.fn();
    socket = {
      data: {
        user: { userId: 'driver-1', phoneNumber: '+251911000000' },
      },
      join: jest.fn().mockResolvedValue(undefined),
      leave: jest.fn().mockResolvedValue(undefined),
      to: jest.fn().mockReturnValue({ emit }),
    } as unknown as RideSocket;
    gateway = new RideRealtimeGateway(
      { authorize } as unknown as AuthorizationGrpcClient,
      { consume } as unknown as RealtimeRateLimiter,
    );
  });

  it('authorizes tenant room subscriptions', async () => {
    await expect(gateway.subscribeToTenant(socket, { tenantId })).resolves.toEqual({
      event: 'tenant:subscribed',
      data: { tenantId },
    });
    expect(authorize).toHaveBeenCalledWith({
      userId: 'driver-1',
      domain: tenantId,
      resource: 'tenant',
      action: 'read',
    });
    expect(socket.join).toHaveBeenCalledWith(`tenant:${tenantId}`);
  });

  it('rate limits and emits authorized location updates', async () => {
    const recordedAt = '2026-01-01T10:00:00.000Z';
    await gateway.publishDriverLocation(socket, {
      tenantId,
      latitude: 9.03,
      longitude: 38.74,
      recordedAt,
    });

    expect(authorize).toHaveBeenCalledWith(expect.objectContaining({ action: 'publish-location' }));
    expect(socket.to).toHaveBeenCalledWith(`tenant:${tenantId}`);
    expect(emit).toHaveBeenCalledWith(
      'driver:location:updated',
      expect.objectContaining({
        tenantId,
        driverUserId: 'driver-1',
        latitude: 9.03,
        longitude: 38.74,
        recordedAt,
      }),
    );
  });

  it('fails closed when authorization denies access', async () => {
    authorize.mockResolvedValue({ allowed: false });

    await expect(gateway.subscribeToTenant(socket, { tenantId })).rejects.toBeInstanceOf(
      WsException,
    );
    expect(socket.join).not.toHaveBeenCalled();
  });
});
