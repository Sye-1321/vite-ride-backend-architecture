import { Module } from '@nestjs/common';
import { RedisClientModule } from '@app/redis';

@Module({
  imports: [RedisClientModule],
  exports: [RedisClientModule],
})
export class RedisStoreModule {}
