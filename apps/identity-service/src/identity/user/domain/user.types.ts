import { Audit, IAudit } from '@app/audit';

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
}

export interface UserProps {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  passwordHash: string;
  status: UserStatus;
  refreshTokenHash: string | null;
  audit: Audit;
}
