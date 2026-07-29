import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { MembershipModule } from '../membership/membership.module';
import { ListTenantsHandler } from './application/queries/tenant-query.handlers';
import { TenantModule } from './tenants.module';

@Module({
  imports: [CqrsModule, TenantModule, MembershipModule],
  providers: [ListTenantsHandler],
})
export class TenantAccessQueryModule {}
