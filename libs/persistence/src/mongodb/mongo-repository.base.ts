import { Model, Connection, FilterQuery } from 'mongoose';
import { Option, Some, None } from 'oxide.ts';
import { AggregateRoot } from '@app/shared-kernel';
import { ConflictException } from '@app/common';
import { MongoMapper } from './mongo-mapper.interface';
import { RepositoryPort, Paginated, PaginatedQueryParams } from '@app/shared-kernel';

export abstract class MongoRepositoryBase<Aggregate extends AggregateRoot<unknown>, DbModel>
  implements RepositoryPort<Aggregate>
{
  protected constructor(
    protected readonly model: Model<DbModel>,
    protected readonly connection: Connection,
    protected readonly mapper: MongoMapper<Aggregate, DbModel>,
  ) {}

  protected toAggregate(doc: unknown): Option<Aggregate> {
    return doc ? Some(this.mapper.toDomain(doc as DbModel)) : None;
  }

  async findById(id: string): Promise<Option<Aggregate>> {
    const doc = await this.model.findOne({ _id: id }).lean().exec();

    return this.toAggregate(doc);
  }

  async findOne(query: Record<string, unknown>): Promise<Option<Aggregate>> {
    const doc = await this.model
      .findOne(query as FilterQuery<DbModel>)
      .lean()
      .exec();

    return this.toAggregate(doc);
  }

  async findAll(): Promise<Aggregate[]> {
    const docs = await this.model.find().lean().exec();

    return docs.map((d) => this.mapper.toDomain(d as DbModel));
  }

  async findAllPaginated(
    params: PaginatedQueryParams,
    filter: Record<string, unknown> = {},
  ): Promise<Paginated<Aggregate>> {
    const { limit, offset, page, orderBy } = params;

    const mongoFilter = filter as FilterQuery<DbModel>;
    const query = this.model.find(mongoFilter);

    if (orderBy && orderBy.field !== true) {
      query.sort({
        [orderBy.field]: orderBy.param === 'asc' ? 1 : -1,
      });
    }

    const [docs, count] = await Promise.all([
      query.skip(offset).limit(limit).lean().exec(),
      this.model.countDocuments(mongoFilter),
    ]);

    return new Paginated({
      data: docs.map((d) => this.mapper.toDomain(d as DbModel)),
      count,
      limit,
      page,
    });
  }

  async insert(entity: Aggregate | Aggregate[]): Promise<void> {
    const entities = Array.isArray(entity) ? entity : [entity];
    entities.forEach((e) => e.validate());

    try {
      if (entities.length === 1) {
        await this.model.create(this.mapper.toPersistence(entities[0]));
      } else {
        await this.model.insertMany(entities.map((e) => this.mapper.toPersistence(e)));
      }
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err && err.code === 11000) {
        throw new ConflictException('Duplicate record', err instanceof Error ? err : undefined);
      }
      throw err;
    }
  }

  async save(entity: Aggregate): Promise<void> {
    entity.validate();

    const persistence = this.mapper.toPersistence(entity);

    const result = await this.model
      .findOneAndUpdate({ _id: entity.id }, persistence, { overwrite: true })
      .exec();

    if (!result) {
      throw new ConflictException('Cannot save aggregate that does not exist');
    }
  }

  async softDelete(entity: Aggregate): Promise<boolean> {
    entity.validate();

    const result = await this.model
      .updateOne(
        { _id: entity.id },
        {
          isDeleted: true,
          auditDeletedAt: new Date(),
        },
      )
      .exec();

    return result.modifiedCount > 0;
  }
}
