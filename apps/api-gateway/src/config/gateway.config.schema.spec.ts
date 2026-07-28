import { gatewayConfigSchema } from './gateway.config.schema';

describe('gatewayConfigSchema', () => {
  it('provides local addresses for every supported upstream', () => {
    expect(gatewayConfigSchema.parse({})).toEqual({
      GATEWAY_PORT: 3000,
      GATEWAY_PREFIX: 'vite-ride',
      IDENTITY_GRPC_URL: '127.0.0.1:50051',
      AUTHORIZATION_GRPC_URL: '127.0.0.1:50052',
      TENANTS_GRPC_URL: '127.0.0.1:50053',
    });
  });
});
