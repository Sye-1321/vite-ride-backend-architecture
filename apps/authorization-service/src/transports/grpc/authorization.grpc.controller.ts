import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import {
  AUTHORIZATION_SERVICE_NAME,
  AccessCheckRequest,
  AccessCheckResponse,
  AuthorizationHealthResponse,
  GetRolesRequest,
  GetRolesResponse,
  RoleRequest,
  RoleResponse,
} from '@app/proto-schema';

import { AuthorizationQueryService, RoleAssignmentService } from '../../application/services';

@Controller()
export class AuthorizationGrpcController {
  constructor(
    private readonly authorizationQuery: AuthorizationQueryService,
    private readonly roleAssignment: RoleAssignmentService,
  ) {}

  @GrpcMethod(AUTHORIZATION_SERVICE_NAME, 'CheckAccess')
  checkAccess(request: AccessCheckRequest): Promise<AccessCheckResponse> {
    return this.authorizationQuery.canAccess({
      sub: request.userId,
      domain: request.domain,
      obj: request.resource,
      act: request.action,
    });
  }

  @GrpcMethod(AUTHORIZATION_SERVICE_NAME, 'AssignRole')
  assignRole(request: RoleRequest): Promise<RoleResponse> {
    return this.roleAssignment.assignRole(request);
  }

  @GrpcMethod(AUTHORIZATION_SERVICE_NAME, 'RemoveRole')
  removeRole(request: RoleRequest): Promise<RoleResponse> {
    return this.roleAssignment.removeRole(request);
  }

  @GrpcMethod(AUTHORIZATION_SERVICE_NAME, 'GetRoles')
  getRoles(request: GetRolesRequest): Promise<GetRolesResponse> {
    return this.roleAssignment.readUserRoles(request);
  }

  @GrpcMethod(AUTHORIZATION_SERVICE_NAME, 'Health')
  health(): AuthorizationHealthResponse {
    return { status: 'SERVING' };
  }
}
