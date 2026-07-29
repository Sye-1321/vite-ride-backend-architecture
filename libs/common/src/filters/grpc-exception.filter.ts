import { Catch, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

import { ApplicationError } from '@app/application-core';

import { ExceptionBase } from '../exceptions';

const applicationErrorStatus: Record<ApplicationError['code'], status> = {
  ALREADY_EXISTS: status.ALREADY_EXISTS,
  FAILED_PRECONDITION: status.FAILED_PRECONDITION,
  INVALID_ARGUMENT: status.INVALID_ARGUMENT,
  NOT_FOUND: status.NOT_FOUND,
  UNAVAILABLE: status.UNAVAILABLE,
};

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  constructor(private readonly errorCodeToStatus: Record<string, status> = {}) {}

  catch(exception: unknown): never {
    if (exception instanceof RpcException) {
      throw exception;
    }

    if (exception instanceof ApplicationError) {
      throw new RpcException({
        code: applicationErrorStatus[exception.code],
        message: exception.message,
      });
    }

    if (exception instanceof ExceptionBase) {
      const grpcStatus = this.errorCodeToStatus[exception.code] ?? status.INTERNAL;

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
