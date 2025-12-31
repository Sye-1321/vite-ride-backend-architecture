import { randomUUID } from 'crypto';
import { AggregateRoot, AggregateID } from '@app/shared-kernel';
import { DriverProps } from './driver.types';

export class Driver extends AggregateRoot<DriverProps> {
  protected readonly _id: AggregateID;

  static create(props: DriverProps): Driver {
    return new Driver({
      id: randomUUID(),
      props,
    });
  }

  static rehydrate(props: DriverProps, id: AggregateID): Driver {
    return new Driver({
      id,
      props,
    });
  }

  get tenantId(): string {
    return this.props.tenantId;
  }

  get userId(): string {
    return this.props.userId;
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
