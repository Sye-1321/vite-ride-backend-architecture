import { Module } from '@nestjs/common';

import { GatewayContextModule } from '@app/context';

import { AuthorizationGrpcClient } from './authorization.grpc.client';
import { AuthorizationGuard } from './authorization.guard';

@Module({
  imports: [GatewayContextModule],
  providers: [AuthorizationGrpcClient, AuthorizationGuard],
  exports: [AuthorizationGrpcClient, AuthorizationGuard],
})
export class AuthorizationModule {}
