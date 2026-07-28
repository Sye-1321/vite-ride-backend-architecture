import { None, Option, Some } from 'oxide.ts';

import { AggregateRoot, Paginated, PaginatedQueryParams, RepositoryPort } from '@app/shared-kernel';

export abstract class InMemoryRepositoryBase<Aggregate extends AggregateRoot<any>>
  implements RepositoryPort<Aggregate>
{
  protected readonly records = new Map<string, Aggregate>();

  async findById(id: string): Promise<Option<Aggregate>> {
    const record = this.records.get(id);
    return record ? Some(record) : None;
  }

  async findOne(query: Record<string, unknown>): Promise<Option<Aggregate>> {
    const record = [...this.records.values()].find((candidate) => this.matches(candidate, query));
    return record ? Some(record) : None;
  }

  async findAll(): Promise<Aggregate[]> {
    return [...this.records.values()];
  }

  async findAllPaginated(
    params: PaginatedQueryParams,
    filter: Record<string, unknown> = {},
  ): Promise<Paginated<Aggregate>> {
    const matching = [...this.records.values()].filter((candidate) =>
      this.matches(candidate, filter),
    );
    const data = matching.slice(params.offset, params.offset + params.limit);

    return new Paginated({
      data,
      count: matching.length,
      limit: params.limit,
      page: params.page,
    });
  }

  async insert(entity: Aggregate | Aggregate[]): Promise<void> {
    const entities = Array.isArray(entity) ? entity : [entity];

    for (const candidate of entities) {
      candidate.validate();
      if (this.records.has(candidate.id)) {
        throw new Error('Duplicate record');
      }
      this.records.set(candidate.id, candidate);
    }
  }

  async save(entity: Aggregate): Promise<void> {
    entity.validate();
    if (!this.records.has(entity.id)) {
      throw new Error('Cannot save aggregate that does not exist');
    }
    this.records.set(entity.id, entity);
  }

  async softDelete(entity: Aggregate): Promise<boolean> {
    return this.records.delete(entity.id);
  }

  private matches(candidate: Aggregate, query: Record<string, unknown>): boolean {
    const props = candidate.getProps() as Record<string, unknown>;
    return Object.entries(query).every(([key, value]) => {
      if (typeof value === 'object' && value !== null && '$ne' in value) {
        return props[key] !== (value as { $ne: unknown }).$ne;
      }
      return props[key] === value;
    });
  }
}
