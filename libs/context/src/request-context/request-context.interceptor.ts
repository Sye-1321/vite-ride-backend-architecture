import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';

import { RequestContext } from './request-context';
import { ClsRequestContextAccessor } from './cls-request-context.accessor';

const GUEST_PHONE_NUMBER = 'GUEST';
interface AuthenticatedRequest extends Request {
  user?: {
    userId?: string;
    phoneNumber?: string;
  };
}

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(private readonly ctx: ClsRequestContextAccessor) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    let correlationId = req.headers['x-correlation-id'] as string | undefined;

    if (!correlationId) {
      correlationId = randomUUID();
      req.headers['x-correlation-id'] = correlationId;
    }

    this.ctx.set(
      new RequestContext(
        correlationId,
        req.user?.phoneNumber ?? GUEST_PHONE_NUMBER,
        req.headers['x-tenant-id'] as string | undefined,
        req.user?.userId,
      ),
    );

    return next.handle();
  }
}
