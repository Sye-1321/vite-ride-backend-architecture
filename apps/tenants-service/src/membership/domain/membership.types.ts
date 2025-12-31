import { Audit } from '@app/audit';

export enum TenantMemberRole {
  ADMIN = 'ADMIN',
  DRIVER = 'DRIVER',
}

export enum TenantMemberStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface TenantMemberProps {
  tenantId: string;
  userId: string;
  role: TenantMemberRole;
  status: TenantMemberStatus;
  audit: Audit;
}
