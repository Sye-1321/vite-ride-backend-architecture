import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';

import { DeleteUserCommand } from './delete-user.command';
import { TYPES } from '@app/shared-kernel';
import { UserRepositoryPort } from '../../../ports';
import { NotFoundException } from '@app/common';

import { AuditFactory } from '@app/audit';
import { RequestContextAccessor } from '@app/context';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler
  implements ICommandHandler<DeleteUserCommand>
{
  constructor(
    @Inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,

    @Inject(TYPES.RequestContextAccessor)
    private readonly requestContext: RequestContextAccessor,
  ) {}

  async execute(
    command: DeleteUserCommand,
  ): Promise<Result<void, NotFoundException>> {
    const found = await this.userRepository.findById(command.userId);

    if (found.isNone()) {
      return Err(new NotFoundException('User not found'));
    }

    const user = found.unwrap();

    const ctx = this.requestContext.get();
    const audit = AuditFactory.createForDelete(
      ctx.phoneNumber,
      user.audit,
    );

    user.updateAudit(audit);

    await this.userRepository.save(user);

    return Ok(undefined);
  }
}
