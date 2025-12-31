import { randomUUID } from 'crypto';

export type DomainEventProps<T> = Omit<T, 'id' | 'occurredAt'> & {
  readonly id?: string;
  readonly occurredAt?: number;
  readonly aggregateId: string;
};

export abstract class DomainEvent {
  readonly id: string;
  readonly aggregateId: string;
  readonly occurredAt: number;

  protected constructor(props: DomainEventProps<unknown>) {
    this.id = props.id ?? randomUUID();
    this.aggregateId = props.aggregateId;
    this.occurredAt = props.occurredAt ?? Date.now();
  }
}
