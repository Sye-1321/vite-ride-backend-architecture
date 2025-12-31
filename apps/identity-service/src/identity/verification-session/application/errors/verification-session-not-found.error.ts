import { ExceptionBase } from '@app/common/exceptions';

export class VerificationSessionNotFoundError extends ExceptionBase {
  static readonly message = 'Verification session not found';

  public readonly code = 'VERIFICATION_SESSION.NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(VerificationSessionNotFoundError.message, cause, metadata);
  }
}
