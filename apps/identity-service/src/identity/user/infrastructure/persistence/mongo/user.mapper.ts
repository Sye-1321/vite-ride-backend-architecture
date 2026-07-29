import { Injectable } from '@nestjs/common';
import { MongoMapper } from '@app/persistence/mongodb/mongo-mapper.interface';
import { User } from '../../../domain/user.entity';
import { UserDataModel } from './user.schema';
import { AuditMapper } from '@app/audit';

@Injectable()
export class UserMapper implements MongoMapper<User, UserDataModel> {
  toPersistence(entity: User): UserDataModel {
    const props = entity.getProps();

    return {
      ...AuditMapper.toPersistence(props.audit),
      _id: entity.id,
      phoneNumber: props.phoneNumber,
      firstName: props.firstName,
      lastName: props.lastName,
      passwordHash: props.passwordHash,
      status: props.status,
      refreshTokenHash: props.refreshTokenHash,
    };
  }

  toDomain(doc: UserDataModel): User {
    return User.rehydrate(
      {
        phoneNumber: doc.phoneNumber,
        firstName: doc.firstName,
        lastName: doc.lastName,
        passwordHash: doc.passwordHash,
        status: doc.status,
        refreshTokenHash: doc.refreshTokenHash,
        audit: AuditMapper.toDomain(doc),
      },
      doc._id!,
    );
  }
}
