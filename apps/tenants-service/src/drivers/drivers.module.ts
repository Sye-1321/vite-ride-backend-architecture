import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { TYPES } from '@app/shared-kernel';

import { MembershipModule } from '../membership/membership.module';
import { TenantModule } from '../tenants/tenants.module';
import { UsersModule } from '../users/users.module';
import { DriverCommandHandlers, DriverQueryHandlers } from './application';
import {
  DriverMapper,
  DriverMongoRepository,
  MongoDriverRegistrationAdapter,
} from './infrastructure/persistence';
import { DRIVER_REGISTRATION_PORT } from './application/ports';
import { DriverDataModel, DriverSchema } from './infrastructure/persistence/mongo/driver.schema';

@Module({
  imports: [
    CqrsModule,
    TenantModule,
    MembershipModule,
    UsersModule,
    MongooseModule.forFeature(
      [{ name: DriverDataModel.name, schema: DriverSchema }],
      'TenantsConnection',
    ),
  ],
  providers: [
    ...DriverCommandHandlers,
    ...DriverQueryHandlers,
    DriverMapper,
    {
      provide: DRIVER_REGISTRATION_PORT,
      useClass: MongoDriverRegistrationAdapter,
    },
    {
      provide: TYPES.DriverRepositoryPort,
      useClass: DriverMongoRepository,
    },
  ],
  exports: [TYPES.DriverRepositoryPort],
})
export class DriverModule {}
