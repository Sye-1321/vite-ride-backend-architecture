import { ExceptionBase } from '@app/common/exceptions';

export class IncorrectCurrentPasswordError extends ExceptionBase {
  static readonly message = 'Current password is incorrect.';
  public readonly code = 'USER.PASSWORD.INCORRECT_CURRENT';

  constructor(metadata?: unknown, cause?: Error) {
    super(IncorrectCurrentPasswordError.message, cause, metadata);
  }
}
