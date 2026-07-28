import { Result } from 'oxide.ts';
import { VerificationTarget } from '../../domain/verification-session.types';
import { InvalidOtpError, VerificationSessionNotFoundError } from '../errors';
import {
  VerificationSessionExpiredError,
  VerificationSessionUsedError,
} from '../../domain/verification-session.error';
import { UserVerificationPurpose } from '../../../user/application/types';

export interface IVerificationSessionService {
  requestSession(
    target: VerificationTarget,
    purpose: UserVerificationPurpose,
    subjectMeta: Record<string, any>,
  ): Promise<Result<{ verificationToken: string }, Error>>;

  verifySession(
    verificationToken: string,
    purpose: UserVerificationPurpose,
    otp: string,
  ): Promise<
    Result<
      { subjectMeta: Record<string, any> },
      | VerificationSessionNotFoundError
      | VerificationSessionExpiredError
      | VerificationSessionUsedError
      | InvalidOtpError
    >
  >;

  resendSession(
    verificationToken: string,
    purpose: UserVerificationPurpose,
  ): Promise<Result<{ verificationToken: string }, VerificationSessionNotFoundError | Error>>;
}
