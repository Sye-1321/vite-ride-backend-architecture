import { registerAs } from '@nestjs/config';
import { redisSchema, RedisConfig } from './redis.config.schema';

export default registerAs<RedisConfig>('redis', () => {
  return redisSchema.parse(process.env);
});
