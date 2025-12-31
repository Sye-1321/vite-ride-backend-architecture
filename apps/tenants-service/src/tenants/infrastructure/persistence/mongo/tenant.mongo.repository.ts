import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Option, Some, None } from 'oxide.ts';

import { MongoRepositoryBase } from '@app/persistence/mongodb/mongo-repository.base';
import { Tenant } from '../../../domain/tenant.entity';
import { TenantDataModel } from './tenant.schema';
import { TenantMapper } from './tenant.mapper';

@Injectable()
export class TenantRepository extends MongoRepositoryBase<
  Tenant,
  TenantDataModel
> {
  constructor(
    @InjectModel(TenantDataModel.name)
    model: Model<TenantDataModel>,
    @InjectConnection()
    connection: Connection,
    mapper: TenantMapper,
  ) {
    super(model, connection, mapper);
  }

  async findByName(name: string): Promise<Option<Tenant>> {
    const doc = await this.model
      .findOne({ name })
      .lean()
      .exec();

    return doc
      ? Some(this.mapper.toDomain(doc))
      : None;
  }
}
