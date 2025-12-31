import { ExceptionBase } from '@app/common/exceptions';

export class PhoneNumberAlreadyInUseError extends ExceptionBase {
  static readonly message = 'Phone number is already in use.';
  public readonly code = 'USER.PHONE.ALREADY_IN_USE';

  constructor(metadata?: unknown, cause?: Error) {
    super(PhoneNumberAlreadyInUseError.message, cause, metadata);
  }
}
