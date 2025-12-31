export interface PersistentEntityProps {
  readonly id?: string;

  readonly auditCreatedAt: string;
  readonly auditCreatedBy: string;

  auditUpdatedAt?: string;
  auditUpdatedBy?: string;

  auditDeletedAt?: string;
  auditDeletedBy?: string;

  isDeleted?: boolean;
}
