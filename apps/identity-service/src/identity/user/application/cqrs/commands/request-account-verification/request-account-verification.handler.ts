import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';

import { TYPES } from '@app/shared-kernel';
import { UserRepositoryPort } from '../../../ports';
import { IVerificationSessionService } from 'apps/identity-service/src/identity/verification-session/application/services/verification-session.service.interface';

import { RequestAccountVerificationCommand } from './request-account-verification.command';
import { NotFoundException } from '@app/common';
import {
  SmsTarget,
  VerificationChannel,
} from 'apps/identity-service/src/identity/verification-session/domain';
import { UserVerificationPurpose } from '../../../types';

export type RequestAccountVerificationResult = {
  verificationToken: string;
};

@CommandHandler(RequestAccountVerificationCommand)
export class RequestAccountVerificationHandler
  implements ICommandHandler<RequestAccountVerificationCommand>
{
  constructor(
    @Inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,

    @Inject(TYPES.IVerificationSessionService)
    private readonly verificationSessionService: IVerificationSessionService,
  ) {}

  async execute(
    command: RequestAccountVerificationCommand,
  ): Promise<Result<RequestAccountVerificationResult, NotFoundException | Error>> {
    const { phoneNumber } = command;

    const userResult = await this.userRepository.findByPhoneNumber(phoneNumber);

    if (userResult.isNone()) {
      return Err(new NotFoundException('User not found'));
    }

    const user = userResult.unwrap();

    const invariant = user.assertCanResendVerification();
    if (invariant.isErr()) {
      return Err(invariant.unwrapErr());
    }

    const target: SmsTarget = {
      channel: VerificationChannel.SMS,
      phoneNumber: user.phoneNumber,
    };

    const sessionResult = await this.verificationSessionService.requestSession(
      target,
      UserVerificationPurpose.ACCOUNT_VERIFICATION,
      { userId: user.id },
    );

    if (sessionResult.isErr()) {
      return Err(sessionResult.unwrapErr());
    }

    return Ok(sessionResult.unwrap());
  }
}
