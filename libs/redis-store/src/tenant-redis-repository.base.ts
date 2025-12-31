import { Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Option, Some, None } from 'oxide.ts';
import { TenantKeyValueStorePort, ValueObject } from '@app/shared-kernel';
import { RequestContextAccessor } from '@app/context';
import { TYPES } from '@app/shared-kernel';

export abstract class TenantRedisRepositoryBase<
  Value,
  Key extends ValueObject<any>,
> implements TenantKeyValueStorePort<Value, Key> {

  @Inject(TYPES.RedisClientPort)
  protected readonly redisClient: Redis;

  protected constructor(
    protected readonly context: RequestContextAccessor,
  ) {}

  protected abstract buildNamespace(): string;

  protected buildKey(key: Key): string {
    const ctx = this.context.get();
    const tenantId = ctx.tenantId;

    if (!tenantId) {
      throw new Error('Tenant context is missing or invalid');
    }

    return `${this.buildNamespace()}:${tenantId}:${JSON.stringify(
      key.unpack(),
    )}`;
  }

  async insert(
    value: Value,
    key: Key,
    ttlSeconds?: number,
  ): Promise<void> {
    const redisKey = this.buildKey(key);
    const payload = JSON.stringify(value);

    if (ttlSeconds && ttlSeconds > 0) {
      await this.redisClient.set(redisKey, payload, 'EX', ttlSeconds);
    } else {
      await this.redisClient.set(redisKey, payload);
    }
  }

  async findOne(key: Key): Promise<Option<Value>> {
    const raw = await this.redisClient.get(this.buildKey(key));
    if (!raw) return None;
    return Some(JSON.parse(raw));
  }

  async exists(key: Key): Promise<boolean> {
    return (await this.redisClient.exists(this.buildKey(key))) > 0;
  }

  async delete(key: Key): Promise<boolean> {
    return (await this.redisClient.del(this.buildKey(key))) > 0;
  }
}
