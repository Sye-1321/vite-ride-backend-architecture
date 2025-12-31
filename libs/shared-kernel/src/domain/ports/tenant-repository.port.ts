import { Option } from 'oxide.ts';
import { AggregateRoot } from '../aggregate';

export interface TenantRepositoryPort<
  Aggregate extends AggregateRoot<any>
> {
  findById(id: string): Promise<Option<Aggregate>>;
  findOne(query: Record<string, any>): Promise<Option<Aggregate>>;
  findAll(): Promise<Aggregate[]>;
  insert(entity: Aggregate | Aggregate[]): Promise<void>;
}
