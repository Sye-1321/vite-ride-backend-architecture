import { Audit } from '@app/audit';

export interface DriverProps {
  tenantId: string;
  userId: string;
  audit: Audit;
}
