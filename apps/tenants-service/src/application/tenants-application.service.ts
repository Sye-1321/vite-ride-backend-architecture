import { status } from '@grpc/grpc-js';
import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { AuditFactory } from '@app/audit';
import { ProtoMemberRole, ProtoTenantStatus } from '@app/proto-schema';
import { Paginated, TYPES } from '@app/shared-kernel';

import { DriverRepositoryPort } from '../drivers/application/ports';
import { Driver } from '../drivers/domain/driver.entity';
import { TenantMemberRepositoryPort } from '../membership/application/ports';
import { TenantMember } from '../membership/domain/membership.entity';
import { TenantMemberRole } from '../membership/domain/membership.types';
import { TenantRepositoryPort } from '../tenants/application/ports';
import { Tenant } from '../tenants/domain/tenant.entity';
import { TenantStatus } from '../tenants/domain/tenant.types';

@Injectable()
export class TenantsApplicationService {
  constructor(
    @Inject(TYPES.TenantRepositoryPort)
    private readonly tenants: TenantRepositoryPort,
    @Inject(TYPES.TenantMemberRepositoryPort)
    private readonly members: TenantMemberRepositoryPort,
    @Inject(TYPES.DriverRepositoryPort)
    private readonly drivers: DriverRepositoryPort,
  ) {}

  async createTenant(name: string, ownerUserId: string): Promise<Tenant> {
    const normalizedName = this.required(name, 'name', 120);
    const owner = this.required(ownerUserId, 'ownerUserId', 128);

    if ((await this.tenants.findByName(normalizedName)).isSome()) {
      this.fail(status.ALREADY_EXISTS, 'Tenant name already exists');
    }

    const tenant = Tenant.create({
      name: normalizedName,
      audit: AuditFactory.createForCreate(owner),
    });
    const ownerMembership = TenantMember.create({
      tenantId: tenant.id,
      userId: owner,
      role: TenantMemberRole.ADMIN,
      audit: AuditFactory.createForCreate(owner),
    });

    await this.tenants.insert(tenant);
    await this.members.insert(ownerMembership);
    return tenant;
  }

  async getTenant(tenantId: string): Promise<Tenant> {
    const found = await this.tenants.findById(this.required(tenantId, 'tenantId', 128));
    if (found.isNone()) {
      this.fail(status.NOT_FOUND, 'Tenant not found');
    }
    return found.unwrap();
  }

  async listTenants(
    page: number,
    limit: number,
    requestedStatus: ProtoTenantStatus,
  ): Promise<Paginated<Tenant>> {
    const pagination = this.pagination(page, limit);
    const tenantStatus = this.toTenantStatus(requestedStatus, true);
    return this.tenants.findAllPaginated(
      {
        ...pagination,
        offset: (pagination.page - 1) * pagination.limit,
      },
      tenantStatus ? { status: tenantStatus } : {},
    );
  }

  async updateTenant(tenantId: string, name: string): Promise<Tenant> {
    const tenant = await this.getTenant(tenantId);
    const normalizedName = this.required(name, 'name', 120);
    const sameName = await this.tenants.findByName(normalizedName);

    if (sameName.isSome() && sameName.unwrap().id !== tenant.id) {
      this.fail(status.ALREADY_EXISTS, 'Tenant name already exists');
    }

    tenant.updateName(normalizedName);
    await this.tenants.save(tenant);
    return tenant;
  }

  async changeTenantStatus(tenantId: string, requestedStatus: ProtoTenantStatus): Promise<Tenant> {
    const tenant = await this.getTenant(tenantId);
    const nextStatus = this.toTenantStatus(requestedStatus, false);

    if (nextStatus === TenantStatus.ACTIVE) {
      const result = tenant.activate();
      if (result.isErr()) {
        this.fail(status.FAILED_PRECONDITION, 'A suspended tenant cannot be reactivated');
      }
    } else if (nextStatus === TenantStatus.INACTIVE) {
      tenant.deactivate();
    } else {
      tenant.suspend();
    }

    await this.tenants.save(tenant);
    return tenant;
  }

