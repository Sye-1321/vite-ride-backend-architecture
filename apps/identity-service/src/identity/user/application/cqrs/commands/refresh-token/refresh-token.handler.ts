import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';

import { TYPES } from '@app/shared-kernel';

import { UserRepositoryPort } from '../../../ports';
import { AuthTokenProviderPort } from '@app/auth';
import { HasherPort } from '@app/shared-kernel';

import { RefreshAccessTokenCommand } from './refresh-token.command';
import { NotFoundException } from '@app/common';
import { InvalidRefreshTokenError } from '../../../errors';

import { AuditFactory } from '@app/audit';
import { RequestContextAccessor } from '@app/context';

type RefreshAccessTokenErrors = InvalidRefreshTokenError | NotFoundException;

@CommandHandler(RefreshAccessTokenCommand)
export class RefreshAccessTokenHandler implements ICommandHandler<RefreshAccessTokenCommand> {
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
    command: RefreshAccessTokenCommand,
  ): Promise<Result<{ accessToken: string }, RefreshAccessTokenErrors>> {
    const { userId, refreshToken } = command;

    const foundUser = await this.userRepository.findById(userId);
    if (foundUser.isNone()) {
      return Err(new NotFoundException('User not found'));
    }

    const user = foundUser.unwrap();

    if (!user.refreshTokenHash) {
      return Err(new InvalidRefreshTokenError());
    }

    const refreshTokenValid = await this.hasher.compare(refreshToken, user.refreshTokenHash);

    if (!refreshTokenValid) {
      user.invalidateRefreshToken();

      const ctx = this.requestContext.get();
      const audit = AuditFactory.createForUpdate(ctx.phoneNumber, user.audit);

      user.updateAudit(audit);
      await this.userRepository.save(user);

      return Err(new InvalidRefreshTokenError());
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authTokenProvider.generateAuthTokens({
        userId: user.id,
        phoneNumber: user.phoneNumber,
      });

    user.updateRefreshToken(await this.hasher.hash(newRefreshToken));

    const ctx = this.requestContext.get();
    const audit = AuditFactory.createForUpdate(ctx.phoneNumber, user.audit);

    user.updateAudit(audit);
    await this.userRepository.save(user);

    return Ok({ accessToken });
  }
}
