import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';

import { LoginCommand } from './login.command';
import { AuthTokenProviderPort, UserRepositoryPort } from '../../../ports';
import {
  UserSuspendedError,
  UserNotVerifiedError,
} from '../../../../domain/user.errors';
import { UserParser } from '../../../user.parser';
import { UserResponseDto } from '../../../dto/user.response.dto';
import { HasherPort, TYPES } from '@app/shared-kernel';
import { InvalidCredentialsError } from '../../../errors';

import { AuditFactory } from '@app/audit';
import { RequestContextAccessor } from '@app/context';

const FAKE_HASH =
  '$2b$10$CjwKJ8FakeHashJustForTimingAAAAAAAAAAAAAAAAAAAAAAAAAA';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,

    @Inject(TYPES.AuthTokenProvider)
    private readonly authTokenProvider: AuthTokenProviderPort,

    @Inject(TYPES.HasherPort)
    private readonly hasher: HasherPort,

    @Inject(TYPES.RequestContextAccessor)
    private readonly requestContext: RequestContextAccessor,
  ) {}

  async execute(
    command: LoginCommand,
  ): Promise<
    Result<
      UserResponseDto,
      | InvalidCredentialsError
      | UserSuspendedError
      | UserNotVerifiedError
    >
  > {
    const { phoneNumber, password } = command;

    const foundUser = await this.userRepository.findByPhoneNumber(phoneNumber);
    const user = foundUser.isSome() ? foundUser.unwrap() : null;

    const passwordHash = user?.passwordHash ?? FAKE_HASH;
    const passwordValid = await this.hasher.compare(password, passwordHash);

    if (!user || !passwordValid) {
      return Err(new InvalidCredentialsError());
    }

    const canAuthenticate = user.assertCanAuthenticate();
    if (canAuthenticate.isErr()) {
      return Err(canAuthenticate.unwrapErr());
    }

    user.reactivate();

    const { accessToken, refreshToken } =
      await this.authTokenProvider.generateAuthTokens({
        userId: user.id,
        phoneNumber: user.phoneNumber,
      });

    user.updateRefreshToken(await this.hasher.hash(refreshToken));

    const ctx = this.requestContext.get();
    const audit = AuditFactory.createForUpdate(
      ctx.phoneNumber,
      user.audit,
    );

    user.updateAudit(audit);

    await this.userRepository.save(user);

    return Ok({
      ...UserParser.createUserResponse(user),
      tokens: { accessToken, refreshToken },
    });
  }
}
