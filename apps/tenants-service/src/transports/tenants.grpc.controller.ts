import { status } from '@grpc/grpc-js';
import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GrpcMethod, RpcException } from '@nestjs/microservices';

import { ApplicationError } from '@app/application-core';
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
import { Paginated } from '@app/shared-kernel';

import { GetDriverQuery, RegisterDriverCommand } from '../drivers/application';
import { Driver } from '../drivers/domain/driver.entity';
import {
  AddMemberCommand,
  ListMembersQuery,
  RemoveMemberCommand,
  SuspendMemberCommand,
} from '../membership/application';
import { TenantMember } from '../membership/domain/membership.entity';
import { TenantMemberRole, TenantMemberStatus } from '../membership/domain/membership.types';
import { ProvisionTenantCommand } from '../provisioning/application/commands';
import {
  ChangeTenantStatusCommand,
  GetTenantQuery,
  ListTenantsQuery,
  UpdateTenantCommand,
} from '../tenants/application';
import { Tenant } from '../tenants/domain/tenant.entity';
import { TenantStatus } from '../tenants/domain/tenant.types';

@Controller()
export class TenantsGrpcController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @GrpcMethod(TENANTS_SERVICE_NAME, 'CreateTenant')
  async createTenant(request: CreateTenantRequest): Promise<TenantResponse> {
    const tenant = await this.command<Tenant>(
      new ProvisionTenantCommand(request.name, request.ownerUserId),
    );
    return this.mapTenant(tenant);
  }

  @GrpcMethod(TENANTS_SERVICE_NAME, 'GetTenant')
  async getTenant(request: TenantIdRequest): Promise<TenantResponse> {
    return this.mapTenant(await this.query<Tenant>(new GetTenantQuery(request.tenantId)));
  }

  @GrpcMethod(TENANTS_SERVICE_NAME, 'ListTenants')
  async listTenants(request: ListTenantsRequest): Promise<TenantListResponse> {
    const result = await this.query<Paginated<Tenant>>(
      new ListTenantsQuery(request.page, request.limit, this.toTenantStatus(request.status, true)),
    );
    return {
      data: result.data.map((tenant) => this.mapTenant(tenant)),
      page: result.page,
      limit: result.limit,
      total: String(result.count),
    };
  }

  @GrpcMethod(TENANTS_SERVICE_NAME, 'UpdateTenant')
  async updateTenant(request: UpdateTenantRequest): Promise<TenantResponse> {
    return this.mapTenant(
      await this.command<Tenant>(new UpdateTenantCommand(request.tenantId, request.name)),
    );
  }

  @GrpcMethod(TENANTS_SERVICE_NAME, 'ChangeTenantStatus')
  async changeTenantStatus(request: ChangeTenantStatusRequest): Promise<TenantResponse> {
    return this.mapTenant(
      await this.command<Tenant>(
        new ChangeTenantStatusCommand(
          request.tenantId,
          this.toTenantStatus(request.status, false)!,
        ),
      ),
    );
  }

  @GrpcMethod(TENANTS_SERVICE_NAME, 'AddMember')
  async addMember(request: MemberRequest): Promise<MemberResponse> {
    return this.mapMember(
      await this.command<TenantMember>(
        new AddMemberCommand(request.tenantId, request.userId, this.toMemberRole(request.role)),
      ),
    );
  }

  @GrpcMethod(TENANTS_SERVICE_NAME, 'SuspendMember')
  async suspendMember(request: MemberIdRequest): Promise<MemberResponse> {
    return this.mapMember(
      await this.command<TenantMember>(new SuspendMemberCommand(request.tenantId, request.userId)),
    );
  }

  @GrpcMethod(TENANTS_SERVICE_NAME, 'RemoveMember')
  async removeMember(request: MemberIdRequest): Promise<TenantsEmpty> {
    await this.command<void>(new RemoveMemberCommand(request.tenantId, request.userId));
    return {};
  }

  @GrpcMethod(TENANTS_SERVICE_NAME, 'ListMembers')
  async listMembers(request: ListMembersRequest): Promise<MemberListResponse> {
    const result = await this.query<Paginated<TenantMember>>(
      new ListMembersQuery(request.tenantId, request.page, request.limit),
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
    return this.mapDriver(
      await this.command<Driver>(new RegisterDriverCommand(request.tenantId, request.userId)),
    );
  }

  @GrpcMethod(TENANTS_SERVICE_NAME, 'GetDriver')
  async getDriver(request: DriverRequest): Promise<DriverResponse> {
    return this.mapDriver(
      await this.query<Driver>(new GetDriverQuery(request.tenantId, request.userId)),
    );
  }

  @GrpcMethod(TENANTS_SERVICE_NAME, 'Health')
  health(): TenantsHealthResponse {
    return { status: 'SERVING' };
  }

  private async command<T>(command: object): Promise<T> {
    try {
      return await this.commandBus.execute(command);
    } catch (error) {
      this.rethrow(error);
    }
  }

  private async query<T>(query: object): Promise<T> {
    try {
      return await this.queryBus.execute(query);
    } catch (error) {
      this.rethrow(error);
    }
  }

  private rethrow(error: unknown): never {
    if (!(error instanceof ApplicationError)) {
      throw error;
    }
    const codes = {
      ALREADY_EXISTS: status.ALREADY_EXISTS,
      FAILED_PRECONDITION: status.FAILED_PRECONDITION,
      INVALID_ARGUMENT: status.INVALID_ARGUMENT,
      NOT_FOUND: status.NOT_FOUND,
      UNAVAILABLE: status.UNAVAILABLE,
    } as const;
    throw new RpcException({ code: codes[error.code], message: error.message });
  }

  private toTenantStatus(
    value: ProtoTenantStatus,
    allowUnspecified: boolean,
  ): TenantStatus | undefined {
    const statuses: Partial<Record<ProtoTenantStatus, TenantStatus>> = {
      [ProtoTenantStatus.TENANT_STATUS_ACTIVE]: TenantStatus.ACTIVE,
      [ProtoTenantStatus.TENANT_STATUS_INACTIVE]: TenantStatus.INACTIVE,
      [ProtoTenantStatus.TENANT_STATUS_SUSPENDED]: TenantStatus.SUSPENDED,
    };
    const mapped = statuses[value];
    if (!mapped && !allowUnspecified) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'A valid tenant status is required',
      });
    }
    return mapped;
  }

  private toMemberRole(value: ProtoMemberRole): TenantMemberRole {
    if (value === ProtoMemberRole.MEMBER_ROLE_ADMIN) {
      return TenantMemberRole.ADMIN;
    }
    if (value === ProtoMemberRole.MEMBER_ROLE_DRIVER) {
      return TenantMemberRole.DRIVER;
    }
    throw new RpcException({
      code: status.INVALID_ARGUMENT,
      message: 'A valid member role is required',
    });
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
