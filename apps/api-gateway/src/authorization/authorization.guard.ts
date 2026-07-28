import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';

import { AuthorizationGrpcClient } from './authorization.grpc.client';
import { REQUIRED_PERMISSION, RequiredPermission } from './require-permission.decorator';

interface AuthenticatedRequest extends Request {
  user?: { userId?: string };
}

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorization: AuthorizationGrpcClient,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.getAllAndOverride<RequiredPermission>(REQUIRED_PERMISSION, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!permission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.userId;
    const domain =
      request.params.tenantId || this.headerValue(request.headers['x-tenant-id']) || '*';

    if (!userId) {
      throw new ForbiddenException('Authenticated authorization context is required');
    }

    const result = await firstValueFrom(
      this.authorization.checkAccess({
        userId,
        domain,
        resource: permission.resource,
        action: permission.action,
      }),
    );

    if (!result.allowed) {
      throw new ForbiddenException('Insufficient tenant permission');
    }
    return true;
  }

  private headerValue(value: string | string[] | undefined): string {
    return Array.isArray(value) ? value[0] : value || '';
  }
}
