import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';

import { UnsuspendUserCommand } from './unsuspend-user.command';
import { TYPES } from '@app/shared-kernel';
import { UserRepositoryPort } from '../../../ports';
import { NotFoundException } from '@app/common';

import { AuditFactory } from '@app/audit';
import { RequestContextAccessor } from '@app/context';

@CommandHandler(UnsuspendUserCommand)
export class UnsuspendUserHandler
  implements ICommandHandler<UnsuspendUserCommand>
{
  constructor(
    @Inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,

    @Inject(TYPES.RequestContextAccessor)
    private readonly requestContext: RequestContextAccessor,
  ) {}

  async execute(
    command: UnsuspendUserCommand,
  ): Promise<Result<void, NotFoundException>> {
    const found = await this.userRepository.findById(command.userId);

    if (found.isNone()) {
      return Err(new NotFoundException('User not found'));
    }

    const user = found.unwrap();

    const ctx = this.requestContext.get();
    const audit = AuditFactory.createForUpdate(
      ctx.phoneNumber,
      user.audit,
    );

    user.reactivate();
    user.updateAudit(audit);

    await this.userRepository.save(user);

    return Ok(undefined);
  }
}
