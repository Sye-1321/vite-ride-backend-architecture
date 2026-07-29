import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

import { ApplicationError } from '@app/application-core';

import { GrpcExceptionFilter } from './grpc-exception.filter';

describe('GrpcExceptionFilter', () => {
  const filter = new GrpcExceptionFilter();

  it('maps transport-neutral application failures to gRPC status codes', () => {
    expect(() =>
      filter.catch(new ApplicationError('UNAVAILABLE', 'Dependency unavailable')),
    ).toThrow(
      expect.objectContaining({
        error: {
          code: status.UNAVAILABLE,
          message: 'Dependency unavailable',
        },
      }),
    );
  });

  it('preserves an intentional RPC exception', () => {
    const exception = new RpcException({
      code: status.PERMISSION_DENIED,
      message: 'Denied',
    });

    expect(() => filter.catch(exception)).toThrow(exception);
  });

  it('sanitizes unexpected failures', () => {
    expect(() => filter.catch(new Error('private provider detail'))).toThrow(
      expect.objectContaining({
        error: {
          code: status.INTERNAL,
          message: 'Internal server error',
        },
      }),
    );
  });
});
