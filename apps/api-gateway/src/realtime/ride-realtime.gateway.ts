import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';

import { AuthenticatedSocket } from '@app/realtime';

import { AuthorizationGrpcClient } from '../authorization/authorization.grpc.client';
import { DriverLocationDto, TenantSubscriptionDto } from './dto/realtime-event.dto';
import { RealtimeRateLimiter } from './realtime-rate-limiter.service';

export interface RideSocket extends AuthenticatedSocket {
  data: AuthenticatedSocket['data'] & {
    locationPublisherTenants?: Set<string>;
  };
}

@WebSocketGateway({ namespace: '/realtime' })
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class RideRealtimeGateway {
  constructor(
    private readonly authorization: AuthorizationGrpcClient,
    private readonly rateLimiter: RealtimeRateLimiter,
  ) {}

  @SubscribeMessage('tenant:subscribe')
  async subscribeToTenant(
    @ConnectedSocket() socket: RideSocket,
    @MessageBody() payload: TenantSubscriptionDto,
  ): Promise<{ event: string; data: { tenantId: string } }> {
    await this.requirePermission(socket, payload.tenantId, 'read');
    await socket.join(this.tenantRoom(payload.tenantId));
    return {
      event: 'tenant:subscribed',
      data: { tenantId: payload.tenantId },
    };
  }

  @SubscribeMessage('tenant:unsubscribe')
  async unsubscribeFromTenant(
    @ConnectedSocket() socket: RideSocket,
    @MessageBody() payload: TenantSubscriptionDto,
  ): Promise<{ event: string; data: { tenantId: string } }> {
    await socket.leave(this.tenantRoom(payload.tenantId));
    socket.data.locationPublisherTenants?.delete(payload.tenantId);
    return {
      event: 'tenant:unsubscribed',
      data: { tenantId: payload.tenantId },
    };
  }

  @SubscribeMessage('driver:location:publish')
  async publishDriverLocation(
    @ConnectedSocket() socket: RideSocket,
    @MessageBody() payload: DriverLocationDto,
  ): Promise<{ event: string; data: { accepted: true } }> {
    const allowed = await this.rateLimiter.consume(
      `location:${socket.data.user.userId}`,
      20,
      10_000,
    );
    if (!allowed) {
      throw new WsException('Location update rate exceeded');
    }

    const grants =
      socket.data.locationPublisherTenants ??
      (socket.data.locationPublisherTenants = new Set<string>());
    if (!grants.has(payload.tenantId)) {
      await this.requirePermission(socket, payload.tenantId, 'publish-location');
      grants.add(payload.tenantId);
    }

    socket.to(this.tenantRoom(payload.tenantId)).emit('driver:location:updated', {
      ...payload,
      driverUserId: socket.data.user.userId,
      receivedAt: new Date().toISOString(),
    });
    return { event: 'driver:location:accepted', data: { accepted: true } };
  }

  private async requirePermission(
    socket: RideSocket,
    tenantId: string,
    action: string,
  ): Promise<void> {
    try {
      const decision = await this.authorization.authorize({
        userId: socket.data.user.userId,
        domain: tenantId,
        resource: 'tenant',
        action,
      });
      if (!decision.allowed) {
        throw new WsException('Insufficient permission');
      }
    } catch (error) {
      if (error instanceof WsException) {
        throw error;
      }
      throw new WsException('Authorization service is unavailable');
    }
  }

  private tenantRoom(tenantId: string): string {
    return `tenant:${tenantId}`;
  }
}
