import { Injectable } from '@nestjs/common';
import { GlobalRedisRepositoryBase } from '@app/redis-store';
import { VerificationSessionRepositoryPort } from '../application/ports';
import { VerificationSession } from '../domain/verification-session.entity';
import { VerificationSessionKey } from '../domain/verification-session-key.vo';
import { VerificationSessionMapper } from './verification-session.mapper';

@Injectable()
export class VerificationSessionRedisRepository
  extends GlobalRedisRepositoryBase<VerificationSession, VerificationSessionKey>
  implements VerificationSessionRepositoryPort
{
  constructor(private readonly mapper: VerificationSessionMapper) {
    super();
  }

  protected buildNamespace(): string {
    return 'identity:verification-session';
  }

  protected serialize(value: VerificationSession): unknown {
    return this.mapper.toPersistence(value);
  }

  protected deserialize(raw: unknown): VerificationSession {
    return this.mapper.toDomain(raw);
  }
}
