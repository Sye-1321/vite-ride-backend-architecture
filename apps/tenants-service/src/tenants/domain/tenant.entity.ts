import { randomUUID } from 'crypto';
import { AggregateRoot, AggregateID } from '@app/shared-kernel';
import { Err, Ok, Result } from 'oxide.ts';

import { TenantProps, TenantStatus } from './tenant.types';
import { TenantSuspendedError } from './tenant.errors';
import { normalizeTenantName } from './tenant-name';

export class Tenant extends AggregateRoot<TenantProps> {
  protected readonly _id: AggregateID;

  static create(props: Omit<TenantProps, 'status'>): Tenant {
    return new Tenant({
      id: randomUUID(),
      props: {
        ...props,
        name: props.name.trim(),
        status: TenantStatus.ACTIVE,
      },
    });
  }

  static rehydrate(props: TenantProps, id: AggregateID): Tenant {
    return new Tenant({
      id,
      props,
    });
  }

  public suspend(): void {
    this.props.status = TenantStatus.SUSPENDED;
  }

  public deactivate(): void {
    this.props.status = TenantStatus.INACTIVE;
  }

  public activate(): Result<void, TenantSuspendedError> {
    if (this.props.status === TenantStatus.SUSPENDED) {
      return Err(new TenantSuspendedError());
    }

    this.props.status = TenantStatus.ACTIVE;
    return Ok(undefined);
  }

  get name(): string {
    return this.props.name;
  }

  public updateName(name: string): void {
    this.props.name = name.trim();
  }

  public validate(): void {
    const normalizedName = normalizeTenantName(this.props.name);
    if (!normalizedName || normalizedName.length > 120) {
      throw new Error('Tenant name is required');
    }
  }
}
