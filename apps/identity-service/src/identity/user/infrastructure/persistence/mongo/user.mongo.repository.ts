import { Injectable, Inject } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Option, Some, None } from 'oxide.ts';

import { MongoRepositoryBase } from '@app/persistence/mongodb/mongo-repository.base';
import { User } from '../../../domain/user.entity';
import { UserDataModel } from './user.schema';
import { UserMapper } from './user.mapper';

import { TYPES } from '@app/shared-kernel';
import { RequestContextAccessor } from '@app/context';

@Injectable()
export class UserRepository extends MongoRepositoryBase<
  User,
  UserDataModel
> {
  constructor(
    @InjectModel(UserDataModel.name, 'IdentityConnection')
    model: Model<UserDataModel>,

    @InjectConnection('IdentityConnection')
    connection: Connection,

    mapper: UserMapper,

    @Inject(TYPES.RequestContextAccessor)
    private readonly requestContext: RequestContextAccessor,
  ) {
    super(model, connection, mapper);
  }

  /** ✅ OVERRIDDEN JUST FOR VERIFICATION */
  async findById(id: string): Promise<Option<User>> {
    const ctx = this.requestContext.get();

    console.log('REPO findById CONTEXT →', {
      correlationId: ctx.correlationId,
      phoneNumber: ctx.phoneNumber,
      userId: ctx.userId,
      tenantId: ctx.tenantId,
    });

    const doc = await this.model
      .findById(id)
      .lean()
      .exec();

    return doc
      ? Some(this.mapper.toDomain(doc))
      : None;
  }

    async findByPhoneNumber(
    phoneNumber: string,
  ): Promise<Option<User>> {

    const ctx = this.requestContext.get();

    console.log('REPO CONTEXT →', {
      correlationId: ctx.correlationId,
      phoneNumber: ctx.phoneNumber,
      userId: ctx.userId,
      tenantId: ctx.tenantId,
    });

    const doc = await this.model
      .findOne({ phoneNumber })
      .lean()
      .exec();

    return doc
      ? Some(this.mapper.toDomain(doc))
      : None;
  }
}
