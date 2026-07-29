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
import { Response } from 'express';

@Catch()
export class GatewayExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GatewayExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof BadRequestException) {
      const result = exception.getResponse();
      const messages =
        typeof result === 'object' &&
        result !== null &&
        'message' in result &&
        Array.isArray(result.message)
          ? result.message
          : [];

      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation error',
        errors: messages,
      });
      return;
    }

    if (exception instanceof HttpException) {
      const httpStatus = exception.getStatus();
      const body = exception.getResponse();

      response
        .status(httpStatus)
        .json(typeof body === 'string' ? { statusCode: httpStatus, message: body } : body);
      return;
    }

    if (this.hasNumericCode(exception)) {
      const httpStatus = this.mapGrpcStatusToHttp(exception.code);

      response.status(httpStatus).json({
        statusCode: httpStatus,
        message: this.errorMessage(exception),
      });
      return;
    }

    if (exception instanceof RpcException) {
      const raw = exception.getError();
      const error =
        typeof raw === 'object' && raw !== null
          ? (raw as Record<string, unknown>)
          : { message: String(raw) };
      const grpcCode = typeof error.code === 'number' ? error.code : status.INTERNAL;
      const httpStatus = this.mapGrpcStatusToHttp(grpcCode);

      response.status(httpStatus).json({
        statusCode: httpStatus,
        message: typeof error.message === 'string' ? error.message : 'Request failed',
        details: error.details,
      });
      return;
    }

    this.logger.error(
      exception instanceof Error ? exception.message : 'Unhandled exception',
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }

  private hasNumericCode(error: unknown): error is {
    code: status;
    details?: unknown;
    message?: unknown;
  } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'number'
    );
  }

  private errorMessage(error: { details?: unknown; message?: unknown }): string {
    if (typeof error.details === 'string') {
      return error.details;
    }
    return typeof error.message === 'string' ? error.message : 'Request failed';
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
