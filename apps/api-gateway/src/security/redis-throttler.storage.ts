import { Inject, Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';

import { RedisClientPort } from '@app/redis';
import { TYPES } from '@app/shared-kernel';

const INCREMENT_SCRIPT = `
local blockTtl = redis.call('PTTL', KEYS[2])
if blockTtl > 0 then
  return { tonumber(ARGV[2]) + 1, redis.call('PTTL', KEYS[1]), 1, blockTtl }
end
local hits = redis.call('INCR', KEYS[1])
if hits == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
if hits > tonumber(ARGV[2]) then
  local duration = math.max(tonumber(ARGV[3]), ttl)
  redis.call('SET', KEYS[2], '1', 'PX', duration)
  return { hits, ttl, 1, duration }
end
return { hits, ttl, 0, 0 }
`;

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(
    @Inject(TYPES.RedisClientPort)
    private readonly redis: RedisClientPort,
  ) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<{
    totalHits: number;
    timeToExpire: number;
    isBlocked: boolean;
    timeToBlockExpire: number;
  }> {
    const namespace = `http-limit:${throttlerName}:${key}`;
    const result = (await this.redis
      .getClient()
      .eval(INCREMENT_SCRIPT, 2, namespace, `${namespace}:blocked`, ttl, limit, blockDuration)) as [
      number,
      number,
      number,
      number,
    ];

    return {
      totalHits: result[0],
      timeToExpire: Math.max(result[1], 0),
      isBlocked: result[2] === 1,
      timeToBlockExpire: Math.max(result[3], 0),
    };
  }
}
