import { ExceptionBase } from './exception.base';
import { INTERNAL_SERVER_ERROR, NOT_FOUND, CONFLICT, ARGUMENT_INVALID } from './exception.codes';

import {
  NotFoundException,
  ConflictException,
  ArgumentInvalidException,
  InternalServerErrorException,
} from './exceptions';

/**
 * Maps domain and application errors into canonical ExceptionBase instances.
 * This function must remain transport-agnostic.
 */
export function mapDomainErrorToException(error: unknown): ExceptionBase {
  if (error instanceof ExceptionBase) {
    return error;
  }

  if (error instanceof Error) {
    const name = error.constructor.name;

    switch (name) {
      case 'InvalidCredentialsError':
      case 'InvalidRefreshTokenError':
      case 'IncorrectCurrentPasswordError':
        return new ArgumentInvalidException(error.message, error);

      case 'PhoneNumberAlreadyInUseError':
      case 'UserAlreadyVerifiedError':
        return new ConflictException(error.message, error);

      case 'VerificationSessionNotFoundError':
      case 'UserNotFoundInvariantViolationError':
        return new NotFoundException(error.message);

      default:
        return new InternalServerErrorException(error.message ?? INTERNAL_SERVER_ERROR);
    }
  }

  return new InternalServerErrorException(INTERNAL_SERVER_ERROR);
}
