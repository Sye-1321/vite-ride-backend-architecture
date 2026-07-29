import { INestApplicationContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import type { Redis } from 'ioredis';
import { Server, ServerOptions, Socket } from 'socket.io';

import { AuthPayload } from '@app/auth';
import { RedisClientPort } from '@app/redis';
import { LoggerPort } from '@app/shared-kernel';

import { AuthenticatedSocket } from '../interfaces';
import { extractSocketToken } from '../utils';

export const SOCKET_TRANSPORTS = ['websocket'] as const;

export interface JwtRedisSocketAdapterOptions {
  app: INestApplicationContext;
  jwtService: JwtService;
  jwtSecret: string;
  redis: RedisClientPort;
  logger: LoggerPort;
  allowedOrigins: readonly string[];
}

export class JwtRedisSocketAdapter extends IoAdapter {
  private constructor(
    app: INestApplicationContext,
    private readonly jwtService: JwtService,
    private readonly jwtSecret: string,
    private readonly pubClient: Redis,
    private readonly subClient: Redis,
    private readonly logger: LoggerPort,
    private readonly allowedOrigins: readonly string[],
  ) {
    super(app);
  }

  static async create(options: JwtRedisSocketAdapterOptions): Promise<JwtRedisSocketAdapter> {
    if (!options.redis.getPubSubClients) {
      throw new Error('Redis pub/sub clients are unavailable');
    }
    const { pubClient, subClient } = await options.redis.getPubSubClients();
    return new JwtRedisSocketAdapter(
      options.app,
      options.jwtService,
      options.jwtSecret,
      pubClient,
      subClient,
      options.logger,
      options.allowedOrigins,
    );
  }

  override createIOServer(port: number, options?: Partial<ServerOptions>): Server {
    const server = super.createIOServer(port, {
      ...options,
      transports: [...SOCKET_TRANSPORTS],
      allowEIO3: false,
      maxHttpBufferSize: 16 * 1024,
      perMessageDeflate: false,
      pingInterval: 25_000,
      pingTimeout: 20_000,
      cors: {
        credentials: true,
        origin: [...this.allowedOrigins],
      },
    }) as Server;

    server.adapter(createAdapter(this.pubClient, this.subClient));
    server.use((socket, next) => {
      void this.authenticate(socket, next);
    });
    server.on('connection', (socket: AuthenticatedSocket) => {
      void socket.join(`user:${socket.data.user.userId}`);
    });
    server.engine.on('connection_error', (error) => {
      this.logger.warn(
        'realtime connection rejected',
        { code: error.code, message: error.message },
        JwtRedisSocketAdapter.name,
      );
    });

    return server;
  }

  async dispose(): Promise<void> {
    await Promise.allSettled([this.pubClient.quit(), this.subClient.quit()]);
  }

  override async close(server: Server): Promise<void> {
    const results = await Promise.allSettled([super.close(server), this.dispose()]);
    for (const result of results) {
      if (result.status === 'rejected') {
        this.logger.error('realtime shutdown failed', result.reason, JwtRedisSocketAdapter.name);
      }
    }
  }

  private async authenticate(socket: Socket, next: (error?: Error) => void): Promise<void> {
    try {
      const token = extractSocketToken(socket.handshake);
      if (!token) {
        return next(new Error('Unauthorized'));
      }
      const payload = await this.jwtService.verifyAsync<AuthPayload>(token, {
        secret: this.jwtSecret,
      });
      if (!payload.userId || !payload.phoneNumber) {
        return next(new Error('Unauthorized'));
      }

      (socket as AuthenticatedSocket).data.user = Object.freeze({
        userId: payload.userId,
        phoneNumber: payload.phoneNumber,
      });
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  }
}
