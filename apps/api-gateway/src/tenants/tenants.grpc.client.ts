import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { from, Observable } from 'rxjs';

import { GrpcClientContextInterceptor } from '@app/context';
import {
  ChangeTenantStatusRequest,
  CreateTenantRequest,
  DriverRequest,
  DriverResponse,
  ListMembersRequest,
  ListTenantsRequest,
  MemberIdRequest,
  MemberListResponse,
  MemberRequest,
  MemberResponse,
  TENANTS_PACKAGE_NAME,
  TENANTS_SERVICE_NAME,
  TenantIdRequest,
  TenantListResponse,
  TenantResponse,
  TenantsEmpty,
  UpdateTenantRequest,
} from '@app/proto-schema';

import { GatewayConfig } from '../config';
import { createGrpcUnaryClient, GrpcClientLifecycle } from '../grpc/grpc-unary-client.factory';

interface TenantsGrpcService {
  createTenant(request: CreateTenantRequest): Promise<TenantResponse>;
  getTenant(request: TenantIdRequest): Promise<TenantResponse>;
  listTenants(request: ListTenantsRequest): Promise<TenantListResponse>;
  updateTenant(request: UpdateTenantRequest): Promise<TenantResponse>;
  changeTenantStatus(request: ChangeTenantStatusRequest): Promise<TenantResponse>;
  addMember(request: MemberRequest): Promise<MemberResponse>;
  suspendMember(request: MemberIdRequest): Promise<MemberResponse>;
  removeMember(request: MemberIdRequest): Promise<TenantsEmpty>;
  listMembers(request: ListMembersRequest): Promise<MemberListResponse>;
  registerDriver(request: DriverRequest): Promise<DriverResponse>;
  getDriver(request: DriverRequest): Promise<DriverResponse>;
}

@Injectable()
export class TenantsGrpcClient implements OnModuleInit, OnApplicationShutdown {
  private service!: TenantsGrpcService & GrpcClientLifecycle;

  constructor(
    private readonly contextInterceptor: GrpcClientContextInterceptor,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit(): void {
    const config = this.configService.get<GatewayConfig>('gateway');
    if (!config) {
      throw new Error('Gateway configuration is unavailable');
    }

    this.service = createGrpcUnaryClient<TenantsGrpcService>({
      packageName: TENANTS_PACKAGE_NAME,
      serviceName: TENANTS_SERVICE_NAME,
      protoFile: 'tenants.proto',
      url: config.TENANTS_GRPC_URL,
      methods: [
        'createTenant',
        'getTenant',
        'listTenants',
        'updateTenant',
        'changeTenantStatus',
        'addMember',
        'suspendMember',
        'removeMember',
        'listMembers',
        'registerDriver',
        'getDriver',
      ],
      contextInterceptor: this.contextInterceptor,
    });
  }

  onApplicationShutdown(): void {
    this.service?.close();
  }

  createTenant(request: CreateTenantRequest): Observable<TenantResponse> {
    return from(this.service.createTenant(request));
  }

  getTenant(request: TenantIdRequest): Observable<TenantResponse> {
    return from(this.service.getTenant(request));
  }

  listTenants(request: ListTenantsRequest): Observable<TenantListResponse> {
    return from(this.service.listTenants(request));
  }

  updateTenant(request: UpdateTenantRequest): Observable<TenantResponse> {
    return from(this.service.updateTenant(request));
  }

  changeTenantStatus(request: ChangeTenantStatusRequest): Observable<TenantResponse> {
    return from(this.service.changeTenantStatus(request));
  }

  addMember(request: MemberRequest): Observable<MemberResponse> {
    return from(this.service.addMember(request));
  }

  suspendMember(request: MemberIdRequest): Observable<MemberResponse> {
    return from(this.service.suspendMember(request));
  }

  removeMember(request: MemberIdRequest): Observable<TenantsEmpty> {
    return from(this.service.removeMember(request));
  }

  listMembers(request: ListMembersRequest): Observable<MemberListResponse> {
    return from(this.service.listMembers(request));
  }

  registerDriver(request: DriverRequest): Observable<DriverResponse> {
    return from(this.service.registerDriver(request));
  }

  getDriver(request: DriverRequest): Observable<DriverResponse> {
    return from(this.service.getDriver(request));
  }
}
