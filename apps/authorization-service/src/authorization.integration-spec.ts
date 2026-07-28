import { Logger } from '@nestjs/common';
import { newEnforcer } from 'casbin';
import { join } from 'path';

import { AuthorizationQueryService } from './application/services/authorization-query.service';
import { RoleAssignmentService } from './application/services/role-assignment.service';
import { CasbinAuthorizationAdapter } from './engines/casbin/casbin-authorization.adapter';
import { PolicyBootstrapService } from './engines/casbin/policy-bootstrap.service';

describe('authorization policy flow', () => {
  it('assigns and removes a tenant-scoped role idempotently', async () => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    const enforcer = await newEnforcer(
      join(process.cwd(), 'apps/authorization-service/src/engines/casbin/rbac_model.conf'),
    );
    await new PolicyBootstrapService(enforcer).onModuleInit();

    const adapter = new CasbinAuthorizationAdapter(enforcer);
    const queryService = new AuthorizationQueryService(adapter);
    const roleService = new RoleAssignmentService(adapter);

    await expect(
      roleService.assignRole({
        userId: 'user-1',
        domain: '*',
        role: 'system-admin',
      }),
    ).resolves.toEqual({ changed: true, roles: ['system-admin'] });

    await expect(
      roleService.assignRole({
        userId: 'user-1',
        domain: '*',
        role: 'system-admin',
      }),
    ).resolves.toEqual({ changed: false, roles: ['system-admin'] });

    await expect(
      queryService.canAccess({
        sub: 'user-1',
        domain: '*',
        obj: 'user',
        act: 'read',
      }),
    ).resolves.toEqual({ allowed: true });

    await expect(
      queryService.canAccess({
        sub: 'user-1',
        domain: 'tenant-b',
        obj: 'user',
        act: 'read',
      }),
    ).resolves.toEqual({ allowed: false });

    await roleService.assignRole({
      userId: 'admin-1',
      domain: 'tenant-a',
      role: 'tenant-admin',
    });
    await expect(
      queryService.canAccess({
        sub: 'admin-1',
        domain: 'tenant-a',
        obj: 'tenant',
        act: 'manage-members',
      }),
    ).resolves.toEqual({ allowed: true });

    await expect(
      roleService.removeRole({
        userId: 'user-1',
        domain: '*',
        role: 'system-admin',
      }),
    ).resolves.toEqual({ changed: true, roles: [] });

    await expect(
      queryService.canAccess({
        sub: 'user-1',
        domain: '*',
        obj: 'user',
        act: 'read',
      }),
    ).resolves.toEqual({ allowed: false });

    jest.restoreAllMocks();
  });
});
