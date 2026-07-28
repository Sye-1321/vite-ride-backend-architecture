import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RequestPasswordResetCommand } from './request-password-reset.command';
import { TYPES } from '@app/shared-kernel';
import { UserRepositoryPort } from '../../../ports';
import { Inject } from '@nestjs/common';
import { IVerificationSessionService } from 'apps/identity-service/src/identity/verification-session/application/services/verification-session.service.interface';
import { NotFoundException } from '@app/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  VerificationChannel,
  VerificationTarget,
} from 'apps/identity-service/src/identity/verification-session/domain/verification-session.types';
import { UserVerificationPurpose } from '../../../types';

export type RequestPasswordResetResult = {
  verificationToken: string;
};

@CommandHandler(RequestPasswordResetCommand)
export class RequestPasswordResetHandler implements ICommandHandler<RequestPasswordResetCommand> {
  constructor(
    @Inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,

    @Inject(TYPES.IVerificationSessionService)
    private readonly verificationSessionService: IVerificationSessionService,
  ) {}

  async execute(
    command: RequestPasswordResetCommand,
  ): Promise<Result<RequestPasswordResetResult, NotFoundException | Error>> {
    const { phoneNumber } = command;

    const foundUser = await this.userRepository.findByPhoneNumber(phoneNumber);
    if (foundUser.isNone()) {
      return Err(new NotFoundException('User not found'));
    }

    const user = foundUser.unwrap();

    const target: VerificationTarget = {
      channel: VerificationChannel.SMS,
      phoneNumber: user.phoneNumber,
    };

    const sessionResult = await this.verificationSessionService.requestSession(
      target,
      UserVerificationPurpose.PASSWORD_RESET,
      { userId: user.id },
    );

    if (sessionResult.isErr()) {
      return Err(sessionResult.unwrapErr());
    }

    return Ok(sessionResult.unwrap());
  }
}
