import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { None, Option, Some } from 'oxide.ts';

import { MongoRepositoryBase } from '@app/persistence/mongodb/mongo-repository.base';

import { User } from '../../../domain/user.entity';
import { UserMapper } from './user.mapper';
import { UserDataModel } from './user.schema';

@Injectable()
export class UserRepository extends MongoRepositoryBase<User, UserDataModel> {
  constructor(
    @InjectModel(UserDataModel.name, 'IdentityConnection')
    model: Model<UserDataModel>,

    @InjectConnection('IdentityConnection')
    connection: Connection,

    mapper: UserMapper,
  ) {
    super(model, connection, mapper);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Option<User>> {
    const doc = await this.model.findOne({ phoneNumber }).lean().exec();

    return doc ? Some(this.mapper.toDomain(doc)) : None;
  }
}
