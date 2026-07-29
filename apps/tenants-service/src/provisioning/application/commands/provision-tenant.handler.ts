import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ApplicationError, requiredText } from '@app/application-core';
import { AuditFactory } from '@app/audit';
import { TYPES } from '@app/shared-kernel';

import { TenantMemberRepositoryPort } from '../../../membership/application/ports';
import { TenantMember } from '../../../membership/domain/membership.entity';
import { TenantMemberRole } from '../../../membership/domain/membership.types';
import { TenantRepositoryPort } from '../../../tenants/application/ports';
import { Tenant } from '../../../tenants/domain/tenant.entity';
import { ProvisionTenantCommand } from './provision-tenant.command';

@CommandHandler(ProvisionTenantCommand)
export class ProvisionTenantHandler implements ICommandHandler<ProvisionTenantCommand> {
  constructor(
    @Inject(TYPES.TenantRepositoryPort)
    private readonly tenants: TenantRepositoryPort,
    @Inject(TYPES.TenantMemberRepositoryPort)
    private readonly members: TenantMemberRepositoryPort,
  ) {}

  async execute(command: ProvisionTenantCommand): Promise<Tenant> {
    const name = requiredText(command.name, 'name', 120);
    const ownerUserId = requiredText(command.ownerUserId, 'ownerUserId');
    if ((await this.tenants.findByName(name)).isSome()) {
      throw new ApplicationError('ALREADY_EXISTS', 'Tenant name already exists');
    }

    const tenant = Tenant.create({
      name,
      audit: AuditFactory.createForCreate(ownerUserId),
    });
    const owner = TenantMember.create({
      tenantId: tenant.id,
      userId: ownerUserId,
      role: TenantMemberRole.ADMIN,
      audit: AuditFactory.createForCreate(ownerUserId),
    });

    await this.tenants.insert(tenant);
    await this.members.insert(owner);
    return tenant;
  }
}
