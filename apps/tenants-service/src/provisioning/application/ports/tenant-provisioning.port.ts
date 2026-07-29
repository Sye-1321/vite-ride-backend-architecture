import { TenantMember } from '../../../membership/domain/membership.entity';
import { Tenant } from '../../../tenants/domain/tenant.entity';

export const TENANT_PROVISIONING_PORT = Symbol('TenantProvisioningPort');

export interface TenantProvisioningPort {
  provision(tenant: Tenant, owner: TenantMember): Promise<void>;
}
