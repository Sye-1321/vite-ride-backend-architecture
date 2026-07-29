import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LoggingModule } from '@app/adapters';
import { TYPES } from '@app/shared-kernel';

import { AuthorizationQueryService } from './application/services/authorization-query.service';
import { RoleAssignmentService } from './application/services/role-assignment.service';
import authorizationConfig from './config/authorization.config';
import { CasbinAuthorizationAdapter } from './engines/casbin/casbin-authorization.adapter';
import { CasbinModule } from './engines/casbin/casbin.module';
import { AuthorizationGrpcController } from './transports/grpc';

@Module({
  imports: [
    LoggingModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authorizationConfig],
    }),
    CasbinModule,
  ],
  controllers: [AuthorizationGrpcController],
  providers: [
    AuthorizationQueryService,
    RoleAssignmentService,
    CasbinAuthorizationAdapter,
    {
      provide: TYPES.AuthorizationQueryPort,
      useExisting: CasbinAuthorizationAdapter,
    },
    {
      provide: TYPES.RoleAssignmentPort,
      useExisting: CasbinAuthorizationAdapter,
    },
  ],
  exports: [AuthorizationQueryService, RoleAssignmentService],
})
export class AuthorizationModule {}
