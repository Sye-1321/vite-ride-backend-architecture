import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Option, Some, None } from 'oxide.ts';

import { MongoRepositoryBase } from '@app/persistence/mongodb/mongo-repository.base';
import { TenantMember } from '../../../domain/membership.entity';
import { TenantMemberRole } from '../../../domain/membership.types';
import { TenantMemberRepositoryPort } from '../../../application/ports';

import { TenantMemberDataModel } from './tenant-member.schema';
import { TenantMemberMapper } from './tenant-member.mapper';

@Injectable()
export class TenantMemberMongoRepository
  extends MongoRepositoryBase<TenantMember, TenantMemberDataModel>
  implements TenantMemberRepositoryPort
{
  constructor(
    @InjectModel(TenantMemberDataModel.name)
    model: Model<TenantMemberDataModel>,
    @InjectConnection()
    connection: Connection,
    mapper: TenantMemberMapper,
  ) {
    super(model, connection, mapper);
  }

  async findByTenantAndUser(
    tenantId: string,
    userId: string,
  ): Promise<Option<TenantMember>> {
    const doc = await this.model
      .findOne({ tenantId, userId })
      .lean()
      .exec();

    return doc ? Some(this.mapper.toDomain(doc)) : None;
  }

  async exists(
    tenantId: string,
    userId: string,
    role: TenantMemberRole,
  ): Promise<boolean> {
    const count = await this.model
      .countDocuments({ tenantId, userId, role })
      .exec();

    return count > 0;
  }
}
