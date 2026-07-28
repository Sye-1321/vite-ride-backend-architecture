import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Observable } from 'rxjs';

import { RequestContext } from './request-context';

@Injectable()
export class GrpcServerContextInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const [, metadata] = context.getArgs();

    const correlationId = metadata?.get('x-correlation-id')?.[0] as string;

    const userId = metadata?.get('x-user-id')?.[0] as string | undefined;

    const tenantId = metadata?.get('x-tenant-id')?.[0] as string | undefined;

    const phoneNumber = metadata?.get('x-phone-number')?.[0] as string | undefined;

    return this.cls.run(() => {
      this.cls.set(
        'ctx.request',
        new RequestContext(correlationId, phoneNumber ?? 'GUEST', tenantId, userId),
      );

      return next.handle();
    });
  }
}
