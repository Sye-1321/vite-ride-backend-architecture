import { Module } from '@nestjs/common';

import { AUTHORIZATION_DECISION_PORT, AuthorizationGuard } from '@app/application-core';
import { GatewayContextModule } from '@app/context';

import { AuthorizationGrpcClient } from './authorization.grpc.client';

@Module({
  imports: [GatewayContextModule],
  providers: [
    AuthorizationGrpcClient,
    AuthorizationGuard,
    {
      provide: AUTHORIZATION_DECISION_PORT,
      useExisting: AuthorizationGrpcClient,
    },
  ],
  exports: [AuthorizationGrpcClient, AuthorizationGuard],
})
export class AuthorizationModule {}
