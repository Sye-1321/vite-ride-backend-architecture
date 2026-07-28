import { Audit } from './audit.vo';
import { IAudit } from './audit.interface';

export class AuditFactory {
  static createForCreate(phoneNumber: string): Audit {
    const audit: IAudit = {
      auditCreatedAt: new Date().toISOString(),
      auditCreatedBy: phoneNumber,
      isDeleted: false,
    };

    return new Audit(audit);
  }

  static createForUpdate(phoneNumber: string, existing: Audit): Audit {
    const audit: IAudit = {
      auditCreatedAt: existing.auditCreatedAt,
      auditCreatedBy: existing.auditCreatedBy,

      auditUpdatedBy: phoneNumber,
      auditUpdatedAt: new Date().toISOString(),

      auditDeletedBy: existing.auditDeletedBy,
      auditDeletedAt: existing.auditDeletedAt,
      isDeleted: existing.isDeleted,
    };

    return new Audit(audit);
  }

  static createForDelete(phoneNumber: string, existing: Audit): Audit {
    const audit: IAudit = {
      auditCreatedAt: existing.auditCreatedAt,
      auditCreatedBy: existing.auditCreatedBy,

      auditDeletedBy: phoneNumber,
      auditDeletedAt: new Date().toISOString(),
      isDeleted: true,
    };

    return new Audit(audit);
  }
}
