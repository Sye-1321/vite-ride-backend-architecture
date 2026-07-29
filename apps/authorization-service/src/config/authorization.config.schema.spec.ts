import { authorizationConfigSchema } from './authorization.config.schema';

describe('authorizationConfigSchema', () => {
  it('accepts MongoDB-backed policy configuration', () => {
    expect(
      authorizationConfigSchema.parse({
        DATABASE_URL_AUTHZ: 'mongodb://127.0.0.1:27017/vite_ride_authz',
        DATABASE_NAME_AUTHZ: 'vite_ride_authz',
      }),
    ).toMatchObject({
      AUTHORIZATION_GRPC_BIND_URL: '0.0.0.0:50052',
      CASBIN_COLLECTION: 'casbin',
      DATABASE_NAME_AUTHZ: 'vite_ride_authz',
    });
  });

  it('requires MongoDB connection settings', () => {
    const result = authorizationConfigSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
