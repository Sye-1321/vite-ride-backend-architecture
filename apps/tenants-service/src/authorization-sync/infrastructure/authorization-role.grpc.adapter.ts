import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable, timeout } from 'rxjs';

import { AUTHORIZATION_SERVICE_NAME, RoleRequest, RoleResponse } from '@app/proto-schema';

export const AUTHORIZATION_GRPC_CLIENT = 'TENANTS_AUTHORIZATION_GRPC_CLIENT';

interface AuthorizationServiceClient {
  assignRole(request: RoleRequest): Observable<RoleResponse>;
  removeRole(request: RoleRequest): Observable<RoleResponse>;
}

@Injectable()
export class AuthorizationRoleGrpcAdapter implements OnModuleInit {
  private authorization!: AuthorizationServiceClient;

  constructor(
    @Inject(AUTHORIZATION_GRPC_CLIENT)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.authorization = this.client.getService<AuthorizationServiceClient>(
      AUTHORIZATION_SERVICE_NAME,
    );
  }

  async assignRole(userId: string, domain: string, role: string): Promise<void> {
    await firstValueFrom(
      this.authorization.assignRole({ userId, domain, role }).pipe(timeout({ first: 3_000 })),
    );
  }

  async removeRole(userId: string, domain: string, role: string): Promise<void> {
    await firstValueFrom(
      this.authorization.removeRole({ userId, domain, role }).pipe(timeout({ first: 3_000 })),
    );
  }
}
