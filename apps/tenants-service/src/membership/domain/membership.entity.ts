import { randomUUID } from 'crypto';
import { AggregateRoot, AggregateID } from '@app/shared-kernel';

import {
  TenantMemberProps,
  TenantMemberStatus,
} from './membership.types';
import {
  TenantMemberSuspendedError,
} from './membership.errors';
import { Err, Ok, Result } from 'oxide.ts';

export class TenantMember extends AggregateRoot<TenantMemberProps> {
  protected readonly _id: AggregateID;

  static create(
    props: Omit<TenantMemberProps, 'status'>,
  ): TenantMember {
    return new TenantMember({
      id: randomUUID(),
      props: {
        ...props,
        status: TenantMemberStatus.ACTIVE,
      },
    });
  }

  static rehydrate(
    props: TenantMemberProps,
    id: AggregateID,
  ): TenantMember {
    return new TenantMember({
      id,
      props,
    });
  }

  public suspend(): void {
    this.props.status = TenantMemberStatus.SUSPENDED;
  }

  public assertCanAccessTenant(): Result<void, TenantMemberSuspendedError> {
    if (this.props.status === TenantMemberStatus.SUSPENDED) {
        return Err(new TenantMemberSuspendedError());
    }

    return Ok(undefined);
    }

  get tenantId(): string {
    return this.props.tenantId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get role(): string {
    return this.props.role;
  }

  public validate(): void {
    if (!this.props.tenantId) {
      throw new Error('Tenant ID is required');
    }
    if (!this.props.userId) {
      throw new Error('User ID is required');
    }
  }
}
