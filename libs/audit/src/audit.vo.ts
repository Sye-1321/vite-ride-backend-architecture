import { ValueObject } from '@app/shared-kernel';
import { IAudit } from './audit.interface';
import { ArgumentNotProvidedException } from '@app/common';

export class Audit extends ValueObject<IAudit> {
  protected validate(props: IAudit): void {
    if (!props.auditCreatedAt) {
      throw new ArgumentNotProvidedException('auditCreatedAt cannot be empty');
    }

    if (!props.auditCreatedBy) {
      throw new ArgumentNotProvidedException('auditCreatedBy cannot be empty');
    }
  }

  get auditCreatedAt(): string {
    return this.props.auditCreatedAt;
  }

  get auditCreatedBy(): string {
    return this.props.auditCreatedBy;
  }

  get auditUpdatedAt(): string | undefined {
    return this.props.auditUpdatedAt;
  }

  get auditUpdatedBy(): string | undefined {
    return this.props.auditUpdatedBy;
  }

  get auditDeletedAt(): string | undefined {
    return this.props.auditDeletedAt;
  }

  get auditDeletedBy(): string | undefined {
    return this.props.auditDeletedBy;
  }

  get isDeleted(): boolean | undefined {
    return this.props.isDeleted;
  }
}
