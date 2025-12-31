import { Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Option, Some, None } from 'oxide.ts';
import { KeyValueStorePort, ValueObject } from '@app/shared-kernel';
import { TYPES } from '@app/shared-kernel';
import { RedisClientPort } from '@app/redis';

export abstract class GlobalRedisRepositoryBase<
  Value,
  Key extends ValueObject<any>,
> implements KeyValueStorePort<Value, Key> {
  @Inject(TYPES.RedisClientPort)
  protected readonly redisClientPort: RedisClientPort;

  protected get redisClient(): Redis {
    return this.redisClientPort.getClient();
  }

  protected abstract buildNamespace(): string;
  protected abstract serialize(value: Value): unknown;
  protected abstract deserialize(raw: unknown): Value;

  protected buildKey(key: Key): string {
    return `${this.buildNamespace()}:${JSON.stringify(key.unpack())}`;
  }

  async insert(
    value: Value,
    key: Key,
    ttlSeconds?: number,
  ): Promise<void> {
    const redisKey = this.buildKey(key);
    const payload = JSON.stringify(this.serialize(value));

    if (ttlSeconds && ttlSeconds > 0) {
      await this.redisClient.set(redisKey, payload, 'EX', ttlSeconds);
    } else {
      await this.redisClient.set(redisKey, payload);
    }
  }

  async findOne(key: Key): Promise<Option<Value>> {
    const raw = await this.redisClient.get(this.buildKey(key));
    if (!raw) return None;
    return Some(this.deserialize(JSON.parse(raw)));
  }

  async exists(key: Key): Promise<boolean> {
    return (await this.redisClient.exists(this.buildKey(key))) > 0;
  }

  async delete(key: Key): Promise<boolean> {
    return (await this.redisClient.del(this.buildKey(key))) > 0;
  }
}
