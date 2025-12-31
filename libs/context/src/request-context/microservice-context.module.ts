import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';

import { GrpcServerContextInterceptor } from './grpc-server-context.interceptor';
import { ClsRequestContextAccessor } from './cls-request-context.accessor';
import { TYPES } from '@app/shared-kernel';

@Module({
  imports: [
    ClsModule.forRoot({ global: true }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: GrpcServerContextInterceptor,
    },
    {
      provide: TYPES.RequestContextAccessor,
      useClass: ClsRequestContextAccessor,
    },
  ],
  exports: [
    TYPES.RequestContextAccessor, 
  ],
})
export class MicroserviceContextModule {}
