import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';

import { ConfirmPasswordResetCommand } from './confirm-password-reset.command';
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

import { HasherPort } from '@app/shared-kernel';
import { UserNotFoundInvariantViolationError } from '../../../errors';

import { AuditFactory } from '@app/audit';
import { RequestContextAccessor } from '@app/context';

type ConfirmPasswordResetErrors =
  | InvalidOtpError
  | VerificationSessionNotFoundError
  | VerificationSessionExpiredError
  | VerificationSessionUsedError
  | UserNotFoundInvariantViolationError;

@CommandHandler(ConfirmPasswordResetCommand)
export class ConfirmPasswordResetHandler
  implements ICommandHandler<ConfirmPasswordResetCommand>
{
  constructor(
    @Inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,

    @Inject(TYPES.IVerificationSessionService)
    private readonly verificationSessionService: IVerificationSessionService,

    @Inject(TYPES.HasherPort)
    private readonly hasher: HasherPort,

    @Inject(TYPES.RequestContextAccessor)
    private readonly requestContext: RequestContextAccessor,
  ) {}

  async execute(
    command: ConfirmPasswordResetCommand,
  ): Promise<Result<void, ConfirmPasswordResetErrors>> {
    const { otp, verificationToken, newPassword } = command;

    const sessionResult =
      await this.verificationSessionService.verifySession(
        verificationToken,
        UserVerificationPurpose.PASSWORD_RESET,
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

    const newPasswordHash = await this.hasher.hash(newPassword);

    const ctx = this.requestContext.get();
    const audit = AuditFactory.createForUpdate(
      ctx.phoneNumber,
      user.audit,
    );

    user.updatePasswordHash(newPasswordHash);
    user.updateAudit(audit);

    await this.userRepository.save(user);

    return Ok(undefined);
  }
}
