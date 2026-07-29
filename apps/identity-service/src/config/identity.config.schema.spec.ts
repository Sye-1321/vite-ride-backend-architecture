import { identityConfigSchema } from './identity.config.schema';

describe('identityConfigSchema', () => {
  it('provides local gRPC defaults', () => {
    expect(identityConfigSchema.parse({})).toEqual({
      IDENTITY_GRPC_BIND_URL: '0.0.0.0:50051',
      NOTIFICATIONS_GRPC_URL: '127.0.0.1:50054',
    });
  });
});
