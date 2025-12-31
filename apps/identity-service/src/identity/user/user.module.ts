import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { JwtAuthModule } from '../../../../../libs/auth/jwt/jwt-auth.module';
import { VerificationSessionModule } from '../verification-session/verification-session.module';
import { TYPES } from '@app/shared-kernel';

import { UserCommandHandlers, UserQueryHandlers } from './application/cqrs';
import { UserMapper, UserRepository } from './infrastructure/persistence';
import {
  UserDataModel,
  UserSchema,
} from './infrastructure/persistence/mongo/user.schema';
import { UserGrpcController } from './user.grpc.controller';
import { MicroserviceContextModule } from '@app/context';

@Module({
  imports: [
    CqrsModule,
    MicroserviceContextModule,
    JwtAuthModule,
    VerificationSessionModule,

    MongooseModule.forFeature(
      [{ name: UserDataModel.name, schema: UserSchema }],
      'IdentityConnection', 
    ),
  ],
  providers: [
    ...UserCommandHandlers,
    ...UserQueryHandlers,
     UserMapper,
    {
      provide: TYPES.UserRepositoryPort,
      useClass: UserRepository,
    },
  ],
  controllers: [UserGrpcController],
})
export class UserModule {}
