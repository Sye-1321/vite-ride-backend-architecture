import { Module } from '@nestjs/common';
import { RedisStoreModule } from '@app/redis-store';
import { VerificationSessionService } from './application/services/verification-session.service';
import { TYPES } from '@app/shared-kernel';
import { VerificationSessionMapper, VerificationSessionRedisRepository } from './infrastructure';

@Module({
  imports: [RedisStoreModule],
  providers: [
    VerificationSessionMapper,
    { provide: TYPES.IVerificationSessionService, useClass: VerificationSessionService },
    { provide: TYPES.VerificationSessionRepository, useClass: VerificationSessionRedisRepository },
  ],
  exports: [TYPES.IVerificationSessionService],
})
export class VerificationSessionModule {}
