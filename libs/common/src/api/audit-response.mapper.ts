import { ResponseBase } from './response.base';
import { Audit } from '@app/audit';

export function mapAuditToResponse(
  audit: Audit,
): ResponseBase {
  const props = audit.unpack();

  return {
    auditCreatedAt: props.auditCreatedAt,
    auditCreatedBy: props.auditCreatedBy,

    auditUpdatedAt: props.auditUpdatedAt,
    auditUpdatedBy: props.auditUpdatedBy,

    auditDeletedAt: props.auditDeletedAt,
    auditDeletedBy: props.auditDeletedBy,

    isDeleted: props.isDeleted,
  };
}
