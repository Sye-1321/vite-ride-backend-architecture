import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';

import { RedisClientPort } from '@app/redis';
import { TYPES } from '@app/shared-kernel';

import { AuthorizationGrpcClient } from '../authorization/authorization.grpc.client';
import { TenantsGrpcClient } from '../tenants/tenants.grpc.client';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(TYPES.RedisClientPort)
    private readonly redis: RedisClientPort,
    private readonly authorization: AuthorizationGrpcClient,
    private readonly tenants: TenantsGrpcClient,
  ) {}

  @Get('live')
  live(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Get('ready')
  async ready(): Promise<{
    status: 'ready';
    checks: Record<string, 'up'>;
  }> {
    try {
      const [redis, authorization, tenants] = await Promise.all([
        this.redis.getClient().ping(),
        this.authorization.health(),
        this.tenants.health(),
      ]);
      if (redis !== 'PONG' || authorization.status !== 'SERVING' || tenants.status !== 'SERVING') {
        throw new Error('A readiness dependency is not serving');
      }
      return {
        status: 'ready',
        checks: { redis: 'up', authorization: 'up', tenants: 'up' },
      };
    } catch {
      throw new ServiceUnavailableException('Service is not ready');
    }
  }
}
