import { Entity } from '../entity';
import { DomainEvent } from '../events/domain-event.base';

export abstract class AggregateRoot<T> extends Entity<T> {
  private readonly _domainEvents: DomainEvent[] = [];

  protected addEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public pullDomainEvents(): DomainEvent[] {
    const events = this._domainEvents.slice();
    this._domainEvents.length = 0;
    return events;
  }
}
