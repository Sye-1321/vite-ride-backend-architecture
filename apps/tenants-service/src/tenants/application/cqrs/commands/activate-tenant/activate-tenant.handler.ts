import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';

import { TYPES } from '@app/shared-kernel';
import { NotFoundException } from '@app/common';

import { ActivateTenantCommand } from './activate-tenant.command';
import { TenantRepositoryPort } from '../../../ports';
import { TenantSuspendedError } from '../../../../domain/tenant.errors';

type ActivateTenantErrors = TenantSuspendedError | NotFoundException | Error;

@CommandHandler(ActivateTenantCommand)
export class ActivateTenantHandler implements ICommandHandler<ActivateTenantCommand> {
  constructor(
    @Inject(TYPES.TenantRepositoryPort)
    private readonly tenantRepository: TenantRepositoryPort,
  ) {}

  async execute(command: ActivateTenantCommand): Promise<Result<void, ActivateTenantErrors>> {
    const found = await this.tenantRepository.findById(command.tenantId);

    if (found.isNone()) {
      return Err(new NotFoundException('Tenant not found'));
    }

    const tenant = found.unwrap();

    const activationResult = tenant.activate();
    if (activationResult.isErr()) {
      return Err(activationResult.unwrapErr());
    }

    await this.tenantRepository.save(tenant);

    return Ok(undefined);
  }
}
