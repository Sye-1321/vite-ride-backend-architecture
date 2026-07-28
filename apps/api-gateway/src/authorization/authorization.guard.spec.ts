import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';

import { AuthorizationGrpcClient } from './authorization.grpc.client';
import { AuthorizationGuard } from './authorization.guard';

describe('AuthorizationGuard', () => {
  const context = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({
        user: { userId: 'user-1' },
        params: { tenantId: 'tenant-a' },
        headers: {},
      }),
    }),
  } as unknown as ExecutionContext;

  it('allows a request when the tenant policy permits it', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue({
        resource: 'tenant',
        action: 'read',
      }),
    } as unknown as Reflector;
    const authorization = {
      checkAccess: jest.fn().mockReturnValue(of({ allowed: true })),
    } as unknown as AuthorizationGrpcClient;

    await expect(
      new AuthorizationGuard(reflector, authorization).canActivate(context),
    ).resolves.toBe(true);
  });

  it('rejects a request when the tenant policy denies it', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue({
        resource: 'tenant',
        action: 'update',
      }),
    } as unknown as Reflector;
    const authorization = {
      checkAccess: jest.fn().mockReturnValue(of({ allowed: false })),
    } as unknown as AuthorizationGrpcClient;

    await expect(
      new AuthorizationGuard(reflector, authorization).canActivate(context),
    ).rejects.toThrow(ForbiddenException);
  });

  it('uses the global domain for non-tenant permissions', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue({
        resource: 'user',
        action: 'read',
      }),
    } as unknown as Reflector;
    const authorization = {
      checkAccess: jest.fn().mockReturnValue(of({ allowed: true })),
    } as unknown as AuthorizationGrpcClient;
    const globalContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { userId: 'admin-1' },
          params: {},
          headers: {},
        }),
      }),
    } as unknown as ExecutionContext;

    await new AuthorizationGuard(reflector, authorization).canActivate(globalContext);

    expect(authorization.checkAccess).toHaveBeenCalledWith({
      userId: 'admin-1',
      domain: '*',
      resource: 'user',
      action: 'read',
    });
  });
});
