import * as grpc from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { ClsRequestContextAccessor } from './cls-request-context.accessor';

@Injectable()
export class GrpcClientContextInterceptor {
  constructor(private readonly ctx: ClsRequestContextAccessor) {}

  interceptor(): grpc.Interceptor {
    return (options, nextCall) =>
      new grpc.InterceptingCall(nextCall(options), {
        start: (metadata, listener, next) => {
          const requestContext = this.ctx.get();

          metadata.set('x-correlation-id', requestContext.correlationId);

          if (requestContext.userId) {
            metadata.set('x-user-id', requestContext.userId);
          }

          if (requestContext.tenantId) {
            metadata.set('x-tenant-id', requestContext.tenantId);
          }

          if (requestContext.phoneNumber) {
            metadata.set('x-phone-number', requestContext.phoneNumber);
          }

          next(metadata, listener);
        },
      });
  }
}
