import { Module } from '@nestjs/common';

import { AuthorizationModule } from '../authorization/authorization.module';
import { RealtimeRateLimiter } from './realtime-rate-limiter.service';
import { RideRealtimeGateway } from './ride-realtime.gateway';

@Module({
  imports: [AuthorizationModule],
  providers: [RealtimeRateLimiter, RideRealtimeGateway],
})
export class RealtimeModule {}
