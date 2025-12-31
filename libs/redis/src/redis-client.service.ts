import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import Redis, { Redis as RedisClient } from 'ioredis';

import { RedisClientPort } from './redis-client.port';
import { RedisConfig } from './config/redis.config.schema';


@Injectable()
export class RedisClientService implements RedisClientPort, OnModuleDestroy {
  private readonly config: RedisConfig;
  private readonly client: RedisClient;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<RedisConfig>('redis', { infer: true });

    this.client = new Redis(this.config.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: times => Math.min(times * 100, 3000),
      connectTimeout: 5000,
      enableReadyCheck: false,
    });
  }

  getClient(): RedisClient {
    return this.client;
  }

  async getPubSubClients(): Promise<{ pubClient: RedisClient; subClient: RedisClient }> {
    const pubClient = this.client.duplicate();
    const subClient = this.client.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    return { pubClient, subClient };
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
