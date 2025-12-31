import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';

import { ChangePasswordCommand } from './change-password.command';
import { TYPES } from '@app/shared-kernel';

import { UserRepositoryPort } from '../../../ports';
import { HasherPort } from '@app/shared-kernel';
import { NotFoundException } from '@app/common';

import { IncorrectCurrentPasswordError } from '../../../errors';
import { NewPasswordSameAsCurrentError } from '../../../errors/new-password-same-as-current.error';

import { AuditFactory } from '@app/audit';
import { RequestContextAccessor } from '@app/context';

type ChangePasswordErrors =
  | NotFoundException
  | IncorrectCurrentPasswordError
  | NewPasswordSameAsCurrentError;

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler
  implements ICommandHandler<ChangePasswordCommand>
{
  constructor(
    @Inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,

    @Inject(TYPES.HasherPort)
    private readonly hasher: HasherPort,

    @Inject(TYPES.RequestContextAccessor)
    private readonly requestContext: RequestContextAccessor,
  ) {}

  async execute(
    command: ChangePasswordCommand,
  ): Promise<Result<void, ChangePasswordErrors>> {
    const { userId, currentPassword, newPassword } = command;

    const found = await this.userRepository.findById(userId);
    if (found.isNone()) {
      return Err(new NotFoundException('User not found'));
    }

    const user = found.unwrap();

    const currentPasswordValid = await this.hasher.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!currentPasswordValid) {
      return Err(new IncorrectCurrentPasswordError());
    }

    if (currentPassword === newPassword) {
      return Err(new NewPasswordSameAsCurrentError());
    }

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
