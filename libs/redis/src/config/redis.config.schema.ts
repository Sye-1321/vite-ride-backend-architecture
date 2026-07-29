import { z } from 'zod';

export const redisSchema = z.object({
  REDIS_URL: z.string().url('REDIS_URL must be a valid URI').nonempty('REDIS_URL is required'),
});

export type RedisConfig = z.infer<typeof redisSchema>;
