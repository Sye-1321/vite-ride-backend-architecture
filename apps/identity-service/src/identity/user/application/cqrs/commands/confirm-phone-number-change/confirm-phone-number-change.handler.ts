import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';

import { ConfirmPhoneNumberChangeCommand } from './confirm-phone-number-change.command';
import { TYPES } from '@app/shared-kernel';

import { UserRepositoryPort } from '../../../ports';
import { IVerificationSessionService } from
  'apps/identity-service/src/identity/verification-session/application/services/verification-session.service.interface';

import { UserVerificationPurpose } from '../../../types';

import {
  InvalidOtpError,
  VerificationSessionNotFoundError,
} from
  'apps/identity-service/src/identity/verification-session/application/errors';

import {
  VerificationSessionExpiredError,
  VerificationSessionUsedError,
} from
  'apps/identity-service/src/identity/verification-session/domain/verification-session.error';

import {
  PhoneNumberAlreadyInUseError,
  UserNotFoundInvariantViolationError,
} from '../../../errors';

import { PhoneNumberUnchangedError } from '../../../../domain/user.errors';

import { AuditFactory } from '@app/audit';
import { RequestContextAccessor } from '@app/context';

type ConfirmPhoneNumberChangeErrors =
  | InvalidOtpError
  | VerificationSessionNotFoundError
  | VerificationSessionExpiredError
  | VerificationSessionUsedError
  | PhoneNumberAlreadyInUseError
  | PhoneNumberUnchangedError
  | UserNotFoundInvariantViolationError;

@CommandHandler(ConfirmPhoneNumberChangeCommand)
export class ConfirmPhoneNumberChangeHandler
  implements ICommandHandler<ConfirmPhoneNumberChangeCommand>
{
  constructor(
    @Inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,

    @Inject(TYPES.IVerificationSessionService)
    private readonly verificationSessionService: IVerificationSessionService,

    @Inject(TYPES.RequestContextAccessor)
    private readonly requestContext: RequestContextAccessor,
  ) {}

  async execute(
    command: ConfirmPhoneNumberChangeCommand,
  ): Promise<Result<void, ConfirmPhoneNumberChangeErrors>> {
    const { otp, verificationToken } = command;

    const sessionResult =
      await this.verificationSessionService.verifySession(
        verificationToken,
        UserVerificationPurpose.PHONE_NUMBER_CHANGE,
        otp,
      );

    if (sessionResult.isErr()) {
      return Err(sessionResult.unwrapErr());
    }

    const { subjectMeta } = sessionResult.unwrap();
    const { userId, newPhoneNumber } = subjectMeta as {
      userId: string;
      newPhoneNumber: string;
    };

    const foundUser = await this.userRepository.findById(userId);
    if (foundUser.isNone()) {
      return Err(new UserNotFoundInvariantViolationError());
    }

    const user = foundUser.unwrap();

    const checkResult =
      user.checkPhoneNumberChangePossible(newPhoneNumber);

    if (checkResult.isErr()) {
      return Err(checkResult.unwrapErr());
    }

    const existingUser =
      await this.userRepository.findByPhoneNumber(newPhoneNumber);

    if (existingUser.isSome()) {
      return Err(new PhoneNumberAlreadyInUseError());
    }

    const ctx = this.requestContext.get();
    const audit = AuditFactory.createForUpdate(
      ctx.phoneNumber,
      user.audit,
    );

    user.finalizePhoneNumberChange(newPhoneNumber);
    user.updateAudit(audit);

    await this.userRepository.save(user);

    return Ok(undefined);
  }
}
