import { IoAdapter } from '@nestjs/platform-socket.io';
import { JwtService } from '@nestjs/jwt';
import { Server, ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import type { Redis } from 'ioredis';

import { extractBearerToken } from '../utils/extract-token.util';
import { AuthenticatedRequest } from '../interfaces/authenticated-socket.interface';

export const SOCKET_TRANSPORTS = ['websocket'] as const;

export class JwtRedisSocketAdapter extends IoAdapter {
  constructor(
    private readonly jwtService: JwtService,
    private readonly jwtSecret: string,
    private readonly pubClient: Redis,
    private readonly subClient: Redis,
    app?: any,
  ) {
    super(app);
  }

  override createIOServer(port: number, options?: Partial<ServerOptions>): Server {
    const server = super.createIOServer(port, {
      ...options,
      transports: SOCKET_TRANSPORTS,
      allowRequest: (
        req: AuthenticatedRequest,
        callback: (arg0: string | null, arg1: boolean) => void,
      ) => {
        try {
          const token = extractBearerToken(req.headers['authorization'] as string | undefined);
          if (!token) return callback('Unauthorized', false);

          const payload = this.jwtService.verify<{
            userId: string;
            phoneNumber: string;
          }>(token, { secret: this.jwtSecret });

          req.user = {
            userId: payload.userId,
            phoneNumber: payload.phoneNumber,
          };

          callback(null, true);
        } catch {
          callback('Unauthorized', false);
        }
      },
    });

    server.adapter(createAdapter(this.pubClient, this.subClient));

    server.on(
      'connection',
      (socket: {
        request: AuthenticatedRequest;
        data: { user: { userId: string; phoneNumber: string } };
      }) => {
        const user = (socket.request as AuthenticatedRequest).user;
        if (user) {
          socket.data.user = user;
        }
      },
    );

    return server;
  }
}
