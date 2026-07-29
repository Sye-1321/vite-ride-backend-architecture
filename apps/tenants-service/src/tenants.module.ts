import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggingModule } from '@app/adapters';
import { MongoModule } from '@app/persistence';

import tenantsConfig from './config/tenants.config';
import { DriverModule } from './drivers/drivers.module';
import { MembershipModule } from './membership/membership.module';
import { TenantsReadinessService } from './health/tenants-readiness.service';
import { ProvisioningModule } from './provisioning/provisioning.module';
import { TenantModule } from './tenants/tenants.module';
import { TenantAccessQueryModule } from './tenants/tenant-access-query.module';
import { TenantsGrpcController } from './transports/tenants.grpc.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [tenantsConfig],
    }),
    LoggingModule,
    CqrsModule,
    MongoModule.forRoot('TENANTS', 'TenantsConnection'),
    TenantModule,
    MembershipModule,
    TenantAccessQueryModule,
    DriverModule,
    ProvisioningModule,
  ],
  controllers: [TenantsGrpcController],
  providers: [TenantsReadinessService],
})
export class TenantsModule {}
