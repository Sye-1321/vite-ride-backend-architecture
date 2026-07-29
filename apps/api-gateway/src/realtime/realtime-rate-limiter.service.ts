import { Inject, Injectable } from '@nestjs/common';

import { RedisClientPort } from '@app/redis';
import { TYPES } from '@app/shared-kernel';

@Injectable()
export class RealtimeRateLimiter {
  constructor(
    @Inject(TYPES.RedisClientPort)
    private readonly redis: RedisClientPort,
  ) {}

  async consume(subject: string, maximum: number, windowMilliseconds: number): Promise<boolean> {
    const bucket = Math.floor(Date.now() / windowMilliseconds);
    const key = `realtime:limit:${subject}:${bucket}`;
    const result = await this.redis
      .getClient()
      .multi()
      .incr(key)
      .pexpire(key, windowMilliseconds * 2)
      .exec();
    const count = result?.[0]?.[1];
    return typeof count === 'number' && count <= maximum;
  }
}
