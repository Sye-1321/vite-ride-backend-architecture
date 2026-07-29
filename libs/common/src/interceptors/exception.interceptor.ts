import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiErrorResponse } from '../api';
import { TYPES } from '@app/shared-kernel';
import { RequestContextAccessor, RequestContext } from '@app/context';

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ExceptionInterceptor.name);

  constructor(
    @Inject(TYPES.RequestContextAccessor)
    private readonly requestContextAccessor: RequestContextAccessor,
  ) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error) => {
        let ctx: RequestContext | undefined;
        try {
          ctx = this.requestContextAccessor.get();
        } catch {
          ctx = undefined;
        }

        const correlationId = ctx?.correlationId ?? 'UNKNOWN';

        this.logger.error(`[${correlationId}] ${error?.message ?? 'Unhandled exception'}`);

        const isClassValidatorError =
          error?.status === 400 &&
          Array.isArray(error?.response?.message) &&
          typeof error?.response?.error === 'string';

        if (isClassValidatorError) {
          error = new BadRequestException(
            new ApiErrorResponse({
              statusCode: error.status,
              message: 'Validation error',
              error: error.response.error,
              subErrors: error.response.message,
              correlationId,
            }),
          );
        }

        if (error && typeof error === 'object') {
          if (!error.correlationId) {
            error.correlationId = correlationId;
          }
          if (error.response && typeof error.response === 'object') {
            error.response.correlationId = correlationId;
          }
        }

        return throwError(() => error);
      }),
    );
  }
}
