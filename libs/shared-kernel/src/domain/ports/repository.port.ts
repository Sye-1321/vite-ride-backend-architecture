import { Option } from 'oxide.ts';
import { AggregateRoot } from '../aggregate';

export class Paginated<T> {
  readonly count: number;
  readonly limit: number;
  readonly page: number;
  readonly data: readonly T[];

  constructor(props: Paginated<T>) {
    this.count = props.count;
    this.limit = props.limit;
    this.page = props.page;
    this.data = props.data;
  }
}

export type OrderBy = {
  field: string | true;
  param: 'asc' | 'desc';
};

export type PaginatedQueryParams = {
  limit: number;
  page: number;
  offset: number;
  orderBy?: OrderBy;
};

export interface RepositoryPort<Aggregate extends AggregateRoot<unknown>> {
  findById(id: string): Promise<Option<Aggregate>>;
  findOne(query: Record<string, unknown>): Promise<Option<Aggregate>>;
  findAll(): Promise<Aggregate[]>;

  findAllPaginated(
    params: PaginatedQueryParams,
    filter?: Record<string, unknown>,
  ): Promise<Paginated<Aggregate>>;

  insert(entity: Aggregate | Aggregate[]): Promise<void>;
  save(entity: Aggregate): Promise<void>;
  softDelete(entity: Aggregate): Promise<boolean>;
}
