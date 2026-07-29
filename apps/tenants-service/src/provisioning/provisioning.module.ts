import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { MembershipModule } from '../membership/membership.module';
import { TenantModule } from '../tenants/tenants.module';
import { ProvisionTenantHandler } from './application/commands';
import { TENANT_PROVISIONING_PORT } from './application/ports';
import { MongoTenantProvisioningAdapter } from './infrastructure/mongo-tenant-provisioning.adapter';

@Module({
  imports: [CqrsModule, TenantModule, MembershipModule],
  providers: [
    ProvisionTenantHandler,
    {
      provide: TENANT_PROVISIONING_PORT,
      useClass: MongoTenantProvisioningAdapter,
    },
  ],
})
export class ProvisioningModule {}
