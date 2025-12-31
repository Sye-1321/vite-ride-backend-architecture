import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Option, Some, None } from 'oxide.ts';

import { MongoRepositoryBase } from '@app/persistence/mongodb/mongo-repository.base';
import { Driver } from '../../../domain/driver.entity';
import { DriverDataModel } from './driver.schema';
import { DriverMapper } from './driver.mapper';
import { DriverRepositoryPort } from '../../../application/ports';

@Injectable()
export class DriverMongoRepository
  extends MongoRepositoryBase<Driver, DriverDataModel>
  implements DriverRepositoryPort
{
  constructor(
    @InjectModel(DriverDataModel.name)
    model: Model<DriverDataModel>,
    @InjectConnection()
    connection: Connection,
    mapper: DriverMapper,
  ) {
    super(model, connection, mapper);
  }

  async findByUserIdAndTenantId(
    userId: string,
    tenantId: string,
  ): Promise<Option<Driver>> {
    const doc = await this.model
      .findOne({ userId, tenantId })
      .lean()
      .exec();

    return doc ? Some(this.mapper.toDomain(doc)) : None;
  }

  async findByDriverIdAndTenantId(
    driverId: string,
    tenantId: string,
  ): Promise<Option<Driver>> {
    const doc = await this.model
      .findOne({ driverId, tenantId })
      .lean()
      .exec();

    return doc ? Some(this.mapper.toDomain(doc)) : None;
  }
}
