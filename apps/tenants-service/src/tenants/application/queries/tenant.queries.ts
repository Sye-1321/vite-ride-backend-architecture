import { TenantStatus } from '../../domain/tenant.types';

export class GetTenantQuery {
  constructor(public readonly tenantId: string) {}
}

export class ListTenantsQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly status?: TenantStatus,
  ) {}
}
