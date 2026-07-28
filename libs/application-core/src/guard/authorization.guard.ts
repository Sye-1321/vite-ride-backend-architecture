import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
// import { RequiredPermission } from '../decorators';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    // private readonly authzClient: AuthorizationClient,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // const req = context.switchToHttp().getRequest();

    // const permission = this.reflector.get<RequiredPermission>(
    //   PERMISSION_KEY,
    //   context.getHandler(),
    // );

    // if (!permission) return true;

    // const user = req.user;
    // if (!user) return false;

    // const domain =
    //   req.headers['x-tenant-id'] ??
    //   user.tenantId ??
    //   '*';

    // const decision = await this.authzClient.canAccess({
    //   sub: user.id,
    //   obj: permission.resource,
    //   act: permission.action,
    //   domain,
    // });
    const decision = { allowed: true };
    return decision.allowed;
  }
}
