import { RpcException } from '@nestjs/microservices';
import { None, Option, Some } from 'oxide.ts';

import { ProtoMemberRole, ProtoTenantStatus } from '@app/proto-schema';
import { AggregateRoot, Paginated, PaginatedQueryParams, RepositoryPort } from '@app/shared-kernel';

import { TenantsApplicationService } from './application/tenants-application.service';
import { DriverRepositoryPort } from './drivers/application/ports';
import { Driver } from './drivers/domain/driver.entity';
import { TenantMemberRepositoryPort } from './membership/application/ports';
import { TenantMember } from './membership/domain/membership.entity';
import { TenantMemberRole, TenantMemberStatus } from './membership/domain/membership.types';
import { TenantRepositoryPort } from './tenants/application/ports';
import { Tenant } from './tenants/domain/tenant.entity';
import { TenantStatus } from './tenants/domain/tenant.types';

abstract class RepositoryDouble<Aggregate extends AggregateRoot<any>>
  implements RepositoryPort<Aggregate>
{
  protected readonly records = new Map<string, Aggregate>();

  async findById(id: string): Promise<Option<Aggregate>> {
    const record = this.records.get(id);
    return record ? Some(record) : None;
  }

  async findOne(query: Record<string, unknown>): Promise<Option<Aggregate>> {
    const record = [...this.records.values()].find((candidate) => this.matches(candidate, query));
    return record ? Some(record) : None;
  }

  async findAll(): Promise<Aggregate[]> {
    return [...this.records.values()];
  }

  async findAllPaginated(
    params: PaginatedQueryParams,
    filter: Record<string, unknown> = {},
  ): Promise<Paginated<Aggregate>> {
    const matching = [...this.records.values()].filter((candidate) =>
      this.matches(candidate, filter),
    );

    return new Paginated({
      data: matching.slice(params.offset, params.offset + params.limit),
      count: matching.length,
      limit: params.limit,
      page: params.page,
    });
  }

  async insert(entity: Aggregate | Aggregate[]): Promise<void> {
    for (const candidate of Array.isArray(entity) ? entity : [entity]) {
      candidate.validate();
      this.records.set(candidate.id, candidate);
    }
  }

  async save(entity: Aggregate): Promise<void> {
    entity.validate();
    this.records.set(entity.id, entity);
  }

  async softDelete(entity: Aggregate): Promise<boolean> {
    return this.records.delete(entity.id);
  }

  private matches(candidate: Aggregate, query: Record<string, unknown>): boolean {
    const props = candidate.getProps() as Record<string, unknown>;
    return Object.entries(query).every(([key, value]) => {
      if (typeof value === 'object' && value !== null && '$ne' in value) {
        return props[key] !== (value as { $ne: unknown }).$ne;
      }
      return props[key] === value;
    });
  }
}

class TenantRepositoryDouble extends RepositoryDouble<Tenant> implements TenantRepositoryPort {
  async findByName(name: string): Promise<Option<Tenant>> {
    const normalized = name.trim().toLowerCase();
    const tenant = [...this.records.values()].find(
      (candidate) => candidate.name.trim().toLowerCase() === normalized,
    );
    return tenant ? Some(tenant) : None;
  }
}

class MemberRepositoryDouble
  extends RepositoryDouble<TenantMember>
  implements TenantMemberRepositoryPort
{
  async findByTenantAndUser(tenantId: string, userId: string): Promise<Option<TenantMember>> {
    const member = [...this.records.values()].find(
      (candidate) => candidate.tenantId === tenantId && candidate.userId === userId,
    );
    return member ? Some(member) : None;
  }

  async exists(tenantId: string, userId: string, role: TenantMemberRole): Promise<boolean> {
    return [...this.records.values()].some(
      (candidate) =>
        candidate.tenantId === tenantId && candidate.userId === userId && candidate.role === role,
    );
  }
}

class DriverRepositoryDouble extends RepositoryDouble<Driver> implements DriverRepositoryPort {
  async findByUserIdAndTenantId(userId: string, tenantId: string): Promise<Option<Driver>> {
    const driver = [...this.records.values()].find(
      (candidate) => candidate.userId === userId && candidate.tenantId === tenantId,
    );
    return driver ? Some(driver) : None;
  }

  async findByDriverIdAndTenantId(driverId: string, tenantId: string): Promise<Option<Driver>> {
    const driver = this.records.get(driverId);
    return driver?.tenantId === tenantId ? Some(driver) : None;
  }
}

describe('tenants application flow', () => {
  let application: TenantsApplicationService;

  beforeEach(() => {
    application = new TenantsApplicationService(
      new TenantRepositoryDouble(),
      new MemberRepositoryDouble(),
      new DriverRepositoryDouble(),
    );
  });

  it('creates a tenant with an owner membership and manages its lifecycle', async () => {
    const tenant = await application.createTenant('North Region', 'owner-1');

    expect(tenant.getProps()).toMatchObject({
      name: 'North Region',
      status: TenantStatus.ACTIVE,
    });

    const members = await application.listMembers(tenant.id, 1, 20);
    expect(members.count).toBe(1);
    expect(members.data[0].userId).toBe('owner-1');

    await expect(application.updateTenant(tenant.id, 'North Operations')).resolves.toMatchObject({
      id: tenant.id,
    });

    const inactive = await application.changeTenantStatus(
      tenant.id,
      ProtoTenantStatus.TENANT_STATUS_INACTIVE,
    );
    expect(inactive.getProps().status).toBe(TenantStatus.INACTIVE);
  });

  it('registers a driver with a driver membership', async () => {
    const tenant = await application.createTenant('South Region', 'owner-2');
    const driver = await application.registerDriver(tenant.id, 'driver-1');

    await expect(application.getDriver(tenant.id, 'driver-1')).resolves.toBe(driver);

    const members = await application.listMembers(tenant.id, 1, 20);
    expect(members.count).toBe(2);
    expect(
      members.data.some((member) => member.userId === 'driver-1' && member.role === 'DRIVER'),
    ).toBe(true);
  });

  it('suspends and removes a tenant member', async () => {
    const tenant = await application.createTenant('West Region', 'owner-3');
    await application.addMember(tenant.id, 'admin-2', ProtoMemberRole.MEMBER_ROLE_ADMIN);

    const suspended = await application.suspendMember(tenant.id, 'admin-2');
    expect(suspended.getProps().status).toBe(TenantMemberStatus.SUSPENDED);

    await application.removeMember(tenant.id, 'admin-2');
    const members = await application.listMembers(tenant.id, 1, 20);
    expect(members.count).toBe(1);
  });

  it('rejects duplicate tenant names', async () => {
    await application.createTenant('East Region', 'owner-4');

    await expect(application.createTenant(' east region ', 'owner-5')).rejects.toThrow(
      RpcException,
    );
  });
});
