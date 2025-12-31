import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

import { ExceptionBase } from '../exceptions';

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly errorCodeToStatus: Record<string, status>,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): never {
    if (exception instanceof ExceptionBase) {
      const grpcStatus =
        this.errorCodeToStatus[exception.code] ?? status.INTERNAL;

      throw new RpcException({
        code: grpcStatus,
        message: exception.message,
        details: {
          code: exception.code,
          metadata: exception.metadata,
        },
      });
    }

    throw new RpcException({
      code: status.INTERNAL,
      message: 'Internal server error',
    });
  }
}
