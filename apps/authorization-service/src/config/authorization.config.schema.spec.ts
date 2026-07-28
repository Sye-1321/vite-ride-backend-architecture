import { authorizationConfigSchema } from './authorization.config.schema';

describe('authorizationConfigSchema', () => {
  it('runs locally with the in-memory policy driver', () => {
    expect(authorizationConfigSchema.parse({})).toMatchObject({
      AUTHORIZATION_GRPC_BIND_URL: '0.0.0.0:50052',
      AUTHORIZATION_POLICY_DRIVER: 'memory',
      CASBIN_COLLECTION: 'casbin',
    });
  });

  it('requires database settings when the MongoDB driver is selected', () => {
    const result = authorizationConfigSchema.safeParse({
      AUTHORIZATION_POLICY_DRIVER: 'mongodb',
    });

    expect(result.success).toBe(false);
  });
});
