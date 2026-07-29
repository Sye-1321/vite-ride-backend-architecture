import { ServiceUnavailableException } from '@nestjs/common';

import { RedisClientPort } from '@app/redis';

import { AuthorizationGrpcClient } from '../authorization/authorization.grpc.client';
import { TenantsGrpcClient } from '../tenants/tenants.grpc.client';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  const ping = jest.fn();
  const authorizationHealth = jest.fn();
  const tenantsHealth = jest.fn();
  const controller = new HealthController(
    { getClient: () => ({ ping }) } as unknown as RedisClientPort,
    { health: authorizationHealth } as unknown as AuthorizationGrpcClient,
    { health: tenantsHealth } as unknown as TenantsGrpcClient,
  );

  beforeEach(() => {
    ping.mockResolvedValue('PONG');
    authorizationHealth.mockResolvedValue({ status: 'SERVING' });
    tenantsHealth.mockResolvedValue({ status: 'SERVING' });
  });

  it('reports readiness only when infrastructure and upstreams serve', async () => {
    await expect(controller.ready()).resolves.toMatchObject({
      status: 'ready',
      checks: { redis: 'up', authorization: 'up', tenants: 'up' },
    });
  });

  it('fails readiness when a dependency is degraded', async () => {
    tenantsHealth.mockResolvedValue({ status: 'NOT_SERVING' });

    await expect(controller.ready()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
