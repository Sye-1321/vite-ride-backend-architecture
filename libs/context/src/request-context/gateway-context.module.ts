import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';
import { TYPES } from '@app/shared-kernel';

import { ClsRequestContextAccessor } from './cls-request-context.accessor';
import { RequestContextInterceptor } from './request-context.interceptor';

import { GrpcClientContextInterceptor } from './grpc-client-context.interceptor';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
  ],
  providers: [
    ClsRequestContextAccessor,

    GrpcClientContextInterceptor, 

    {
      provide: TYPES.RequestContextAccessor,
      useExisting: ClsRequestContextAccessor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor,
    },
  ],
  exports: [
    TYPES.RequestContextAccessor,
    GrpcClientContextInterceptor,
  ],
})
export class GatewayContextModule {}
