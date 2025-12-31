import { Audit } from '@app/audit';

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface TenantProps {
  name: string;
  status: TenantStatus;
  audit: Audit;
}
