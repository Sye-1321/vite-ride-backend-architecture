import { Model, Connection } from 'mongoose';
import { Option, Some, None } from 'oxide.ts';
import { AggregateRoot } from '@app/shared-kernel';
import { ConflictException } from '@app/common';
import { MongoMapper } from './mongo-mapper.interface';
import {
  RepositoryPort,
  Paginated,
  PaginatedQueryParams,
} from '@app/shared-kernel';

export abstract class MongoRepositoryBase<
  Aggregate extends AggregateRoot<any>,
  DbModel
> implements RepositoryPort<Aggregate> {
  protected constructor(
    protected readonly model: Model<DbModel>,
    protected readonly connection: Connection,
    protected readonly mapper: MongoMapper<Aggregate, DbModel>,
  ) {}

  protected toAggregate(doc: any): Option<Aggregate> {
    return doc ? Some(this.mapper.toDomain(doc)) : None;
  }

  async findById(id: string): Promise<Option<Aggregate>> {
    const doc = await this.model
      .findOne({ _id: id })
      .lean()
      .exec();

    return this.toAggregate(doc);
  }

  async findOne(
    query: Record<string, any>,
  ): Promise<Option<Aggregate>> {
    const doc = await this.model
      .findOne(query)
      .lean()
      .exec();

    return this.toAggregate(doc);
  }

  async findAll(): Promise<Aggregate[]> {
    const docs = await this.model
      .find()
      .lean()
      .exec();

    return docs.map(d => this.mapper.toDomain(d));
  }

  async findAllPaginated(
    params: PaginatedQueryParams,
    filter: Record<string, any> = {},
  ): Promise<Paginated<Aggregate>> {
    const { limit, offset, page, orderBy } = params;

    const query = this.model.find(filter);

    if (orderBy && orderBy.field !== true) {
      query.sort({
        [orderBy.field]: orderBy.param === 'asc' ? 1 : -1,
      });
    }

    const [docs, count] = await Promise.all([
      query.skip(offset).limit(limit).lean().exec(),
      this.model.countDocuments(filter),
    ]);

    return new Paginated({
      data: docs.map(d => this.mapper.toDomain(d)),
      count,
      limit,
      page,
    });
  }

  async insert(entity: Aggregate | Aggregate[]): Promise<void> {
    const entities = Array.isArray(entity) ? entity : [entity];
    entities.forEach(e => e.validate());

    try {
      if (entities.length === 1) {
        await this.model.create(
          this.mapper.toPersistence(entities[0]),
        );
      } else {
        await this.model.insertMany(
          entities.map(e => this.mapper.toPersistence(e)),
        );
      }
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException('Duplicate record', err);
      }
      throw err;
    }
  }

  async save(entity: Aggregate): Promise<void> {
    entity.validate();

    const persistence = this.mapper.toPersistence(entity);

    const result = await this.model
      .findOneAndUpdate(
        { _id: entity.id },
        persistence,
        { overwrite: true },
      )
      .exec();

    if (!result) {
      throw new ConflictException(
        'Cannot save aggregate that does not exist',
      );
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
