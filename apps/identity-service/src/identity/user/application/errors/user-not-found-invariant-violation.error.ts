import { ExceptionBase } from '@app/common/exceptions';

export class UserNotFoundInvariantViolationError extends ExceptionBase {
  static readonly message =
    'Invariant violation: expected user was not found.';

  public readonly code = 'INVARIANT.USER.NOT_FOUND';

  constructor(metadata?: unknown, cause?: Error) {
    super(UserNotFoundInvariantViolationError.message, cause, metadata);
  }
}
