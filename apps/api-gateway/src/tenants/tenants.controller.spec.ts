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
});
