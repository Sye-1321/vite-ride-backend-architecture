import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Option, Some, None } from 'oxide.ts';

import { MongoRepositoryBase } from '@app/persistence/mongodb/mongo-repository.base';
import { TenantMember } from '../../../domain/membership.entity';
import { TenantMemberRole, TenantMemberStatus } from '../../../domain/membership.types';
import { TenantMemberRepositoryPort } from '../../../application/ports';

import { TenantMemberDataModel } from './tenant-member.schema';
import { TenantMemberMapper } from './tenant-member.mapper';

@Injectable()
export class TenantMemberMongoRepository
  extends MongoRepositoryBase<TenantMember, TenantMemberDataModel>
  implements TenantMemberRepositoryPort
{
  constructor(
    @InjectModel(TenantMemberDataModel.name, 'TenantsConnection')
    model: Model<TenantMemberDataModel>,
    @InjectConnection('TenantsConnection')
    connection: Connection,
    mapper: TenantMemberMapper,
  ) {
    super(model, connection, mapper);
  }

  async findByTenantAndUser(tenantId: string, userId: string): Promise<Option<TenantMember>> {
    const doc = await this.model
      .findOne({ tenantId, userId, isDeleted: { $ne: true } })
      .lean()
      .exec();

    return doc ? Some(this.mapper.toDomain(doc)) : None;
  }

  findActiveTenantIdsByUserId(userId: string): Promise<string[]> {
    return this.model
      .distinct('tenantId', {
        userId,
        status: TenantMemberStatus.ACTIVE,
        isDeleted: { $ne: true },
      })
      .exec();
  }

  async exists(tenantId: string, userId: string, role: TenantMemberRole): Promise<boolean> {
    const count = await this.model
      .countDocuments({ tenantId, userId, role, isDeleted: { $ne: true } })
      .exec();

    return count > 0;
  }
}
