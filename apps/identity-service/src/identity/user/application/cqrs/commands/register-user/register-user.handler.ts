import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';

import { RegisterUserCommand } from './register-user.command';
import { TYPES, HasherPort } from '@app/shared-kernel';

import { UserRepositoryPort } from '../../../ports';
import { PhoneNumberAlreadyInUseError } from '../../../errors';

import { User } from '../../../../domain/user.entity';
import { UserProps } from '../../../../domain/user.types';

import { IVerificationSessionService } from 'apps/identity-service/src/identity/verification-session/application/services/verification-session.service.interface';

import {
  VerificationChannel,
  SmsTarget,
} from 'apps/identity-service/src/identity/verification-session/domain/verification-session.types';

import { AuditFactory } from '@app/audit';
import { UserVerificationPurpose } from '../../../types';
import { RequestContextAccessor } from '@app/context';
import { ConflictException } from '@app/common';

type RegisterUserErrors = PhoneNumberAlreadyInUseError | Error;

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,

    @Inject(TYPES.HasherPort)
    private readonly hasher: HasherPort,

    @Inject(TYPES.IVerificationSessionService)
    private readonly verificationSessionService: IVerificationSessionService,

    @Inject(TYPES.RequestContextAccessor)
    private readonly requestContext: RequestContextAccessor,
  ) {}

  async execute(
    command: RegisterUserCommand,
  ): Promise<Result<{ verificationToken: string }, RegisterUserErrors>> {
    const { firstName, lastName, phoneNumber, password } = command;

    const ctx = this.requestContext.get();

    const passwordHash = await this.hasher.hash(password);

    const audit = AuditFactory.createForCreate(ctx.phoneNumber);

    const userProps: Omit<UserProps, 'status' | 'refreshTokenHash'> = {
      firstName,
      lastName,
      phoneNumber,
      passwordHash,
      audit,
    };

    const user = User.create(userProps);

    try {
      await this.userRepository.insert(user);
    } catch (error: unknown) {
      if (error instanceof ConflictException) {
        return Err(new PhoneNumberAlreadyInUseError());
      }
      return Err(error as Error);
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

    return Ok({
      verificationToken: sessionResult.unwrap().verificationToken,
    });
  }
}
