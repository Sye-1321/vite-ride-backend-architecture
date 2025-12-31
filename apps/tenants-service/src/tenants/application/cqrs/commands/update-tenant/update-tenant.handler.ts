import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';

import { TYPES } from '@app/shared-kernel';
import { UpdateTenantCommand } from './update-tenant.command';

import { TenantRepositoryPort } from '../../../ports';
import { NotFoundException } from '@app/common';
import { TenantNameAlreadyExistsError } from '../../../errors';

type UpdateTenantErrors =
  | TenantNameAlreadyExistsError
  | NotFoundException
  | Error;

@CommandHandler(UpdateTenantCommand)
export class UpdateTenantHandler
  implements ICommandHandler<UpdateTenantCommand>
{
  constructor(
    @Inject(TYPES.TenantRepositoryPort)
    private readonly tenantRepository: TenantRepositoryPort,
  ) {}

  async execute(
    command: UpdateTenantCommand,
  ): Promise<Result<void, UpdateTenantErrors>> {
    const { tenantId, name } = command;

    const tenantResult = await this.tenantRepository.findById(tenantId);
    if (tenantResult.isNone()) {
      return Err(new NotFoundException('Tenant not found'));
    }

    const existingWithName = await this.tenantRepository.findByName(name);
    if (
      existingWithName.isSome() &&
      existingWithName.unwrap().id !== tenantId
    ) {
      return Err(new TenantNameAlreadyExistsError({ name }));
    }

    const tenant = tenantResult.unwrap();
    tenant.updateName(name);

    try {
      await this.tenantRepository.save(tenant);
    } catch (error: any) {
      return Err(error);
    }

    return Ok(undefined);
  }
}
