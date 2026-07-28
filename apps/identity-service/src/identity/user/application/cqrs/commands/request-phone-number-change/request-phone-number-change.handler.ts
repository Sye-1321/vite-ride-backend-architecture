import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RequestPhoneNumberChangeCommand } from './request-phone-number-change.command';
import { HasherPort, TYPES } from '@app/shared-kernel';
import { UserRepositoryPort } from '../../../ports';
import { IVerificationSessionService } from 'apps/identity-service/src/identity/verification-session/application/services/verification-session.service.interface';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import { NotFoundException } from '@app/common';
import { PhoneNumberUnchangedError } from '../../../../domain/user.errors';
import { InvalidCredentialsError, PhoneNumberAlreadyInUseError } from '../../../errors';
import {
  VerificationChannel,
  VerificationTarget,
} from 'apps/identity-service/src/identity/verification-session/domain/verification-session.types';
import { UserVerificationPurpose } from '../../../types';

export type RequestPhoneNumberChangeResult = {
  verificationToken: string;
};

@CommandHandler(RequestPhoneNumberChangeCommand)
export class RequestPhoneNumberChangeHandler
  implements ICommandHandler<RequestPhoneNumberChangeCommand>
{
  constructor(
    @Inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,

    @Inject(TYPES.IVerificationSessionService)
    private readonly verificationSessionService: IVerificationSessionService,

    @Inject(TYPES.HasherPort)
    private readonly hasher: HasherPort,
  ) {}

  async execute(
    command: RequestPhoneNumberChangeCommand,
  ): Promise<
    Result<
      RequestPhoneNumberChangeResult,
      NotFoundException | PhoneNumberUnchangedError | PhoneNumberAlreadyInUseError | Error
    >
  > {
    const { userId, newPhoneNumber, currentPassword } = command;

    const foundUser = await this.userRepository.findById(userId);
    if (foundUser.isNone()) {
      return Err(new NotFoundException('User not found'));
    }

    const user = foundUser.unwrap();

    const phoneChangeCheck = user.checkPhoneNumberChangePossible(newPhoneNumber);
    if (phoneChangeCheck.isErr()) {
      return Err(phoneChangeCheck.unwrapErr());
    }

    const existing = await this.userRepository.findByPhoneNumber(newPhoneNumber);
    if (existing.isSome()) {
      return Err(new PhoneNumberAlreadyInUseError());
    }

    const passwordValid = await this.hasher.compare(currentPassword, user.passwordHash);
    if (!passwordValid) {
      return Err(new InvalidCredentialsError());
    }

    const target: VerificationTarget = {
      channel: VerificationChannel.SMS,
      phoneNumber: newPhoneNumber,
    };

    const sessionResult = await this.verificationSessionService.requestSession(
      target,
      UserVerificationPurpose.PHONE_NUMBER_CHANGE,
      {
        userId: user.id,
        newPhoneNumber,
      },
    );

    if (sessionResult.isErr()) {
      return Err(sessionResult.unwrapErr());
    }

    return Ok(sessionResult.unwrap());
  }
}
