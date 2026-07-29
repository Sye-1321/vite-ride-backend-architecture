import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ApplicationError, requiredText } from '@app/application-core';
import { AuditFactory } from '@app/audit';
import { TYPES } from '@app/shared-kernel';

import { TenantMemberRepositoryPort } from '../../../membership/application/ports';
import { TenantMember } from '../../../membership/domain/membership.entity';
import { TenantMemberRole } from '../../../membership/domain/membership.types';
import { TenantRepositoryPort } from '../../../tenants/application/ports';
import { Driver } from '../../domain/driver.entity';
import { DRIVER_REGISTRATION_PORT, DriverRegistrationPort, DriverRepositoryPort } from '../ports';
import { RegisterDriverCommand } from './driver.commands';

@CommandHandler(RegisterDriverCommand)
export class RegisterDriverHandler implements ICommandHandler<RegisterDriverCommand> {
  constructor(
    @Inject(TYPES.TenantRepositoryPort)
    private readonly tenants: TenantRepositoryPort,
    @Inject(TYPES.TenantMemberRepositoryPort)
    private readonly members: TenantMemberRepositoryPort,
    @Inject(TYPES.DriverRepositoryPort)
    private readonly drivers: DriverRepositoryPort,
    @Inject(DRIVER_REGISTRATION_PORT)
    private readonly registration: DriverRegistrationPort,
  ) {}

  async execute(command: RegisterDriverCommand): Promise<Driver> {
    const tenantId = requiredText(command.tenantId, 'tenantId');
    const userId = requiredText(command.userId, 'userId');
    if ((await this.tenants.findById(tenantId)).isNone()) {
      throw new ApplicationError('NOT_FOUND', 'Tenant not found');
    }
    if ((await this.drivers.findByUserIdAndTenantId(userId, tenantId)).isSome()) {
      throw new ApplicationError('ALREADY_EXISTS', 'Driver already exists');
    }

    const membership = (await this.members.exists(tenantId, userId, TenantMemberRole.DRIVER))
      ? undefined
      : TenantMember.create({
          tenantId,
          userId,
          role: TenantMemberRole.DRIVER,
          audit: AuditFactory.createForCreate(userId),
        });

    const driver = Driver.create({
      tenantId,
      userId,
      audit: AuditFactory.createForCreate(userId),
    });
    await this.registration.register(driver, membership);
    return driver;
  }
}

export const DriverCommandHandlers = [RegisterDriverHandler];
