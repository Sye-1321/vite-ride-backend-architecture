import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Catch()
export class GatewayExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GatewayExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof BadRequestException) {
      const res = exception.getResponse() as any;

      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation error',
        errors: res?.message ?? [],
      });
      return;
    }

    if (exception instanceof HttpException) {
      const httpStatus = exception.getStatus();
      const body = exception.getResponse();

      response.status(httpStatus).json(
        typeof body === 'string'
          ? { statusCode: httpStatus, message: body }
          : body,
      );
      return;
    }

    if (typeof exception?.code === 'number') {
      const httpStatus = this.mapGrpcStatusToHttp(exception.code);

      response.status(httpStatus).json({
        statusCode: httpStatus,
        message: exception.details ?? exception.message ?? 'Request failed',
      });
      return;
    }

    if (exception instanceof RpcException) {
      const err = exception.getError() as any;
      const grpcCode: status = err?.code ?? status.INTERNAL;
      const httpStatus = this.mapGrpcStatusToHttp(grpcCode);

      response.status(httpStatus).json({
        statusCode: httpStatus,
        message: err?.message ?? 'Request failed',
        details: err?.details,
      });
      return;
    }

    this.logger.error(
      exception?.message ?? 'Unhandled exception',
      exception?.stack,
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }

  private mapGrpcStatusToHttp(code: status): HttpStatus {
    switch (code) {
      case status.INVALID_ARGUMENT:
        return HttpStatus.BAD_REQUEST;
      case status.NOT_FOUND:
        return HttpStatus.NOT_FOUND;
      case status.ALREADY_EXISTS:
        return HttpStatus.CONFLICT;
      case status.PERMISSION_DENIED:
        return HttpStatus.FORBIDDEN;
      case status.UNAUTHENTICATED:
        return HttpStatus.UNAUTHORIZED;
      case status.FAILED_PRECONDITION:
        return HttpStatus.PRECONDITION_FAILED;
      case status.DEADLINE_EXCEEDED:
        return HttpStatus.REQUEST_TIMEOUT;
      case status.UNAVAILABLE:
        return HttpStatus.SERVICE_UNAVAILABLE;
      case status.UNKNOWN:
        return HttpStatus.CONFLICT;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
