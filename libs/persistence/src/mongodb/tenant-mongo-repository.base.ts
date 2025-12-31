import { Document, Model, Connection } from 'mongoose';
import { Option } from 'oxide.ts';
import { AggregateRoot } from '@app/shared-kernel';
import { MongoRepositoryBase } from './mongo-repository.base';
import { MongoMapper } from './mongo-mapper.interface';
import { RequestContextAccessor } from '@app/context';
import { TenantRepositoryPort } from '@app/shared-kernel';

/**
 * Tenant-scoped MongoDB repository base.
 *
 * - Enforces tenant isolation
 * - DbModel MUST contain tenantId
 * - Tenant context is resolved internally
 * - Services/controllers never pass tenantId
 */
export abstract class TenantMongoRepositoryBase<
  Aggregate extends AggregateRoot<any>,
  DbModel extends Document & { tenantId: string }
> extends MongoRepositoryBase<Aggregate, DbModel>
  implements TenantRepositoryPort<Aggregate> {

  protected constructor(
    model: Model<DbModel>,
    connection: Connection,
    mapper: MongoMapper<Aggregate, DbModel>,
    protected readonly context: RequestContextAccessor,
  ) {
    super(model, connection, mapper);
  }

  protected tenantFilter(): { tenantId: string } {
    const ctx = this.context.get();
    const tenantId = ctx.tenantId;

    if (!tenantId) {
      throw new Error('Tenant context is missing or invalid');
    }

    return { tenantId };
  }

  async findById(id: string): Promise<Option<Aggregate>> {
    const doc = await this.model.findOne({
      _id: id,
      ...this.tenantFilter(),
    }).lean().exec();

    return this.toAggregate(doc);
  }

  async findOne(query: Record<string, any>): Promise<Option<Aggregate>> {
    const doc = await this.model.findOne({
      ...query,
      ...this.tenantFilter(),
    }).lean().exec();

    return this.toAggregate(doc);
  }

  async findAll(): Promise<Aggregate[]> {
    const docs = await this.model
      .find(this.tenantFilter())
      .lean()
      .exec();

    return docs.map(d => this.mapper.toDomain(d));
  }

  async insert(entity: Aggregate | Aggregate[]): Promise<void> {
    const { tenantId } = this.tenantFilter();
    const entities = Array.isArray(entity) ? entity : [entity];

    entities.forEach(e => e.validate());

    const payload = entities.map(e => ({
      ...this.mapper.toPersistence(e),
      tenantId,
    }));

    await this.model.insertMany(payload);
  }
}
