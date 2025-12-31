import { ExceptionBase } from '@app/common/exceptions';

export class InvalidRefreshTokenError extends ExceptionBase {
  static readonly message = 'Access denied.';
  public readonly code = 'AUTH.REFRESH_TOKEN.INVALID';

  constructor(metadata?: unknown, cause?: Error) {
    super(InvalidRefreshTokenError.message, cause, metadata);
  }
}