import type { Redis as RedisClient } from 'ioredis';

export interface RedisClientPort {
  getClient(): RedisClient;

  getPubSubClients?(): Promise<{
    pubClient: RedisClient;
    subClient: RedisClient;
  }>;
}
