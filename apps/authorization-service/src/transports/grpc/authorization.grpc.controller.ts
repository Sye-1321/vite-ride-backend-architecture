import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class AuthorizationGrpcController {
  @GrpcMethod('RoleService')
  hasRights(req: unknown): { access: boolean } {
    console.log('[gRPC] hasRights called', req);
    return { access: false };
  }

  @GrpcMethod('RoleService')
  readUserRoles(req: unknown): { roles: string[] } {
    console.log('[gRPC] readUserRoles called', req);
    return { roles: [] };
  }

  @GrpcMethod('RoleService')
  addUserToRole(req: unknown): { roles: string[] } {
    console.log('[gRPC] addUserToRole called', req);
    return { roles: [] };
  }
}
