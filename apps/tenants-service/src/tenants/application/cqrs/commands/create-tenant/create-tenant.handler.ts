import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';

import { TYPES } from '@app/shared-kernel';
import { AuditFactory } from '@app/audit';

import { CreateTenantCommand } from './create-tenant.command';
import { TenantRepositoryPort } from '../../../ports';
import { Tenant } from '../../../../domain/tenant.entity';
import { TenantProps } from '../../../../domain/tenant.types';
import { TenantNameAlreadyExistsError } from '../../../errors';

type CreateTenantErrors = TenantNameAlreadyExistsError | Error;

@CommandHandler(CreateTenantCommand)
export class CreateTenantHandler implements ICommandHandler<CreateTenantCommand> {
  constructor(
    @Inject(TYPES.TenantRepositoryPort)
    private readonly tenantRepository: TenantRepositoryPort,
  ) {}

  async execute(
    command: CreateTenantCommand,
  ): Promise<Result<{ tenantId: string }, CreateTenantErrors>> {
    const { name } = command;

    const existing = await this.tenantRepository.findByName(name);
    if (existing.isSome()) {
      return Err(new TenantNameAlreadyExistsError({ name }));
    }

    const audit = AuditFactory.createForCreate('system');

    const tenantProps: Omit<TenantProps, 'status'> = {
      name,
      audit,
    };

    const tenant = Tenant.create(tenantProps);

    try {
      await this.tenantRepository.insert(tenant);
    } catch (error: any) {
      return Err(error);
    }

    return Ok({ tenantId: tenant.id });
  }
}
