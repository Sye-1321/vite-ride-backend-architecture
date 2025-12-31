import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';

import { TYPES } from '@app/shared-kernel';
import { IVerificationSessionService } from
  'apps/identity-service/src/identity/verification-session/application/services/verification-session.service.interface';
import { ResendVerificationCommand } from './resend-verification-otp.command';
import { VerificationSessionNotFoundError } from
  'apps/identity-service/src/identity/verification-session/application/errors';


type ResendVerificationErrors =
  | VerificationSessionNotFoundError
  | Error;

@CommandHandler(ResendVerificationCommand)
export class ResendVerificationHandler
  implements ICommandHandler<ResendVerificationCommand>
{
  constructor(
    @Inject(TYPES.IVerificationSessionService)
    private readonly verificationSessionService: IVerificationSessionService,
  ) {}

  async execute(
    command: ResendVerificationCommand,
  ): Promise<Result<{ verificationToken: string }, ResendVerificationErrors>> {
    const { verificationToken, purpose } = command;

    const sessionResult =
      await this.verificationSessionService.resendSession(
        verificationToken,
        purpose,
      );

    if (sessionResult.isErr()) {
      return Err(sessionResult.unwrapErr());
    }

    return Ok(sessionResult.unwrap());
  }
}