  async addMember(
    tenantId: string,
    userId: string,
    requestedRole: ProtoMemberRole,
  ): Promise<TenantMember> {
    const tenant = await this.getTenant(tenantId);
    const user = this.required(userId, 'userId', 128);
    const role = this.toMemberRole(requestedRole);

    if (await this.members.exists(tenant.id, user, role)) {
      this.fail(status.ALREADY_EXISTS, 'Tenant membership already exists');
    }

    const member = TenantMember.create({
      tenantId: tenant.id,
      userId: user,
      role,
      audit: AuditFactory.createForCreate(user),
    });
    await this.members.insert(member);
    return member;
  }

  async suspendMember(tenantId: string, userId: string): Promise<TenantMember> {
    const member = await this.getMember(tenantId, userId);
    member.suspend();
    await this.members.save(member);
    return member;
  }

  async removeMember(tenantId: string, userId: string): Promise<void> {
    const member = await this.getMember(tenantId, userId);
    await this.members.softDelete(member);
  }

  async listMembers(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<Paginated<TenantMember>> {
    const tenant = await this.getTenant(tenantId);
    const pagination = this.pagination(page, limit);
    return this.members.findAllPaginated(
      {
        ...pagination,
        offset: (pagination.page - 1) * pagination.limit,
      },
      { tenantId: tenant.id, isDeleted: { $ne: true } },
    );
  }

  async registerDriver(tenantId: string, userId: string): Promise<Driver> {
    const tenant = await this.getTenant(tenantId);
    const user = this.required(userId, 'userId', 128);

    if ((await this.drivers.findByUserIdAndTenantId(user, tenant.id)).isSome()) {
      this.fail(status.ALREADY_EXISTS, 'Driver already exists');
    }

    if (!(await this.members.exists(tenant.id, user, TenantMemberRole.DRIVER))) {
      await this.addMember(tenant.id, user, ProtoMemberRole.MEMBER_ROLE_DRIVER);
    }

    const driver = Driver.create({
      tenantId: tenant.id,
      userId: user,
      audit: AuditFactory.createForCreate(user),
    });
    await this.drivers.insert(driver);
    return driver;
  }

  async getDriver(tenantId: string, userId: string): Promise<Driver> {
    const found = await this.drivers.findByUserIdAndTenantId(
      this.required(userId, 'userId', 128),
      this.required(tenantId, 'tenantId', 128),
    );
    if (found.isNone()) {
      this.fail(status.NOT_FOUND, 'Driver not found');
    }
    return found.unwrap();
  }

  private async getMember(tenantId: string, userId: string): Promise<TenantMember> {
    const found = await this.members.findByTenantAndUser(
      this.required(tenantId, 'tenantId', 128),
      this.required(userId, 'userId', 128),
    );
    if (found.isNone()) {
      this.fail(status.NOT_FOUND, 'Tenant member not found');
    }
    return found.unwrap();
  }

  private pagination(page: number, limit: number): { page: number; limit: number } {
    return {
      page: Number.isInteger(page) && page > 0 ? page : 1,
      limit: Number.isInteger(limit) && limit > 0 ? Math.min(limit, 100) : 20,
    };
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
      this.fail(status.INVALID_ARGUMENT, 'A valid tenant status is required');
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
    this.fail(status.INVALID_ARGUMENT, 'A valid member role is required');
  }

  private required(value: string, field: string, max: number): string {
    const normalized = value?.trim();
    if (!normalized || normalized.length > max) {
      this.fail(status.INVALID_ARGUMENT, `${field} must contain between 1 and ${max} characters`);
    }
    return normalized;
  }

  private fail(code: status, message: string): never {
    throw new RpcException({ code, message });
  }
}
