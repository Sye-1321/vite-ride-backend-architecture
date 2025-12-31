import { ExceptionBase } from '@app/common/exceptions';

export class InvalidCredentialsError extends ExceptionBase {
  static readonly message = 'Invalid credentials provided.';
  public readonly code = 'AUTH.INVALID_CREDENTIALS';

  constructor(metadata?: unknown, cause?: Error) {
    super(InvalidCredentialsError.message, cause, metadata);
  }
}
