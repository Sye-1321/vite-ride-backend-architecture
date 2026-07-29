import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TYPES } from '@app/shared-kernel';

import { requiredText, TenantsApplicationError } from '../../../application/errors';
import { Tenant } from '../../domain/tenant.entity';
import { TenantStatus } from '../../domain/tenant.types';
import { TenantRepositoryPort } from '../ports';
import { ChangeTenantStatusCommand, UpdateTenantCommand } from './tenant.commands';

async function tenantById(repository: TenantRepositoryPort, tenantId: string): Promise<Tenant> {
  const found = await repository.findById(requiredText(tenantId, 'tenantId'));
  if (found.isNone()) {
    throw new TenantsApplicationError('NOT_FOUND', 'Tenant not found');
  }
  return found.unwrap();
}

@CommandHandler(UpdateTenantCommand)
export class UpdateTenantHandler implements ICommandHandler<UpdateTenantCommand> {
  constructor(
    @Inject(TYPES.TenantRepositoryPort)
    private readonly tenants: TenantRepositoryPort,
  ) {}

  async execute(command: UpdateTenantCommand): Promise<Tenant> {
    const tenant = await tenantById(this.tenants, command.tenantId);
    const name = requiredText(command.name, 'name', 120);
    const duplicate = await this.tenants.findByName(name);
    if (duplicate.isSome() && duplicate.unwrap().id !== tenant.id) {
      throw new TenantsApplicationError('ALREADY_EXISTS', 'Tenant name already exists');
    }

    tenant.updateName(name);
    await this.tenants.save(tenant);
    return tenant;
  }
}

@CommandHandler(ChangeTenantStatusCommand)
export class ChangeTenantStatusHandler implements ICommandHandler<ChangeTenantStatusCommand> {
  constructor(
    @Inject(TYPES.TenantRepositoryPort)
    private readonly tenants: TenantRepositoryPort,
  ) {}

  async execute(command: ChangeTenantStatusCommand): Promise<Tenant> {
    const tenant = await tenantById(this.tenants, command.tenantId);

    if (command.status === TenantStatus.ACTIVE) {
      const result = tenant.activate();
      if (result.isErr()) {
        throw new TenantsApplicationError(
          'FAILED_PRECONDITION',
          'A suspended tenant cannot be reactivated',
        );
      }
    } else if (command.status === TenantStatus.INACTIVE) {
      tenant.deactivate();
    } else {
      tenant.suspend();
    }

    await this.tenants.save(tenant);
    return tenant;
  }
}

export const TenantCommandHandlers = [UpdateTenantHandler, ChangeTenantStatusHandler];
