export interface ResponseBase {
  auditCreatedAt: string;
  auditCreatedBy: string;

  auditUpdatedAt?: string;
  auditUpdatedBy?: string;

  auditDeletedAt?: string;
  auditDeletedBy?: string;

  isDeleted?: boolean;
}
