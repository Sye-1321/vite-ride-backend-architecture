export interface IAudit {
  readonly auditCreatedAt: string;
  readonly auditCreatedBy: string;

  auditUpdatedAt?: string;
  auditUpdatedBy?: string;

  auditDeletedAt?: string;
  auditDeletedBy?: string;

  isDeleted?: boolean;
}
