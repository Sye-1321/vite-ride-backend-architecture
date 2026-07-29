import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { MembershipModule } from '../membership/membership.module';
import { TenantModule } from '../tenants/tenants.module';
import { ProvisionTenantHandler } from './application/commands';

@Module({
  imports: [CqrsModule, TenantModule, MembershipModule],
  providers: [ProvisionTenantHandler],
})
export class ProvisioningModule {}
