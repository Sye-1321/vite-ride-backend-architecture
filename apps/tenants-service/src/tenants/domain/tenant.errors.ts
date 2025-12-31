import { ExceptionBase } from '@app/common/exceptions';

export class TenantSuspendedError extends ExceptionBase {
  static readonly message = 'Tenant is suspended.';
  public readonly code = 'TENANT.SUSPENDED';

  constructor(metadata?: unknown, cause?: Error) {
    super(TenantSuspendedError.message, cause, metadata);
  }
}
