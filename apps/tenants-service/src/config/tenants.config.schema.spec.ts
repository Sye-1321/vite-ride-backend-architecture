import { tenantsConfigSchema } from './tenants.config.schema';

describe('tenantsConfigSchema', () => {
  it('accepts MongoDB-backed tenant configuration', () => {
    expect(
      tenantsConfigSchema.parse({
        DATABASE_URL_TENANTS: 'mongodb://127.0.0.1:27017/vite_ride_tenants',
      }),
    ).toEqual({
      TENANTS_GRPC_BIND_URL: '0.0.0.0:50053',
      IDENTITY_GRPC_URL: '127.0.0.1:50051',
      AUTHORIZATION_GRPC_URL: '127.0.0.1:50052',
      DATABASE_URL_TENANTS: 'mongodb://127.0.0.1:27017/vite_ride_tenants',
    });
  });

  it('requires a MongoDB connection URL', () => {
    const result = tenantsConfigSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
