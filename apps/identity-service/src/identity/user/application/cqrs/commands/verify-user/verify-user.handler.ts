import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';

import { VerifyUserCommand } from './verify-user.command';
import { TYPES } from '@app/shared-kernel';

import { UserRepositoryPort } from '../../../ports';
import { UserVerificationPurpose } from '../../../types';

import {
  InvalidOtpError,
  VerificationSessionNotFoundError,
} from 'apps/identity-service/src/identity/verification-session/application/errors';

import {
  VerificationSessionExpiredError,
  VerificationSessionUsedError,
} from 'apps/identity-service/src/identity/verification-session/domain/verification-session.error';

import { IVerificationSessionService } from 'apps/identity-service/src/identity/verification-session/application/services/verification-session.service.interface';

import { UserNotFoundInvariantViolationError } from '../../../errors';
import { UserAlreadyVerifiedError } from '../../../../domain/user.errors';

import { AuditFactory } from '@app/audit';
import { RequestContextAccessor } from '@app/context';

type VerifyUserErrors =
  | InvalidOtpError
  | VerificationSessionNotFoundError
  | VerificationSessionExpiredError
  | VerificationSessionUsedError
  | UserAlreadyVerifiedError
  | UserNotFoundInvariantViolationError;

@CommandHandler(VerifyUserCommand)
export class VerifyUserHandler implements ICommandHandler<VerifyUserCommand> {
  constructor(
    @Inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,

    @Inject(TYPES.IVerificationSessionService)
    private readonly verificationSessionService: IVerificationSessionService,

    @Inject(TYPES.RequestContextAccessor)
    private readonly requestContext: RequestContextAccessor,
  ) {}

  async execute(command: VerifyUserCommand): Promise<Result<void, VerifyUserErrors>> {
    const { otp, verificationToken } = command;

    const sessionResult = await this.verificationSessionService.verifySession(
      verificationToken,
      UserVerificationPurpose.ACCOUNT_VERIFICATION,
      otp,
    );

    if (sessionResult.isErr()) {
      return Err(sessionResult.unwrapErr());
    }

    const { subjectMeta } = sessionResult.unwrap();
    const userId = subjectMeta.userId as string;

    const foundUser = await this.userRepository.findById(userId);
    if (foundUser.isNone()) {
      return Err(new UserNotFoundInvariantViolationError());
    }

    const user = foundUser.unwrap();

    const activateResult = user.activate();
    if (activateResult.isErr()) {
      return Err(activateResult.unwrapErr());
    }

    const ctx = this.requestContext.get();
    const audit = AuditFactory.createForUpdate(ctx.phoneNumber, user.audit);

    user.updateAudit(audit);

    await this.userRepository.save(user);

    return Ok(undefined);
  }
}
