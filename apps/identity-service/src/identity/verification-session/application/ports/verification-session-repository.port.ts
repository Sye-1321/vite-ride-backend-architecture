import { VerificationSession } from '../../domain/verification-session.entity';
import { VerificationSessionKey } from '../../domain/verification-session-key.vo';
import { KeyValueStorePort } from '@app/shared-kernel';

export interface VerificationSessionRepositoryPort
  extends KeyValueStorePort<VerificationSession, VerificationSessionKey> {}
