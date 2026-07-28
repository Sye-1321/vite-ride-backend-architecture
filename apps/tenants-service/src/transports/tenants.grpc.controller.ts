import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

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
  ProtoMemberRole,
  ProtoMemberStatus,
  ProtoTenantStatus,
  TENANTS_SERVICE_NAME,
  TenantIdRequest,
  TenantListResponse,
  TenantResponse,
  TenantsEmpty,
  TenantsHealthResponse,
  UpdateTenantRequest,
} from '@app/proto-schema';

import { Driver } from '../drivers/domain/driver.entity';
import { TenantsApplicationService } from '../application/tenants-application.service';
import { TenantMember } from '../membership/domain/membership.entity';
import { TenantMemberRole, TenantMemberStatus } from '../membership/domain/membership.types';
import { Tenant } from '../tenants/domain/tenant.entity';
import { TenantStatus } from '../tenants/domain/tenant.types';

@Controller()
export class TenantsGrpcController {
  constructor(private readonly application: TenantsApplicationService) {}

  @GrpcMethod(TENANTS_SERVICE_NAME, 'CreateTenant')
  async createTenant(request: CreateTenantRequest): Promise<TenantResponse> {
    return this.mapTenant(await this.application.createTenant(request.name, request.ownerUserId));
  }

  @GrpcMethod(TENANTS_SERVICE_NAME, 'GetTenant')
  async getTenant(request: TenantIdRequest): Promise<TenantResponse> {
    return this.mapTenant(await this.application.getTenant(request.tenantId));
  }

  @GrpcMethod(TENANTS_SERVICE_NAME, 'ListTenants')
  async listTenants(request: ListTenantsRequest): Promise<TenantListResponse> {
    const result = await this.application.listTenants(request.page, request.limit, request.status);
    return {
      data: result.data.map((tenant) => this.mapTenant(tenant)),
      page: result.page,
      limit: result.limit,
      total: String(result.count),
    };
  }

  @GrpcMethod(TENANTS_SERVICE_NAME, 'UpdateTenant')
  async updateTenant(request: UpdateTenantRequest): Promise<TenantResponse> {
    return this.mapTenant(await this.application.updateTenant(request.tenantId, request.name));
  }

  @GrpcMethod(TENANTS_SERVICE_NAME, 'ChangeTenantStatus')
  async changeTenantStatus(request: ChangeTenantStatusRequest): Promise<TenantResponse> {
    return this.mapTenant(
      await this.application.changeTenantStatus(request.tenantId, request.status),
    );
  }

  @GrpcMethod(TENANTS_SERVICE_NAME, 'AddMember')
  async addMember(request: MemberRequest): Promise<MemberResponse> {
    return this.mapMember(
      await this.application.addMember(request.tenantId, request.userId, request.role),
    );
  }

  @GrpcMethod(TENANTS_SERVICE_NAME, 'SuspendMember')
  async suspendMember(request: MemberIdRequest): Promise<MemberResponse> {
    return this.mapMember(await this.application.suspendMember(request.tenantId, request.userId));
  }

  @GrpcMethod(TENANTS_SERVICE_NAME, 'RemoveMember')
  async removeMember(request: MemberIdRequest): Promise<TenantsEmpty> {
    await this.application.removeMember(request.tenantId, request.userId);
    return {};
  }

  @GrpcMethod(TENANTS_SERVICE_NAME, 'ListMembers')
  async listMembers(request: ListMembersRequest): Promise<MemberListResponse> {
    const result = await this.application.listMembers(
      request.tenantId,
      request.page,
      request.limit,
    );
    return {
      data: result.data.map((member) => this.mapMember(member)),
      page: result.page,
      limit: result.limit,
      total: String(result.count),
    };
  }

  @GrpcMethod(TENANTS_SERVICE_NAME, 'RegisterDriver')
  async registerDriver(request: DriverRequest): Promise<DriverResponse> {
    return this.mapDriver(await this.application.registerDriver(request.tenantId, request.userId));
  }

  @GrpcMethod(TENANTS_SERVICE_NAME, 'GetDriver')
  async getDriver(request: DriverRequest): Promise<DriverResponse> {
    return this.mapDriver(await this.application.getDriver(request.tenantId, request.userId));
  }

  @GrpcMethod(TENANTS_SERVICE_NAME, 'Health')
  health(): TenantsHealthResponse {
    return { status: 'SERVING' };
  }

  private mapTenant(tenant: Tenant): TenantResponse {
    const props = tenant.getProps();
    const statuses: Record<TenantStatus, ProtoTenantStatus> = {
      [TenantStatus.ACTIVE]: ProtoTenantStatus.TENANT_STATUS_ACTIVE,
      [TenantStatus.INACTIVE]: ProtoTenantStatus.TENANT_STATUS_INACTIVE,
      [TenantStatus.SUSPENDED]: ProtoTenantStatus.TENANT_STATUS_SUSPENDED,
    };
    return {
      id: tenant.id,
      name: props.name,
      status: statuses[props.status],
    };
  }

  private mapMember(member: TenantMember): MemberResponse {
    const props = member.getProps();
    return {
      id: member.id,
      tenantId: props.tenantId,
      userId: props.userId,
      role:
        props.role === TenantMemberRole.ADMIN
          ? ProtoMemberRole.MEMBER_ROLE_ADMIN
          : ProtoMemberRole.MEMBER_ROLE_DRIVER,
      status:
        props.status === TenantMemberStatus.ACTIVE
          ? ProtoMemberStatus.MEMBER_STATUS_ACTIVE
          : ProtoMemberStatus.MEMBER_STATUS_SUSPENDED,
    };
  }

  private mapDriver(driver: Driver): DriverResponse {
    return {
      id: driver.id,
      tenantId: driver.tenantId,
      userId: driver.userId,
    };
  }
}
