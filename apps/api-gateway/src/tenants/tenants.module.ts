import { Module } from '@nestjs/common';

import { GatewayContextModule } from '@app/context';

import { AuthorizationModule } from '../authorization/authorization.module';
import { TenantsController } from './tenants.controller';
import { TenantsGrpcClient } from './tenants.grpc.client';

@Module({
  imports: [GatewayContextModule, AuthorizationModule],
  controllers: [TenantsController],
  providers: [TenantsGrpcClient],
})
export class TenantsModule {}
