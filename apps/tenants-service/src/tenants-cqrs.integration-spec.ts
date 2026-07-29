import { INestApplicationContext } from '@nestjs/common';
import { CommandBus, CqrsModule, QueryBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { None, Option, Some } from 'oxide.ts';

import {
  AggregateRoot,
  Paginated,
  PaginatedQueryParams,
  RepositoryPort,
  TYPES,
} from '@app/shared-kernel';

import { DriverCommandHandlers, RegisterDriverCommand } from './drivers/application/commands';
import {
  DRIVER_REGISTRATION_PORT,
  DriverRegistrationPort,
  DriverRepositoryPort,
} from './drivers/application/ports';
import { DriverQueryHandlers } from './drivers/application/queries';
import { Driver } from './drivers/domain/driver.entity';
import {
  AddMemberCommand,
  MembershipCommandHandlers,
  RemoveMemberCommand,
  SuspendMemberCommand,
} from './membership/application/commands';
import {
  MEMBERSHIP_MUTATION_PORT,
  MembershipMutationPort,
  TenantMemberRepositoryPort,
} from './membership/application/ports';
import { ListMembersQuery, MembershipQueryHandlers } from './membership/application/queries';
import { TenantMember } from './membership/domain/membership.entity';
import { TenantMemberRole, TenantMemberStatus } from './membership/domain/membership.types';
import {
  ProvisionTenantCommand,
  ProvisionTenantHandler,
} from './provisioning/application/commands';
import { TENANT_PROVISIONING_PORT, TenantProvisioningPort } from './provisioning/application/ports';
import {
  ChangeTenantStatusCommand,
  TenantCommandHandlers,
  UpdateTenantCommand,
} from './tenants/application/commands';
import { TenantRepositoryPort } from './tenants/application/ports';
import {
  ListTenantsHandler,
  ListTenantsQuery,
  TenantQueryHandlers,
} from './tenants/application/queries';
import { Tenant } from './tenants/domain/tenant.entity';
import { TenantStatus } from './tenants/domain/tenant.types';
import { USER_DIRECTORY_PORT, UserDirectoryPort } from './users/application/user-directory.port';

abstract class RepositoryDouble<Aggregate extends AggregateRoot<object>>
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
      const candidateValue = key === '_id' ? candidate.id : props[key];
      if (typeof value === 'object' && value !== null) {
        if ('$ne' in value) {
          return candidateValue !== (value as { $ne: unknown }).$ne;
        }
        if ('$in' in value) {
          return (value as { $in: unknown[] }).$in.includes(candidateValue);
        }
      }
      return candidateValue === value;
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

  async findActiveTenantIdsByUserId(userId: string): Promise<string[]> {
    return [...this.records.values()]
      .filter(
        (candidate) =>
          candidate.userId === userId && candidate.getProps().status === TenantMemberStatus.ACTIVE,
      )
      .map((candidate) => candidate.tenantId);
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

describe('Tenants CQRS application', () => {
  let context: INestApplicationContext;
  let commands: CommandBus;
  let queries: QueryBus;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        ...TenantCommandHandlers,
        ...TenantQueryHandlers,
        ListTenantsHandler,
        ...MembershipCommandHandlers,
        ...MembershipQueryHandlers,
        ...DriverCommandHandlers,
        ...DriverQueryHandlers,
        ProvisionTenantHandler,
        { provide: TYPES.TenantRepositoryPort, useClass: TenantRepositoryDouble },
        {
          provide: TYPES.TenantMemberRepositoryPort,
          useClass: MemberRepositoryDouble,
        },
        {
          provide: MEMBERSHIP_MUTATION_PORT,
          inject: [TYPES.TenantMemberRepositoryPort],
          useFactory: (members: TenantMemberRepositoryPort): MembershipMutationPort => ({
            add: (member) => members.insert(member),
            suspend: (member) => members.save(member),
            remove: async (member) => {
              await members.softDelete(member);
            },
          }),
        },
        { provide: TYPES.DriverRepositoryPort, useClass: DriverRepositoryDouble },
        {
          provide: TENANT_PROVISIONING_PORT,
          inject: [TYPES.TenantRepositoryPort, TYPES.TenantMemberRepositoryPort],
          useFactory: (
            tenants: TenantRepositoryPort,
            members: TenantMemberRepositoryPort,
          ): TenantProvisioningPort => ({
            provision: async (tenant, owner) => {
              await tenants.insert(tenant);
              await members.insert(owner);
            },
          }),
        },
        {
          provide: DRIVER_REGISTRATION_PORT,
          inject: [TYPES.DriverRepositoryPort, TYPES.TenantMemberRepositoryPort],
          useFactory: (
            drivers: DriverRepositoryPort,
            members: TenantMemberRepositoryPort,
          ): DriverRegistrationPort => ({
            register: async (driver, membership) => {
              if (membership) {
                await members.insert(membership);
              }
              await drivers.insert(driver);
            },
          }),
        },
        {
          provide: USER_DIRECTORY_PORT,
          useValue: {
            assertExists: jest.fn().mockResolvedValue(undefined),
          } satisfies UserDirectoryPort,
        },
      ],
    }).compile();

    context = module;
    await context.init();
    commands = context.get(CommandBus);
    queries = context.get(QueryBus);
  });

  afterEach(async () => {
    await context.close();
  });

  it('provisions a tenant and manages its lifecycle through the buses', async () => {
    const tenant = await commands.execute<ProvisionTenantCommand, Tenant>(
      new ProvisionTenantCommand('North Region', 'owner-1'),
    );

    const members = await queries.execute<ListMembersQuery, Paginated<TenantMember>>(
      new ListMembersQuery(tenant.id, 1, 20),
    );
    expect(members.data[0]).toMatchObject({
      userId: 'owner-1',
      role: TenantMemberRole.ADMIN,
    });

    const renamed = await commands.execute<UpdateTenantCommand, Tenant>(
      new UpdateTenantCommand(tenant.id, 'North Operations'),
    );
    expect(renamed.name).toBe('North Operations');

    const inactive = await commands.execute<ChangeTenantStatusCommand, Tenant>(
      new ChangeTenantStatusCommand(tenant.id, TenantStatus.INACTIVE),
    );
    expect(inactive.getProps().status).toBe(TenantStatus.INACTIVE);
  });

  it('registers a driver and creates the missing driver membership', async () => {
    const tenant = await commands.execute<ProvisionTenantCommand, Tenant>(
      new ProvisionTenantCommand('South Region', 'owner-2'),
    );
    const driver = await commands.execute<RegisterDriverCommand, Driver>(
      new RegisterDriverCommand(tenant.id, 'driver-1'),
    );

    const members = await queries.execute<ListMembersQuery, Paginated<TenantMember>>(
      new ListMembersQuery(tenant.id, 1, 20),
    );
    expect(driver.userId).toBe('driver-1');
    expect(
      members.data.some(
        (member) => member.userId === 'driver-1' && member.role === TenantMemberRole.DRIVER,
      ),
    ).toBe(true);
  });

  it('returns only tenants where the user has an active membership', async () => {
    const accessible = await commands.execute<ProvisionTenantCommand, Tenant>(
      new ProvisionTenantCommand('Accessible Region', 'owner-6'),
    );
    await commands.execute(new ProvisionTenantCommand('Different Organization', 'different-owner'));

    const result = await queries.execute<ListTenantsQuery, Paginated<Tenant>>(
      new ListTenantsQuery('owner-6', 1, 20),
    );

    expect(result.data.map((tenant) => tenant.id)).toEqual([accessible.id]);
    expect(result.count).toBe(1);
  });

  it('suspends and removes a tenant member', async () => {
    const tenant = await commands.execute<ProvisionTenantCommand, Tenant>(
      new ProvisionTenantCommand('West Region', 'owner-3'),
    );
    await commands.execute(new AddMemberCommand(tenant.id, 'admin-2', TenantMemberRole.ADMIN));

    const suspended = await commands.execute<SuspendMemberCommand, TenantMember>(
      new SuspendMemberCommand(tenant.id, 'admin-2'),
    );
    expect(suspended.getProps().status).toBe(TenantMemberStatus.SUSPENDED);

    await commands.execute(new RemoveMemberCommand(tenant.id, 'admin-2'));
    const members = await queries.execute<ListMembersQuery, Paginated<TenantMember>>(
      new ListMembersQuery(tenant.id, 1, 20),
    );
    expect(members.count).toBe(1);
  });

  it('rejects tenant names regardless of casing or surrounding whitespace', async () => {
    await commands.execute(new ProvisionTenantCommand('East Region', 'owner-4'));

    await expect(
      commands.execute(new ProvisionTenantCommand(' east region ', 'owner-5')),
    ).rejects.toMatchObject({ code: 'ALREADY_EXISTS' });
  });
});
