import { status } from '@grpc/grpc-js';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

import { ApplicationError } from '@app/application-core';
import { USER_SERVICE_NAME, UserServiceClient } from '@app/proto-schema';

import { UserDirectoryPort } from '../application/user-directory.port';

export const IDENTITY_GRPC_CLIENT = 'TENANTS_IDENTITY_GRPC_CLIENT';

@Injectable()
export class IdentityGrpcAdapter implements UserDirectoryPort, OnModuleInit {
  private users!: UserServiceClient;

  constructor(
    @Inject(IDENTITY_GRPC_CLIENT)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.users = this.client.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  async assertExists(userId: string): Promise<void> {
    try {
      await firstValueFrom(this.users.getUserById({ userId }).pipe(timeout({ first: 3_000 })));
    } catch (error) {
      if (this.grpcCode(error) === status.NOT_FOUND) {
        throw new ApplicationError('INVALID_ARGUMENT', 'Referenced user does not exist');
      }
      throw new ApplicationError('UNAVAILABLE', 'Identity service is unavailable');
    }
  }

  private grpcCode(error: unknown): number | undefined {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
      return undefined;
    }
    return typeof error.code === 'number' ? error.code : undefined;
  }
}
