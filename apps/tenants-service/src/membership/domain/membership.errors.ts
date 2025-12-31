import { ExceptionBase } from '@app/common/exceptions';

export class TenantMemberSuspendedError extends ExceptionBase {
  static readonly message = 'Tenant member is suspended.';
  public readonly code = 'TENANT_MEMBER.SUSPENDED';

  constructor(metadata?: unknown, cause?: Error) {
    super(TenantMemberSuspendedError.message, cause, metadata);
  }
}
