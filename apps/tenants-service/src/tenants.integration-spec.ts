import { RpcException } from '@nestjs/microservices';

import { ProtoMemberRole, ProtoTenantStatus } from '@app/proto-schema';

import { TenantsApplicationService } from './application/tenants-application.service';
import {
  DriverInMemoryRepository,
  TenantInMemoryRepository,
  TenantMemberInMemoryRepository,
} from './infrastructure/in-memory';
import { TenantMemberStatus } from './membership/domain/membership.types';
import { TenantStatus } from './tenants/domain/tenant.types';

describe('tenants application flow', () => {
  let application: TenantsApplicationService;

  beforeEach(() => {
    application = new TenantsApplicationService(
      new TenantInMemoryRepository(),
      new TenantMemberInMemoryRepository(),
      new DriverInMemoryRepository(),
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
