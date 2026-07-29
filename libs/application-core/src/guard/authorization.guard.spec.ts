import {
  ExecutionContext,
  ForbiddenException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthorizationDecisionPort } from '../ports';
import { AuthorizationGuard } from './authorization.guard';

describe('AuthorizationGuard', () => {
  const contextFor = (userId = 'user-1', tenantId = 'tenant-a') =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: userId ? { userId } : undefined,
          params: tenantId ? { tenantId } : {},
          headers: {},
        }),
      }),
    }) as unknown as ExecutionContext;

  const reflectorFor = (permission?: { resource: string; action: string }) =>
    ({
      getAllAndOverride: jest.fn().mockReturnValue(permission),
    }) as unknown as Reflector;

  it('allows a request when no permission metadata is present', async () => {
    const authorization = { authorize: jest.fn() } as unknown as AuthorizationDecisionPort;

    await expect(
      new AuthorizationGuard(reflectorFor(), authorization).canActivate(contextFor()),
    ).resolves.toBe(true);
    expect(authorization.authorize).not.toHaveBeenCalled();
  });

  it('allows a request only when the decision port permits it', async () => {
    const authorization = {
      authorize: jest.fn().mockResolvedValue({ allowed: true }),
    } as unknown as AuthorizationDecisionPort;

    await expect(
      new AuthorizationGuard(
        reflectorFor({ resource: 'tenant', action: 'read' }),
        authorization,
      ).canActivate(contextFor()),
    ).resolves.toBe(true);
    expect(authorization.authorize).toHaveBeenCalledWith({
      userId: 'user-1',
      domain: 'tenant-a',
      resource: 'tenant',
      action: 'read',
    });
  });

  it('denies a rejected authorization decision', async () => {
    const authorization = {
      authorize: jest.fn().mockResolvedValue({ allowed: false }),
    } as unknown as AuthorizationDecisionPort;

    await expect(
      new AuthorizationGuard(
        reflectorFor({ resource: 'tenant', action: 'update' }),
        authorization,
      ).canActivate(contextFor()),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects missing authentication context', async () => {
    const authorization = { authorize: jest.fn() } as unknown as AuthorizationDecisionPort;

    await expect(
      new AuthorizationGuard(
        reflectorFor({ resource: 'tenant', action: 'read' }),
        authorization,
      ).canActivate(contextFor('', 'tenant-a')),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('fails closed when the authorization dependency is unavailable', async () => {
    const authorization = {
      authorize: jest.fn().mockRejectedValue(new Error('connection refused')),
    } as unknown as AuthorizationDecisionPort;

    await expect(
      new AuthorizationGuard(
        reflectorFor({ resource: 'tenant', action: 'read' }),
        authorization,
      ).canActivate(contextFor()),
    ).rejects.toThrow(ServiceUnavailableException);
  });
});
