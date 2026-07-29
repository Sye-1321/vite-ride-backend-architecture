import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { NextFunction, Request, Response } from 'express';
import { of } from 'rxjs';
import * as request from 'supertest';

import { AuthorizationGuard } from '@app/application-core';
import { AccessAuthGuard } from '@app/common';

import { AuthorizationGrpcClient } from '../src/authorization/authorization.grpc.client';
import { TenantsGrpcClient } from '../src/tenants/tenants.grpc.client';
import { TenantsModule } from '../src/tenants/tenants.module';

describe('tenant HTTP boundary', () => {
  let app: INestApplication;
  const tenants = {
    createTenant: jest
      .fn()
      .mockReturnValue(of({ id: 'tenant-a', name: 'North Region', status: 1 })),
  };
  const authorization = {
    assignRole: jest.fn().mockReturnValue(of({ changed: true, roles: ['tenant-admin'] })),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TenantsModule],
    })
      .overrideProvider(TenantsGrpcClient)
      .useValue(tenants)
      .overrideProvider(AuthorizationGrpcClient)
      .useValue(authorization)
      .overrideGuard(AccessAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AuthorizationGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.use((req: Request & { user?: { userId: string } }, _res: Response, next: NextFunction) => {
      req.user = { userId: 'owner-1' };
      next();
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a tenant and assigns ownership from authenticated context', async () => {
    await request(app.getHttpServer())
      .post('/tenants')
      .send({ name: 'North Region' })
      .expect(201)
      .expect({
        id: 'tenant-a',
        name: 'North Region',
        status: 1,
      });

    expect(tenants.createTenant).toHaveBeenCalledWith({
      name: 'North Region',
      ownerUserId: 'owner-1',
    });
    expect(authorization.assignRole).toHaveBeenCalledWith({
      userId: 'owner-1',
      domain: 'tenant-a',
      role: 'tenant-admin',
    });
  });

  it('rejects unknown request fields', async () => {
    await request(app.getHttpServer())
      .post('/tenants')
      .send({ name: 'North Region', unexpected: true })
      .expect(400);
  });
});
