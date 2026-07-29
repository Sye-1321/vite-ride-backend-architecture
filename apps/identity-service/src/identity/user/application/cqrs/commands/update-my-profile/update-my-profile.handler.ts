import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';

import { UpdateMyProfileCommand } from './update-my-profile.command';
import { TYPES } from '@app/shared-kernel';
import { UserRepositoryPort } from '../../../ports';
import { NotFoundException } from '@app/common';

import { AuditFactory } from '@app/audit';
import { RequestContextAccessor } from '@app/context';

type UpdateMyProfileErrors = NotFoundException;

@CommandHandler(UpdateMyProfileCommand)
export class UpdateMyProfileHandler implements ICommandHandler<UpdateMyProfileCommand> {
  constructor(
    @Inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,

    @Inject(TYPES.RequestContextAccessor)
    private readonly requestContext: RequestContextAccessor,
  ) {}

  async execute(command: UpdateMyProfileCommand): Promise<Result<void, UpdateMyProfileErrors>> {
    const { userId, firstName, lastName } = command;

    const foundUser = await this.userRepository.findById(userId);
    if (foundUser.isNone()) {
      return Err(new NotFoundException('User not found'));
    }

    const user = foundUser.unwrap();

    user.updateProfile(firstName, lastName);

    const ctx = this.requestContext.get();
    const audit = AuditFactory.createForUpdate(ctx.phoneNumber, user.audit);

    user.updateAudit(audit);

    await this.userRepository.save(user);

    return Ok(undefined);
  }
}
