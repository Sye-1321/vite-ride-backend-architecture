import { Option } from 'oxide.ts';
import { AggregateRoot } from '../aggregate';

export interface TenantRepositoryPort<Aggregate extends AggregateRoot<unknown>> {
  findById(id: string): Promise<Option<Aggregate>>;
  findOne(query: Record<string, unknown>): Promise<Option<Aggregate>>;
  findAll(): Promise<Aggregate[]>;
  insert(entity: Aggregate | Aggregate[]): Promise<void>;
}
