import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';

import { TYPES } from '@app/shared-kernel';
import { NotFoundException } from '@app/common';

import { DeactivateTenantCommand } from './deactivate-tenant.command';
import { TenantRepositoryPort } from '../../../ports';

@CommandHandler(DeactivateTenantCommand)
export class DeactivateTenantHandler implements ICommandHandler<DeactivateTenantCommand> {
  constructor(
    @Inject(TYPES.TenantRepositoryPort)
    private readonly tenantRepository: TenantRepositoryPort,
  ) {}

  async execute(command: DeactivateTenantCommand): Promise<Result<void, NotFoundException>> {
    const found = await this.tenantRepository.findById(command.tenantId);

    if (found.isNone()) {
      return Err(new NotFoundException('Tenant not found'));
    }

    const tenant = found.unwrap();
    tenant.deactivate();
    await this.tenantRepository.save(tenant);

    return Ok(undefined);
  }
}
