import { of } from 'rxjs';

import { TenantsController } from './tenants.controller';
import { TenantsGrpcClient } from './tenants.grpc.client';

describe('TenantsController', () => {
  it('delegates tenant provisioning as one service-owned workflow', () => {
    const tenants = {
      createTenant: jest.fn().mockReturnValue(
        of({
          id: 'tenant-a',
          name: 'North Region',
          status: 1,
        }),
      ),
    } as unknown as TenantsGrpcClient;
    const controller = new TenantsController(tenants);

    controller.createTenant('owner-1', { name: 'North Region' });

    expect(tenants.createTenant).toHaveBeenCalledWith({
      name: 'North Region',
      ownerUserId: 'owner-1',
    });
  });

  it('scopes tenant listings to the authenticated user', () => {
    const tenants = {
      listTenants: jest.fn().mockReturnValue(of({ data: [], page: 1, limit: 20, total: '0' })),
    } as unknown as TenantsGrpcClient;
    const controller = new TenantsController(tenants);

    controller.listTenants('member-1', {});

    expect(tenants.listTenants).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      status: 0,
      userId: 'member-1',
    });
  });
});
