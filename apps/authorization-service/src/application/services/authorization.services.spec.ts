import { RpcException } from '@nestjs/microservices';

import { AuthorizationQueryPort, RoleAssignmentPort } from '../ports';
import { AuthorizationQueryService } from './authorization-query.service';
import { RoleAssignmentService } from './role-assignment.service';

describe('authorization application services', () => {
  it('rejects incomplete access checks before calling the policy engine', async () => {
    const port: jest.Mocked<AuthorizationQueryPort> = {
      canAccess: jest.fn(),
    };
    const service = new AuthorizationQueryService(port);

    await expect(
      service.canAccess({ sub: '', domain: 'tenant-a', obj: 'user', act: 'read' }),
    ).rejects.toThrow(RpcException);
    expect(port.canAccess).not.toHaveBeenCalled();
  });

  it('rejects incomplete role assignments before calling the policy engine', async () => {
    const port: jest.Mocked<RoleAssignmentPort> = {
      assignRole: jest.fn(),
      removeRole: jest.fn(),
      readUserRoles: jest.fn(),
    };
    const service = new RoleAssignmentService(port);

    await expect(
      service.assignRole({ userId: 'user-1', domain: 'tenant-a', role: '' }),
    ).rejects.toThrow(RpcException);
    expect(port.assignRole).not.toHaveBeenCalled();
  });
});
