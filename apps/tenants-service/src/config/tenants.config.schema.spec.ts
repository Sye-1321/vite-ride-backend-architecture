import { tenantsConfigSchema } from './tenants.config.schema';

describe('tenantsConfigSchema', () => {
  it('uses a credential-free in-memory store by default', () => {
    expect(tenantsConfigSchema.parse({})).toEqual({
      TENANTS_GRPC_BIND_URL: '0.0.0.0:50053',
      TENANTS_STORE_DRIVER: 'memory',
    });
  });

  it('requires a database URL when MongoDB is selected', () => {
    const result = tenantsConfigSchema.safeParse({
      TENANTS_STORE_DRIVER: 'mongodb',
    });

    expect(result.success).toBe(false);
  });
});
