import { RedisClientPort } from '@app/redis';

import { RedisThrottlerStorage } from './redis-throttler.storage';

describe('RedisThrottlerStorage', () => {
  it('maps the atomic Redis result to the throttler contract', async () => {
    const evalCommand = jest.fn().mockResolvedValue([4, 45_000, 0, 0]);
    const storage = new RedisThrottlerStorage({
      getClient: () => ({ eval: evalCommand }),
    } as unknown as RedisClientPort);

    await expect(storage.increment('client-a', 60_000, 100, 60_000, 'default')).resolves.toEqual({
      totalHits: 4,
      timeToExpire: 45_000,
      isBlocked: false,
      timeToBlockExpire: 0,
    });
    expect(evalCommand).toHaveBeenCalledWith(
      expect.any(String),
      2,
      'http-limit:default:client-a',
      'http-limit:default:client-a:blocked',
      60_000,
      100,
      60_000,
    );
  });
});
