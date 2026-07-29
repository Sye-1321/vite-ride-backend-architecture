import { Module } from '@nestjs/common';

import { AuthorizationModule } from '../authorization/authorization.module';
import { TenantsModule } from '../tenants/tenants.module';
import { HealthController } from './health.controller';

@Module({
  imports: [AuthorizationModule, TenantsModule],
  controllers: [HealthController],
})
export class HealthModule {}
