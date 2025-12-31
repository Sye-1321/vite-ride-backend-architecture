import { ExceptionBase } from '@app/common/exceptions';

export class InvalidOtpError extends ExceptionBase {
  static readonly message = 'Invalid OTP provided';

  public readonly code = 'VERIFICATION_SESSION.INVALID_OTP';

  constructor(cause?: Error, metadata?: unknown) {
    super(InvalidOtpError.message, cause, metadata);
  }
}
