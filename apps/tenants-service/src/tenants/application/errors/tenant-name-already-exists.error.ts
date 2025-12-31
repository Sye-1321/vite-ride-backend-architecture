import { ExceptionBase } from '@app/common/exceptions';

export class TenantNameAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Tenant name already exists.';
  public readonly code = 'TENANT.NAME_ALREADY_EXISTS';

  constructor(metadata?: unknown, cause?: Error) {
    super(TenantNameAlreadyExistsError.message, cause, metadata);
  }
}
