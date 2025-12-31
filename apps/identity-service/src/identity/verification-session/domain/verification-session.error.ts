import { ExceptionBase } from '@app/common/exceptions';

export class VerificationSessionExpiredError extends ExceptionBase {
  static readonly message = 'Verification session expired';

  public readonly code = 'VERIFICATION_SESSION.EXPIRED';

  constructor(cause?: Error, metadata?: unknown) {
    super(VerificationSessionExpiredError.message, cause, metadata);
  }
}

export class VerificationSessionUsedError extends ExceptionBase {
  static readonly message = 'Verification session already used';

  public readonly code = 'VERIFICATION_SESSION.ALREADY_USED';

  constructor(cause?: Error, metadata?: unknown) {
    super(VerificationSessionUsedError.message, cause, metadata);
  }
}
