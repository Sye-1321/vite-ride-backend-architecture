import { ExceptionBase } from '@app/common/exceptions';


export class UserAlreadyVerifiedError extends ExceptionBase {
  static readonly message = 'User account is already verified.';
  public readonly code = 'USER.ACCOUNT.ALREADY_VERIFIED';

  constructor(metadata?: unknown, cause?: Error) {
    super(UserAlreadyVerifiedError.message, cause, metadata);
  }
}


export class UserSuspendedError extends ExceptionBase {
  static readonly message = 'User account is suspended. Please contact support.';
  public readonly code = 'USER.SUSPENDED';

  constructor(metadata?: unknown, cause?: Error) {
    super(UserSuspendedError.message, cause, metadata);
  }
}

export class UserNotVerifiedError extends ExceptionBase {
  static readonly message = 'User account is not verified.';
  public readonly code = 'USER.NOT_VERIFIED';

  constructor(metadata?: unknown, cause?: Error) {
    super(UserNotVerifiedError.message, cause, metadata);
  }
}

export class PhoneNumberUnchangedError extends ExceptionBase {
  static readonly message =
    'The new phone number must be different from the current phone number.';
  public readonly code = 'USER.PHONE.UNCHANGED';

  constructor(metadata?: unknown, cause?: Error) {
    super(PhoneNumberUnchangedError.message, cause, metadata);
  }
}

