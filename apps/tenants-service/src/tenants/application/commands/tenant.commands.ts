import { TenantStatus } from '../../domain/tenant.types';

export class UpdateTenantCommand {
  constructor(
    public readonly tenantId: string,
    public readonly name: string,
  ) {}
}

export class ChangeTenantStatusCommand {
  constructor(
    public readonly tenantId: string,
    public readonly status: TenantStatus,
  ) {}
}
