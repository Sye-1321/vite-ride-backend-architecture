import { Module, Global } from '@nestjs/common';
import { TYPES } from '@app/shared-kernel';
import { RoutingService } from './infrastructure/routing.service';

@Global()
@Module({
  providers: [
    {
      provide: TYPES.RoutingServicePort,
      useClass: RoutingService,
    },
  ],
  exports: [TYPES.RoutingServicePort],
})
export class RoutingModule {}
