import { of } from 'rxjs';

import { AuthorizationGrpcClient } from '../authorization/authorization.grpc.client';
import { TenantsController } from './tenants.controller';
import { TenantsGrpcClient } from './tenants.grpc.client';

describe('TenantsController', () => {
  it('assigns the tenant-admin role to a new tenant owner', async () => {
    const tenants = {
      createTenant: jest.fn().mockReturnValue(
        of({
          id: 'tenant-a',
          name: 'North Region',
          status: 1,
        }),
      ),
    } as unknown as TenantsGrpcClient;
    const authorization = {
      assignRole: jest.fn().mockReturnValue(of({ changed: true, roles: ['tenant-admin'] })),
    } as unknown as AuthorizationGrpcClient;
    const controller = new TenantsController(tenants, authorization);

    await expect(
      controller.createTenant('owner-1', { name: 'North Region' }),
    ).resolves.toMatchObject({ id: 'tenant-a' });
    expect(authorization.assignRole).toHaveBeenCalledWith({
      userId: 'owner-1',
      domain: 'tenant-a',
      role: 'tenant-admin',
    });
  });
});
