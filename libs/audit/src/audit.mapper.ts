import { Audit } from './audit.vo';
import { IAudit } from './audit.interface';

export class AuditMapper {
  static toPersistence(audit: Audit): IAudit {
    return audit.unpack();
  }

  static toDomain(raw: IAudit): Audit {
    return new Audit(raw);
  }
}
