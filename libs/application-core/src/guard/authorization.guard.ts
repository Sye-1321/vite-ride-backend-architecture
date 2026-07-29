import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { REQUIRED_PERMISSION, RequiredPermission } from '../decorators';
import {
  AUTHORIZATION_DECISION_PORT,
  AuthorizationDecisionPort,
} from '../ports/authorization-decision.port';

interface AuthorizationRequest {
  user?: { userId?: string };
  params?: Record<string, string | undefined>;
  headers?: Record<string, string | string[] | undefined>;
}

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(AUTHORIZATION_DECISION_PORT)
    private readonly authorization: AuthorizationDecisionPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.getAllAndOverride<RequiredPermission>(REQUIRED_PERMISSION, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!permission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthorizationRequest>();
    const userId = request.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Authenticated authorization context is required');
    }

    const domain =
      request.params?.tenantId || this.headerValue(request.headers?.['x-tenant-id']) || '*';

    try {
      const decision = await this.authorization.authorize({
        userId,
        domain,
        resource: permission.resource,
        action: permission.action,
      });

      if (!decision.allowed) {
        throw new ForbiddenException('Insufficient permission');
      }
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ServiceUnavailableException('Authorization service is unavailable');
    }
  }

  private headerValue(value: string | string[] | undefined): string {
    return Array.isArray(value) ? value[0] || '' : value || '';
  }
}
