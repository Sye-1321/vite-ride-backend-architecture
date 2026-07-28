import { Module } from '@nestjs/common';

import { AuthorizationQueryService } from './application/services/authorization-query.service';
import { PolicyCommandService } from './application/services/policy-command.service';
import { RoleAssignmentService } from './application/services/role-assignment.service';

import { CasbinModule } from './engines/casbin/casbin.module';
import { CasbinAuthorizationAdapter } from './engines/casbin/casbin-authorization.adapter';

import { TYPES } from '@app/shared-kernel';

@Module({
  imports: [CasbinModule],
  providers: [
    AuthorizationQueryService,
    PolicyCommandService,
    RoleAssignmentService,

    {
      provide: TYPES.AuthorizationQueryPort,
      useClass: CasbinAuthorizationAdapter,
    },
    {
      provide: TYPES.PolicyCommandPort,
      useClass: CasbinAuthorizationAdapter,
    },
    {
      provide: TYPES.RoleAssignmentPort,
      useClass: CasbinAuthorizationAdapter,
    },
  ],
  exports: [AuthorizationQueryService, PolicyCommandService, RoleAssignmentService],
})
export class AuthorizationModule {}
