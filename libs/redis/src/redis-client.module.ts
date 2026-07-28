import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import redisConfig from './config/redis.config';
import { RedisClientService } from './redis-client.service';
import { TYPES } from 'libs/shared-kernel/src/di-tokens';

@Global()
@Module({
  imports: [ConfigModule.forFeature(redisConfig)],
  providers: [
    {
      provide: TYPES.RedisClientPort,
      useClass: RedisClientService,
    },
  ],
  exports: [TYPES.RedisClientPort],
})
export class RedisClientModule {}
