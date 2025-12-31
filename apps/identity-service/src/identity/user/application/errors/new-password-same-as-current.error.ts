import { ExceptionBase } from '@app/common/exceptions';

export class NewPasswordSameAsCurrentError extends ExceptionBase {
  static readonly message = 'New password must differ from current password.';
  public readonly code = 'USER.PASSWORD.REUSE_NOT_ALLOWED';

  constructor(metadata?: unknown, cause?: Error) {
    super(NewPasswordSameAsCurrentError.message, cause, metadata);
  }
}
