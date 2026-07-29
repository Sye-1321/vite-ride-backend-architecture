import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { from, Observable } from 'rxjs';

import {
  AuthorizationDecision,
  AuthorizationDecisionPort,
  AuthorizationDecisionRequest,
} from '@app/application-core';
import { GrpcClientContextInterceptor } from '@app/context';
import {
  AccessCheckRequest,
  AccessCheckResponse,
  AuthorizationEmpty,
  AuthorizationHealthResponse,
  AUTHORIZATION_PACKAGE_NAME,
  AUTHORIZATION_SERVICE_NAME,
  GetRolesRequest,
  GetRolesResponse,
  RoleRequest,
  RoleResponse,
} from '@app/proto-schema';

import { GatewayConfig } from '../config';
import { createGrpcUnaryClient, GrpcClientLifecycle } from '../grpc/grpc-unary-client.factory';

interface AuthorizationGrpcService {
  checkAccess(request: AccessCheckRequest): Promise<AccessCheckResponse>;
  assignRole(request: RoleRequest): Promise<RoleResponse>;
  removeRole(request: RoleRequest): Promise<RoleResponse>;
  getRoles(request: GetRolesRequest): Promise<GetRolesResponse>;
  health(request: AuthorizationEmpty): Promise<AuthorizationHealthResponse>;
}

@Injectable()
export class AuthorizationGrpcClient
  implements OnModuleInit, OnApplicationShutdown, AuthorizationDecisionPort
{
  private service!: AuthorizationGrpcService & GrpcClientLifecycle;

  constructor(
    private readonly contextInterceptor: GrpcClientContextInterceptor,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit(): void {
    const config = this.configService.get<GatewayConfig>('gateway');
    if (!config) {
      throw new Error('Gateway configuration is unavailable');
    }

    this.service = createGrpcUnaryClient<AuthorizationGrpcService>({
      packageName: AUTHORIZATION_PACKAGE_NAME,
      serviceName: AUTHORIZATION_SERVICE_NAME,
      protoFile: 'authorization.proto',
      url: config.AUTHORIZATION_GRPC_URL,
      methods: ['checkAccess', 'assignRole', 'removeRole', 'getRoles', 'health'],
      contextInterceptor: this.contextInterceptor,
    });
  }

  onApplicationShutdown(): void {
    this.service?.close();
  }

  checkAccess(request: AccessCheckRequest): Observable<AccessCheckResponse> {
    return from(this.service.checkAccess(request));
  }

  authorize(request: AuthorizationDecisionRequest): Promise<AuthorizationDecision> {
    return this.service.checkAccess(request);
  }

  assignRole(request: RoleRequest): Observable<RoleResponse> {
    return from(this.service.assignRole(request));
  }

  removeRole(request: RoleRequest): Observable<RoleResponse> {
    return from(this.service.removeRole(request));
  }

  getRoles(request: GetRolesRequest): Observable<GetRolesResponse> {
    return from(this.service.getRoles(request));
  }

  health(): Promise<AuthorizationHealthResponse> {
    return this.service.health({});
  }
}
