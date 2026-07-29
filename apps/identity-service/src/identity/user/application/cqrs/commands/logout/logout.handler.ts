import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';

import { LogoutCommand } from './logout.command';
import { TYPES } from '@app/shared-kernel';
import { UserRepositoryPort } from '../../../ports';
import { NotFoundException } from '@app/common';

import { AuditFactory } from '@app/audit';
import { RequestContextAccessor } from '@app/context';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    @Inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,

    @Inject(TYPES.RequestContextAccessor)
    private readonly requestContext: RequestContextAccessor,
  ) {}

  async execute(command: LogoutCommand): Promise<Result<void, NotFoundException>> {
    const foundUser = await this.userRepository.findById(command.userId);

    if (foundUser.isNone()) {
      return Err(new NotFoundException('User not found'));
    }

    const user = foundUser.unwrap();

    user.invalidateRefreshToken();

    const ctx = this.requestContext.get();
    const audit = AuditFactory.createForUpdate(ctx.phoneNumber, user.audit);

    user.updateAudit(audit);

    await this.userRepository.save(user);

    return Ok(undefined);
  }
}
